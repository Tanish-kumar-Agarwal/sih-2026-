import pytest
import pytest_asyncio
import uuid
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.config.settings import settings
from app.infrastructure.database.models import (
    Student, Competency, Evidence, EvidenceCompetency, EvidenceArtifact,
    CompetencyAssessment, AssessmentResult, StudentCompetency, StudentCompetencyStateHistory,
    gen_uuid, utc_now
)
from app.domains.readiness.enums import CompetencyState, EvidenceStrengthLevel
from app.domains.readiness.aggregation_engine import (
    ProficiencyAggregationEngine, EvidenceInputItem, AssessmentInputItem
)
from app.domains.readiness.service import readiness_service
from app.domains.competencies.taxonomy_constants import ProficiencyLevel

LIVE_SERVER_URL = "http://127.0.0.1:8000"

def get_test_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return create_async_engine(db_url, echo=False, poolclass=NullPool)

@pytest_asyncio.fixture
async def db_session():
    engine = get_test_engine()
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
    await engine.dispose()

def test_engine_zero_evidence_deterministic_policy():
    """
    Test 1: Zero evidence produces NOT_ASSESSED, score=0.0, confidence=0.0.
    Prohibits score theatre or arbitrary baseline numbers.
    """
    res = ProficiencyAggregationEngine.aggregate(
        evidence_items=[],
        assessment_items=[],
        experience_items=[]
    )
    assert res.proficiency_score == 0.0
    assert res.confidence == 0.0
    assert res.state == CompetencyState.NOT_ASSESSED
    assert res.proficiency_level == ProficiencyLevel.FOUNDATIONAL
    assert res.evidence_count == 0
    assert res.verified_evidence_count == 0

def test_engine_single_verified_evidence():
    """
    Test 2: Single verified evidence produces a bounded, deterministic proficiency.
    """
    now = datetime.now(timezone.utc)
    item = EvidenceInputItem(
        mapping_id="m1",
        evidence_id="ev1",
        evidence_type="PROJECT",
        source_type="REPOSITORY",
        source_uri="https://github.com/student/project1",
        sha256_checksum="hash-1234",
        mapping_status="CONFIRMED",
        mapping_method="DIRECT_SKILL_MATCH",
        mapping_confidence=0.9,
        evidence_strength="STRONG",
        verification_status="VERIFIED",
        created_at=now
    )
    res = ProficiencyAggregationEngine.aggregate([item], reference_time=now)
    # Strong evidence base score is ~82, verified
    assert 70.0 <= res.proficiency_score <= 90.0
    assert res.proficiency_level in (ProficiencyLevel.INTERMEDIATE, ProficiencyLevel.ADVANCED)
    assert 0.4 <= res.confidence <= 0.8  # 1 source cannot manufacture 1.0 confidence
    assert res.evidence_count == 1
    assert res.verified_evidence_count == 1
    assert res.state == CompetencyState.EMERGING

def test_engine_multi_source_diversity_increases_confidence():
    """
    Test 3: Multiple independent sources yield higher confidence than a single source.
    """
    now = datetime.now(timezone.utc)
    item1 = EvidenceInputItem(
        mapping_id="m1", evidence_id="ev1", evidence_type="PROJECT", source_type="REPOSITORY",
        source_uri="https://github.com/student/project1", sha256_checksum="hash-1",
        mapping_status="CONFIRMED", mapping_method="DIRECT_SKILL_MATCH", mapping_confidence=0.9,
        evidence_strength="STRONG", verification_status="VERIFIED", created_at=now
    )
    item2 = EvidenceInputItem(
        mapping_id="m2", evidence_id="ev2", evidence_type="CERTIFICATION", source_type="DOCUMENT",
        source_uri="https://certs.org/cert-abc", sha256_checksum="hash-2",
        mapping_status="CONFIRMED", mapping_method="DIRECT_SKILL_MATCH", mapping_confidence=0.95,
        evidence_strength="STRONG", verification_status="VERIFIED", created_at=now
    )
    res_single = ProficiencyAggregationEngine.aggregate([item1], reference_time=now)
    res_multi = ProficiencyAggregationEngine.aggregate([item1, item2], reference_time=now)

    assert res_multi.confidence > res_single.confidence
    assert res_multi.evidence_count == 2
    assert res_multi.verified_evidence_count == 2

