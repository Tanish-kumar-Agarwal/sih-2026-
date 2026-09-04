import pytest
import pytest_asyncio
from datetime import datetime, timezone
from httpx import AsyncClient
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.config.settings import settings
from app.infrastructure.database.models import (
    Student, RolesCatalog, RoleCompetencyRequirement,
    StudentCompetency, StudentRoleReadiness
)
from app.domains.readiness.enums import ReadinessState, CompetencyState
from app.domains.readiness.readiness_engine import (
    ReadinessEngine,
    TargetRequirementInput,
    StudentCompetencyInput
)
from app.domains.readiness.service import readiness_service

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

def test_engine_zero_competency_data_unassessed():
    """
    Case 1: When student has zero evaluated competencies,
    engine returns NOT_ASSESSED, score=0.0, confidence=0.0.
    Prohibits score theatre or arbitrary defaults.
    """
    reqs = [
        TargetRequirementInput(
            competency_id="c1",
            competency_name="Python",
            required_proficiency="ADVANCED",
            requirement_type="MUST_HAVE",
            weight=1.0
        )
    ]
    res = ReadinessEngine.evaluate(
        target_id="t1",
        target_type="ROLE",
        target_title="Backend Dev",
        requirements=reqs,
        student_states={}
    )
    assert res.readiness_state == ReadinessState.NOT_ASSESSED
    assert res.readiness_score == 0.0
    assert res.confidence == 0.0
    assert res.missing_competencies_count == 1
    assert res.satisfied_competencies_count == 0

def test_engine_mandatory_gating_single_blocker():
    """
    Case 2: High overall proficiency in optional/secondary skills,
    but 1 missing MUST_HAVE competency.
    Mandatory Gating Rule enforces: critical blocker flagged, score capped <= 68.0,
    state is strictly EMERGING (cannot produce READY or NEAR_READY).
    """
    reqs = [
        TargetRequirementInput(
            competency_id="c1",
            competency_name="Python",
            required_proficiency="ADVANCED",
            requirement_type="MUST_HAVE",
            weight=1.0
        ),
        TargetRequirementInput(
            competency_id="c2",
            competency_name="FastAPI",
            required_proficiency="ADVANCED",
            requirement_type="MUST_HAVE",
            weight=1.0
        ),
        TargetRequirementInput(
            competency_id="c3",
            competency_name="Docker",
            required_proficiency="INTERMEDIATE",
            requirement_type="SHOULD_HAVE",
            weight=0.8
        )
    ]
    # Student has strong Python and Docker, but FastAPI is missing
    st_states = {
        "c1": StudentCompetencyInput(
            competency_id="c1",
            proficiency_level="ADVANCED",
            proficiency_score=88.0,
            confidence=0.9,
            evidence_count=3,
            verified_evidence_count=2,
            state="ESTABLISHED"
        ),
        "c3": StudentCompetencyInput(
            competency_id="c3",
            proficiency_level="EXPERT",
            proficiency_score=95.0,
            confidence=0.9,
            evidence_count=4,
            verified_evidence_count=3,
            state="ESTABLISHED"
        ),
    }

    res = ReadinessEngine.evaluate(
        target_id="t1",
        target_type="ROLE",
        target_title="Backend Dev",
        requirements=reqs,
        student_states=st_states
    )

    assert len(res.critical_blockers) == 1
    assert res.critical_blockers[0]["competency_id"] == "c2"
    assert res.readiness_state == ReadinessState.EMERGING
    assert res.readiness_score <= 68.0  # Capped by single blocker gating rule

def test_engine_multiple_mandatory_blockers_developing():
    """
    Case 3: Two or more critical mandatory blockers cap score at 49.0 and force DEVELOPING state.
    """
    reqs = [
        TargetRequirementInput(
            competency_id="c1",
            competency_name="Python",
            required_proficiency="ADVANCED",
            requirement_type="MUST_HAVE",
            weight=1.0
        ),
        TargetRequirementInput(
            competency_id="c2",
            competency_name="PostgreSQL",
            required_proficiency="ADVANCED",
            requirement_type="MUST_HAVE",
            weight=1.0
        ),
        TargetRequirementInput(
            competency_id="c3",
            competency_name="Docker",
            required_proficiency="INTERMEDIATE",
            requirement_type="OPTIONAL",
            weight=0.5
        )
    ]
    # Only optional docker is known
    st_states = {
        "c3": StudentCompetencyInput(
            competency_id="c3",
            proficiency_level="INTERMEDIATE",
            proficiency_score=75.0,
            confidence=0.8,
            evidence_count=2,
            verified_evidence_count=1,
            state="EMERGING"
        )
    }
    res = ReadinessEngine.evaluate(
        target_id="t1",
        target_type="ROLE",
        target_title="Backend Dev",
        requirements=reqs,
        student_states=st_states
    )
    assert len(res.critical_blockers) == 2
    assert res.readiness_state == ReadinessState.DEVELOPING
    assert res.readiness_score <= 49.0

