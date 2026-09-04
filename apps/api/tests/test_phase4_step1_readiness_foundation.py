import pytest
import pytest_asyncio
import uuid
from datetime import datetime, timezone
import httpx
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.config.settings import settings
from app.main import app
from app.infrastructure.database.models import (
    Student, User, Institution, Department,
    Competency, StudentCompetency, StudentCompetencyStateHistory, StudentRoleReadiness
)
from app.domains.readiness.enums import (
    CompetencyState, ReadinessState, TargetContextType, EvidenceStrengthLevel
)
from app.domains.competencies.taxonomy_constants import ProficiencyLevel
from app.infrastructure.database.repositories.readiness_repo import ReadinessRepository
from app.domains.readiness.service import readiness_service

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

@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

LIVE_SERVER_URL = "http://127.0.0.1:8000"

@pytest.mark.asyncio
async def test_scenario_a_unassessed_student_initial_state(db_session: AsyncSession):
    """
    Scenario A: Student with no evaluated state requests competency state.
    Invariant 8: Never invent proficiency; return defined NOT_ASSESSED semantics and score=0.0.
    """
    # 1. Fetch an active competency
    stmt = select(Competency).where(Competency.status == "ACTIVE").limit(1)
    res = await db_session.execute(stmt)
    comp = res.scalars().first()
    assert comp is not None

    # 2. Query state for an arbitrary student ID with no existing record
    dummy_student_id = str(uuid.uuid4())
    state_res = await readiness_service.get_canonical_competency_state(
        db=db_session,
        student_id=dummy_student_id,
        competency_id=comp.id
    )

    assert state_res.student_id == dummy_student_id
    assert state_res.competency_id == comp.id
    assert state_res.state == CompetencyState.NOT_ASSESSED
    assert state_res.proficiency_score == 0.0
    assert state_res.confidence == 0.0
    assert state_res.proficiency_level == ProficiencyLevel.FOUNDATIONAL
    assert state_res.evidence_count == 0
    assert state_res.verified_evidence_count == 0
    assert state_res.provenance["initialized"] is True

@pytest.mark.asyncio
async def test_scenario_b_canonical_state_relationships(db_session: AsyncSession):
    """
    Scenario B: Student has evaluated competency state.
    Verifies FK integrity, separation of proficiency vs confidence vs evidence coverage.
    """
    # 1. Find a student who already has competencies
    stmt = (
        select(StudentCompetency)
        .join(Competency)
        .join(Student)
        .limit(1)
    )
    res = await db_session.execute(stmt)
    sc = res.scalars().first()
    assert sc is not None

    state_res = await readiness_service.get_canonical_competency_state(
        db=db_session,
        student_id=sc.student_id,
        competency_id=sc.competency_id
    )

    assert state_res.student_id == sc.student_id
    assert state_res.competency_id == sc.competency_id
    assert state_res.competency is not None
    assert state_res.competency.name is not None
    assert state_res.algorithm_version in ("v1.0.0", "v1.1.0")
    assert state_res.taxonomy_version == "v1.0.0"
    # Proficiency and confidence must have independent semantics (Invariant 4)
    assert 0.0 <= state_res.proficiency_score <= 100.0
    assert 0.0 <= state_res.confidence <= 1.0

@pytest.mark.asyncio
async def test_scenario_c_cross_student_isolation():
    """
    Scenario C: Student isolation and security enforcement.
    Endpoint derives identity from X-Dev-Persona-Id server-side; cross-student leakage impossible.
    """
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        # 1. Query Aarav Sharma's competency states
        resp_aarav = await client.get(
            "/api/v1/students/me/competency-states",
            headers={"X-Dev-Persona-Id": "stu-aarav-sharma"}
        )
        assert resp_aarav.status_code == 200
        aarav_data = resp_aarav.json()
        aarav_student_id = aarav_data["student_id"]

        # 2. Query Rohit Kumar's competency states (empty/different student)
        resp_rohit = await client.get(
            "/api/v1/students/me/competency-states",
            headers={"X-Dev-Persona-Id": "stu-rohit-kumar"}
        )
        assert resp_rohit.status_code == 200
        rohit_data = resp_rohit.json()
        rohit_student_id = rohit_data["student_id"]

        # Student IDs must be strictly distinct
        assert aarav_student_id != rohit_student_id

        # Every item returned for Aarav must belong to Aarav
        for item in aarav_data["items"]:
            assert item["student_id"] == aarav_student_id
            assert item["student_id"] != rohit_student_id

        # Non-existent persona returns 404
        resp_invalid = await client.get(
            "/api/v1/students/me/competency-states",
            headers={"X-Dev-Persona-Id": "stu-nonexistent-999"}
        )
        assert resp_invalid.status_code == 404