def test_engine_duplicate_artifact_prevention():
    """
    Test 4: Duplicating identical artifact/checksum does NOT artificially inflate evidence count or score.
    """
    now = datetime.now(timezone.utc)
    item1 = EvidenceInputItem(
        mapping_id="m1", evidence_id="ev1", evidence_type="PROJECT", source_type="REPOSITORY",
        source_uri="https://github.com/student/project1", sha256_checksum="identical-sha256",
        mapping_status="CONFIRMED", mapping_method="DIRECT_SKILL_MATCH", mapping_confidence=0.9,
        evidence_strength="STRONG", verification_status="VERIFIED", created_at=now
    )
    item2 = EvidenceInputItem(
        mapping_id="m2", evidence_id="ev2", evidence_type="PROJECT", source_type="DOCUMENT",
        source_uri="https://github.com/student/project1", sha256_checksum="identical-sha256",  # Same checksum!
        mapping_status="CONFIRMED", mapping_method="DIRECT_SKILL_MATCH", mapping_confidence=0.9,
        evidence_strength="STRONG", verification_status="VERIFIED", created_at=now
    )
    res_unique = ProficiencyAggregationEngine.aggregate([item1], reference_time=now)
    res_duplicate = ProficiencyAggregationEngine.aggregate([item1, item2], reference_time=now)

    # Duplicating the same artifact must NOT double the score
    assert abs(res_duplicate.proficiency_score - res_unique.proficiency_score) < 0.1
    # Clustered unique sources count remains 1
    assert res_duplicate.provenance["unique_sources_count"] == 1

def test_engine_rejected_evidence_excluded():
    """
    Test 5: Rejected evidence or rejected mapping must NEVER increase score.
    """
    now = datetime.now(timezone.utc)
    item_valid = EvidenceInputItem(
        mapping_id="m1", evidence_id="ev1", evidence_type="PROJECT", source_type="REPOSITORY",
        source_uri="https://github.com/student/p1", sha256_checksum="hash-1",
        mapping_status="CONFIRMED", mapping_method="DIRECT_SKILL_MATCH", mapping_confidence=0.85,
        evidence_strength="MODERATE", verification_status="VERIFIED", created_at=now
    )
    item_rejected = EvidenceInputItem(
        mapping_id="m2", evidence_id="ev2", evidence_type="CERTIFICATION", source_type="DOCUMENT",
        source_uri="https://fake.org/fake", sha256_checksum="hash-fake",
        mapping_status="REJECTED", mapping_method="DIRECT_SKILL_MATCH", mapping_confidence=0.99,
        evidence_strength="VERY_STRONG", verification_status="REJECTED", created_at=now
    )
    res_clean = ProficiencyAggregationEngine.aggregate([item_valid], reference_time=now)
    res_with_rejected = ProficiencyAggregationEngine.aggregate([item_valid, item_rejected], reference_time=now)

    # Rejected evidence must be completely filtered out
    assert res_with_rejected.proficiency_score == res_clean.proficiency_score
    assert res_with_rejected.evidence_count == res_clean.evidence_count

def test_engine_assessment_blending():
    """
    Test 6: Assessment results blend with evidence according to integrity score.
    """
    now = datetime.now(timezone.utc)
    item = EvidenceInputItem(
        mapping_id="m1", evidence_id="ev1", evidence_type="PROJECT", source_type="REPOSITORY",
        source_uri="https://github.com/student/p1", sha256_checksum="hash-1",
        mapping_status="CONFIRMED", mapping_method="DIRECT_SKILL_MATCH", mapping_confidence=0.85,
        evidence_strength="MODERATE", verification_status="VERIFIED", created_at=now
    )
    assessment = AssessmentInputItem(
        assessment_id="as-1", score=90.0, passed=True, integrity_score=1.0, completed_at=now
    )
    res = ProficiencyAggregationEngine.aggregate([item], [assessment], reference_time=now)

    assert res.assessment_signal == 90.0
    # Blended score reflects both moderate evidence (~65) and strong assessment (90)
    assert 70.0 <= res.proficiency_score <= 85.0