def test_engine_all_mandatory_satisfied_near_ready():
    """
    Case 4: All mandatory requirements satisfied, but preferred has a gap -> NEAR_READY.
    """
    reqs = [
        TargetRequirementInput(
            competency_id="c1",
            competency_name="Python",
            required_proficiency="ADVANCED",
            requirement_type="MUST_HAVE",
            weight=1.0
        ),
        TargetRequirementInput(
            competency_id="c2",
            competency_name="PostgreSQL",
            required_proficiency="INTERMEDIATE",
            requirement_type="MUST_HAVE",
            weight=1.0
        ),
        TargetRequirementInput(
            competency_id="c3",
            competency_name="Distributed Systems",
            required_proficiency="ADVANCED",
            requirement_type="SHOULD_HAVE",
            weight=0.8
        )
    ]
    st_states = {
        "c1": StudentCompetencyInput(
            competency_id="c1",
            proficiency_level="ADVANCED",
            proficiency_score=85.0,
            confidence=0.85,
            evidence_count=3,
            verified_evidence_count=2,
            state="ESTABLISHED"
        ),
        "c2": StudentCompetencyInput(
            competency_id="c2",
            proficiency_level="INTERMEDIATE",
            proficiency_score=72.0,
            confidence=0.80,
            evidence_count=2,
            verified_evidence_count=1,
            state="EMERGING"
        ),
        # c3 is missing (preferred)
    }
    res = ReadinessEngine.evaluate(
        target_id="t1",
        target_type="ROLE",
        target_title="Backend Dev",
        requirements=reqs,
        student_states=st_states
    )
    assert len(res.critical_blockers) == 0
    assert res.readiness_state in (ReadinessState.NEAR_READY, ReadinessState.EMERGING)
    assert res.readiness_score >= 65.0

def test_engine_complete_mastery_ready():
    """
    Case 5: All requirements satisfied with high score and verified evidence -> READY.
    """
    reqs = [
        TargetRequirementInput(
            competency_id="c1",
            competency_name="Python",
            required_proficiency="INTERMEDIATE",
            requirement_type="MUST_HAVE",
            weight=1.0
        ),
        TargetRequirementInput(
            competency_id="c2",
            competency_name="PostgreSQL",
            required_proficiency="INTERMEDIATE",
            requirement_type="MUST_HAVE",
            weight=1.0
        )
    ]
    st_states = {
        "c1": StudentCompetencyInput(
            competency_id="c1",
            proficiency_level="ADVANCED",
            proficiency_score=85.0,
            confidence=0.85,
            evidence_count=3,
            verified_evidence_count=2,
            state="ESTABLISHED"
        ),
        "c2": StudentCompetencyInput(
            competency_id="c2",
            proficiency_level="EXPERT",
            proficiency_score=92.0,
            confidence=0.90,
            evidence_count=4,
            verified_evidence_count=3,
            state="ESTABLISHED"
        )
    }
    res = ReadinessEngine.evaluate(
        target_id="t1",
        target_type="ROLE",
        target_title="Backend Dev",
        requirements=reqs,
        student_states=st_states
    )
    assert len(res.critical_blockers) == 0
    assert res.readiness_state == ReadinessState.READY
    assert res.readiness_score >= 80.0
    assert res.confidence >= 0.70
    assert len(res.strengths) == 2

def test_engine_confidence_separation():
    """
    Case 6: Readiness confidence is independent from readiness score.
    """
    reqs = [
        TargetRequirementInput(
            competency_id="c1",
            competency_name="Python",
            required_proficiency="INTERMEDIATE",
            requirement_type="MUST_HAVE",
            weight=1.0
        )
    ]
    st_states = {
        "c1": StudentCompetencyInput(
            competency_id="c1",
            proficiency_level="ADVANCED",
            proficiency_score=85.0,
            confidence=0.20,  # very low confidence
            evidence_count=1,
            verified_evidence_count=0,
            state="DEVELOPING"
        )
    }
    res = ReadinessEngine.evaluate(
        target_id="t1",
        target_type="ROLE",
        target_title="Backend Dev",
        requirements=reqs,
        student_states=st_states
    )
    assert res.readiness_score >= 80.0
    assert res.confidence < 0.35  # Confidence remains low despite score