@pytest.mark.asyncio
async def test_scenario_d_numeric_check_constraints(db_session: AsyncSession):
    """
    Scenario D: Database constraints reject scores outside allowed ranges.
    Invariants 9 & 10: Proficiency score in [0.0, 100.0], confidence in [0.0, 1.0].
    """
    stmt = select(Student.id).limit(1)
    student_id = (await db_session.execute(stmt)).scalar()
    stmt_c = select(Competency.id).limit(1)
    comp_id = (await db_session.execute(stmt_c)).scalar()

    # Attempt to insert proficiency score > 100.0 directly into DB
    invalid_sc = StudentCompetency(
        student_id=student_id,
        competency_id=comp_id,
        score=150.0,  # Invalid: > 100.0
        confidence_score=0.8,
        state="DEVELOPING"
    )
    db_session.add(invalid_sc)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()

    # Attempt to insert confidence score > 1.0
    invalid_conf = StudentCompetency(
        student_id=student_id,
        competency_id=comp_id,
        score=80.0,
        confidence_score=1.5,  # Invalid: > 1.0
        state="DEVELOPING"
    )
    db_session.add(invalid_conf)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()

@pytest.mark.asyncio
async def test_scenario_e_duplicate_state_prevention(db_session: AsyncSession):
    """
    Scenario E: Unique constraint prevents duplicate active states for (student_id, competency_id).
    Invariant 3: A student/competency pair cannot have multiple active states.
    """
    # 1. Fetch an existing student competency
    stmt = select(StudentCompetency).limit(1)
    existing = (await db_session.execute(stmt)).scalars().first()
    assert existing is not None

    # 2. Attempt to insert duplicate
    duplicate = StudentCompetency(
        student_id=existing.student_id,
        competency_id=existing.competency_id,
        score=75.0,
        confidence_score=0.7,
        state="EMERGING"
    )
    db_session.add(duplicate)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()

@pytest.mark.asyncio
async def test_audit_history_recording(db_session: AsyncSession):
    """
    Verifies immutable state history recording (Option A auditability).
    """
    stmt = select(StudentCompetency).limit(1)
    sc = (await db_session.execute(stmt)).scalars().first()
    assert sc is not None

    repo = ReadinessRepository(db_session)
    history_entry = await repo.record_state_history(sc)
    await db_session.commit()

    assert history_entry.id is not None
    assert history_entry.student_id == sc.student_id
    assert history_entry.competency_id == sc.competency_id
    assert history_entry.score == sc.score
    assert history_entry.recorded_at is not None

    history_list = await repo.get_state_history(sc.student_id, sc.competency_id)
    assert len(history_list) >= 1
    assert any(h.id == history_entry.id for h in history_list)

@pytest.mark.asyncio
async def test_readiness_state_foundation_endpoints():
    """
    Verifies target readiness state retrieval.
    Invariant 6: Competency state != Readiness state.
    Readiness requires target context (ROLE, OPPORTUNITY, BLUEPRINT).
    """
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        # 1. Query readiness states list for Aarav
        resp = await client.get(
            "/api/v1/students/me/readiness-states",
            headers={"X-Dev-Persona-Id": "stu-aarav-sharma"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "student_id" in data
        assert "items" in data
        assert isinstance(data["items"], list)

        # 2. Query target readiness for a specific role (unassessed foundation)
        dummy_role_id = str(uuid.uuid4())
        resp_role = await client.get(
            f"/api/v1/students/me/readiness-states/{dummy_role_id}?target_type=ROLE",
            headers={"X-Dev-Persona-Id": "stu-aarav-sharma"}
        )
        assert resp_role.status_code == 200
        role_readiness = resp_role.json()
        assert role_readiness["target_id"] == dummy_role_id
        assert role_readiness["target_type"] == TargetContextType.ROLE
        assert role_readiness["readiness_state"] == ReadinessState.NOT_ASSESSED
        assert role_readiness["readiness_score"] == 0.0
        assert role_readiness["confidence"] == 0.0