@pytest.mark.asyncio
async def test_recalculation_service_end_to_end(db_session: AsyncSession):
    """
    Test 7: Full database recalculation workflow:
    Student A has evidence -> recalculate_competency_proficiency() updates StudentCompetency and records history.
    """
    # 1. Fetch Aarav's Python competency mapping
    stmt = (
        select(EvidenceCompetency)
        .join(Evidence, EvidenceCompetency.evidence_id == Evidence.id)
        .where(
            and_(
                Evidence.student_id == "stu-aarav-sharma",
                EvidenceCompetency.competency_id == "comp-python"
            )
        )
    )
    mapping = (await db_session.execute(stmt)).scalars().first()
    assert mapping is not None

    # 2. Trigger recalculation via service
    updated_state = await readiness_service.recalculate_competency_proficiency(
        db=db_session,
        student_id="stu-aarav-sharma",
        competency_id="comp-python"
    )

    assert updated_state.student_id == "stu-aarav-sharma"
    assert updated_state.competency_id == "comp-python"
    assert updated_state.evidence_count >= 1
    assert 0.0 <= updated_state.proficiency_score <= 100.0
    assert 0.0 <= updated_state.confidence <= 1.0
    assert updated_state.algorithm_version == "v1.1.0"
    assert updated_state.provenance["algorithm_version"] == "v1.1.0"

    # 3. Verify history snapshot was recorded
    history = await readiness_service.get_state_history(
        db=db_session,
        student_id="stu-aarav-sharma",
        competency_id="comp-python"
    )
    assert len(history) >= 1
    assert history[0].algorithm_version == "v1.1.0"

@pytest.mark.asyncio
async def test_live_api_recalculate_endpoints():
    """
    Test 8: Live HTTP API verification of POST recalculation endpoints.
    Ensures ownership safety and returns recalculated canonical state.
    """
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        # Recalculate single competency
        resp = await client.post(
            "/api/v1/students/me/competency-states/comp-python/recalculate",
            headers={"X-Dev-Persona-Id": "stu-aarav-sharma"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["student_id"] == "stu-aarav-sharma"
        assert data["competency_id"] == "comp-python"
        assert data["algorithm_version"] == "v1.1.0"
        assert "provenance" in data
        assert data["provenance"]["algorithm_version"] == "v1.1.0"

        # Batch recalculate
        resp_batch = await client.post(
            "/api/v1/students/me/competency-states/recalculate",
            headers={"X-Dev-Persona-Id": "stu-aarav-sharma"}
        )
        assert resp_batch.status_code == 200
        batch_data = resp_batch.json()
        assert batch_data["student_id"] == "stu-aarav-sharma"
        assert len(batch_data["items"]) >= 1

def test_engine_experience_signal_blending():
    """
    Test 9: Experience signal ingestion and logarithmic reinforcement in aggregation engine.
    Verifies DEF-402-02 experience handling.
    """
    from app.domains.readiness.aggregation_engine import ExperienceInputItem
    exp = ExperienceInputItem(
        experience_id="exp-1",
        experience_type="INTERNSHIP",
        title="Backend Engineering Intern",
        is_verified=True,
        duration_months=6.0
    )
    res = ProficiencyAggregationEngine.aggregate(
        evidence_items=[],
        assessment_items=[],
        experience_items=[exp]
    )
    assert res.experience_signal is not None
    assert 50.0 <= res.experience_signal <= 95.0
    assert res.proficiency_score > 0.0
    assert res.state != CompetencyState.NOT_ASSESSED