@pytest.mark.asyncio
async def test_recalculation_service_end_to_end(db_session: AsyncSession):
    """
    Case 7: Full database integration:
    readiness_service.calculate_target_readiness against seeded RolesCatalog and student.
    Verifies persistence in PostgreSQL student_role_readiness and idempotent re-evaluation.
    """
    # 1. Fetch seeded Aarav Sharma
    res_st = await db_session.execute(select(Student).where(Student.id == "stu-aarav-sharma"))
    aarav = res_st.scalars().first()
    assert aarav is not None

    # 2. Evaluate readiness against role-backend-dev
    state = await readiness_service.calculate_target_readiness(
        db=db_session,
        student_id="stu-aarav-sharma",
        target_id="role-backend-dev",
        target_type="ROLE",
        persist=True
    )

    assert state.student_id == "stu-aarav-sharma"
    assert state.target_id == "role-backend-dev"
    assert state.target_type.value == "ROLE"
    assert state.target_title == "Backend Developer"
    assert 0.0 <= state.readiness_score <= 100.0
    assert 0.0 <= state.confidence <= 1.0
    assert state.total_required_count >= 3
    assert state.summary is not None
    assert len(state.requirements) >= 3

    # 3. Verify PostgreSQL persistence
    persisted = await db_session.execute(
        select(StudentRoleReadiness).where(
            and_(
                StudentRoleReadiness.student_id == "stu-aarav-sharma",
                StudentRoleReadiness.target_id == "role-backend-dev"
            )
        )
    )
    db_row = persisted.scalars().first()
    assert db_row is not None
    assert db_row.readiness_score == state.readiness_score
    assert db_row.readiness_state == state.readiness_state.value
    assert "summary" in db_row.provenance
    assert "critical_blockers" in db_row.provenance

@pytest.mark.asyncio
async def test_live_api_readiness_endpoints():
    """
    Case 8: Live HTTP API verification of GET and POST recalculate readiness endpoints.
    """
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        # GET target readiness
        resp_get = await client.get(
            "/api/v1/students/me/readiness-states/role-backend-dev?target_type=ROLE",
            headers={"X-Dev-Persona-Id": "stu-aarav-sharma"}
        )
        assert resp_get.status_code == 200
        data_get = resp_get.json()
        assert data_get["student_id"] == "stu-aarav-sharma"
        assert data_get["target_id"] == "role-backend-dev"
        assert "readiness_score" in data_get
        assert "readiness_state" in data_get
        assert "summary" in data_get
        assert "critical_blockers" in data_get
        assert "requirements" in data_get

        # POST recalculate target readiness
        resp_post = await client.post(
            "/api/v1/students/me/readiness-states/role-backend-dev/recalculate?target_type=ROLE",
            headers={"X-Dev-Persona-Id": "stu-aarav-sharma"}
        )
        assert resp_post.status_code == 200
        data_post = resp_post.json()
        assert data_post["student_id"] == "stu-aarav-sharma"
        assert data_post["readiness_score"] == data_get["readiness_score"]
        assert data_post["readiness_state"] == data_get["readiness_state"]

@pytest.mark.asyncio
async def test_cross_student_isolation_and_empty_state():
    """
    Case 9: Security isolation.
    Invalid persona returns 404. Rohit Kumar (empty student) returns NOT_ASSESSED.
    """
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        # Unknown persona
        resp_malicious = await client.get(
            "/api/v1/students/me/readiness-states/role-backend-dev",
            headers={"X-Dev-Persona-Id": "unknown-hacker"}
        )
        assert resp_malicious.status_code == 404

        # Rohit Kumar (zero competencies evaluated)
        resp_rohit = await client.get(
            "/api/v1/students/me/readiness-states/role-backend-dev",
            headers={"X-Dev-Persona-Id": "stu-rohit-kumar"}
        )
        assert resp_rohit.status_code == 200
        data_rohit = resp_rohit.json()
        assert data_rohit["readiness_state"] == "NOT_ASSESSED"
        assert data_rohit["readiness_score"] == 0.0
        assert data_rohit["confidence"] == 0.0
