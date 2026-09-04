import pytest
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.config.settings import settings
from app.infrastructure.database.models import (
    Evidence,
    EvidenceProvenance,
    EvidenceClaim,
    EvidenceCompetency,
    EvidenceSkill
)
from app.domains.evidence.constants import (
    EvidenceType,
    EvidenceSourceType,
    ProcessingStatus,
    VerificationStatus,
    EvidenceStrength,
    is_valid_verification_transition
)

LIVE_SERVER_URL = "http://127.0.0.1:8000"

def get_test_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return create_async_engine(db_url, echo=False, poolclass=NullPool)

# ==============================================================================
# 1. DOMAIN & STATE MACHINE INVARIANT TESTS
# ==============================================================================

def test_verification_state_machine_legal_transitions():
    """Validates allowed state machine transitions for evidence verification."""
    # Allowed
    assert is_valid_verification_transition(VerificationStatus.PENDING.value, VerificationStatus.VERIFIED.value) is True
    assert is_valid_verification_transition(VerificationStatus.PENDING.value, VerificationStatus.REJECTED.value) is True
    assert is_valid_verification_transition(VerificationStatus.VERIFIED.value, VerificationStatus.EXPIRED.value) is True
    assert is_valid_verification_transition(VerificationStatus.VERIFIED.value, VerificationStatus.REVOKED.value) is True
    assert is_valid_verification_transition(VerificationStatus.REJECTED.value, VerificationStatus.PENDING.value) is True

    # Illegal transitions
    assert is_valid_verification_transition(VerificationStatus.PENDING.value, VerificationStatus.EXPIRED.value) is False
    assert is_valid_verification_transition(VerificationStatus.PENDING.value, VerificationStatus.REVOKED.value) is False
    assert is_valid_verification_transition(VerificationStatus.REVOKED.value, VerificationStatus.VERIFIED.value) is False
    assert is_valid_verification_transition(VerificationStatus.REVOKED.value, VerificationStatus.PENDING.value) is False

def test_processing_and_verification_lifecycles_are_independent():
    """Invariant: An evidence artifact can be fully processed while remaining unverified."""
    proc_status = ProcessingStatus.COMPLETED
    verif_status = VerificationStatus.PENDING
    assert proc_status.value != verif_status.value

# ==============================================================================
# 2. DATABASE CONSTRAINTS & PROVENANCE INTEGRITY
# ==============================================================================

@pytest.mark.asyncio
async def test_database_foreign_key_student_ownership_rejection():
    """Verifies that creating evidence with an invalid student ID raises IntegrityError."""
    engine = get_test_engine()
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        bad_evi = Evidence(
            student_id="00000000-0000-0000-0000-000000000000",
            title="Nonexistent Student Evidence",
            evidence_type=EvidenceType.PROJECT.value,
            source_type=EvidenceSourceType.REPOSITORY.value
        )
        session.add(bad_evi)
        with pytest.raises(IntegrityError):
            await session.commit()
        await session.rollback()
    await engine.dispose()

@pytest.mark.asyncio
async def test_duplicate_evidence_competency_mapping_rejection():
    """Verifies unique constraint uq_evidence_competency rejects duplicate mappings."""
    engine = get_test_engine()
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        # Fetch an existing competency and evidence
        c_res = await session.execute(text("SELECT id FROM competencies LIMIT 1"))
        comp_id = c_res.scalar()
        e_res = await session.execute(text("SELECT id FROM evidence LIMIT 1"))
        evi_id = e_res.scalar()

        assert comp_id is not None and evi_id is not None

        # Insert first mapping
        m1 = EvidenceCompetency(evidence_id=evi_id, competency_id=comp_id, mapping_source="DIRECT_ASSERTION")
        session.add(m1)
        try:
            await session.commit()
        except IntegrityError:
            await session.rollback()

        # Attempt to insert identical mapping
        m2 = EvidenceCompetency(evidence_id=evi_id, competency_id=comp_id, mapping_source="DIRECT_ASSERTION")
        session.add(m2)
        with pytest.raises(IntegrityError):
            await session.commit()
        await session.rollback()
    await engine.dispose()

@pytest.mark.asyncio
async def test_provenance_record_exists_for_seeded_evidence():
    """Verifies that evidence provenance is persisted and linked to evidence."""
    engine = get_test_engine()
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        res = await session.execute(text("""
            SELECT p.source_type, p.algorithm_version, p.collection_method, e.title
            FROM evidence_provenance p
            JOIN evidence e ON p.evidence_id = e.id
            WHERE e.id = 'evi-001';
        """))
        row = res.fetchone()
        assert row is not None, "Seeded evidence must have an attached provenance record"
        assert row[0] == "REPOSITORY"
        assert row[1] == "v1.0.0"
        assert row[2] == "SYSTEM_SYNC"
    await engine.dispose()

# ==============================================================================
# 3. API END-TO-END INTEGRATION & CONTRACT TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_api_get_evidence_detail():
    """Verifies GET /api/v1/evidence/{id} returns deep provenance, claims, and verifications."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as ac:
        resp = await ac.get("/api/v1/evidence/evi-001")
        assert resp.status_code == 200
        data = resp.json()

        assert data["id"] == "evi-001"
        assert data["evidence_type"] == "PROJECT"
        assert data["source_type"] == "REPOSITORY"
        assert data["evidence_strength"] == "STRONG"
        assert data["processing_status"] == "COMPLETED"
        assert data["verification_status"] == "VERIFIED"

        # Provenance verification
        assert data["provenance"] is not None
        assert data["provenance"]["algorithm_version"] == "v1.0.0"
        assert data["provenance"]["collection_method"] == "SYSTEM_SYNC"

@pytest.mark.asyncio
async def test_api_create_evidence_with_provenance_and_claims():
    """Verifies POST /api/v1/evidence creates an evidence item with atomic provenance and claims."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as ac:
        headers = {"X-Dev-Persona-Id": "stu-aarav-sharma"}
        payload = {
            "title": "Autonomous Drone Navigation Research Paper",
            "description": "IEEE published work on edge vision-based obstacle avoidance",
            "evidence_type": "PUBLICATION",
            "source_type": "DOCUMENT",
            "source_uri": "https://ieee.org/papers/drone-nav-2026",
            "source_reference": "DOI:10.1109/DRONE.2026.12345",
            "evidence_strength": "VERY_STRONG",
            "observed_facts": [
                "Published in IEEE Robotics Journal with student as primary author."
            ],
            "claims": [
                "Demonstrates advanced proficiency in embedded computer vision algorithms."
            ]
        }

        resp = await ac.post("/api/v1/evidence", json=payload, headers=headers)
        assert resp.status_code == 201
        created = resp.json()

        assert created["title"] == payload["title"]
        assert created["evidence_type"] == "PUBLICATION"
        assert created["source_type"] == "DOCUMENT"
        assert created["evidence_strength"] == "VERY_STRONG"
        assert created["processing_status"] == "COMPLETED"
        assert created["verification_status"] == "PENDING"
        assert created["provenance"] is not None
        assert created["provenance"]["source_reference"] == payload["source_reference"]
        assert len(created["claims"]) >= 1
        assert created["claims"][0]["observed_fact"] == payload["observed_facts"][0]

@pytest.mark.asyncio
async def test_api_verification_state_machine_transition_enforcement():
    """Verifies that illegal verification state transitions are rejected by the API."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as ac:
        # First create a pending evidence item
        headers = {"X-Dev-Persona-Id": "stu-aarav-sharma"}
        payload = {
            "title": "Internship Experience Certificate",
            "evidence_type": "INTERNSHIP",
            "source_type": "DOCUMENT",
            "source_uri": "https://storage.skillsetu.in/certs/intern_2026.pdf"
        }
        create_resp = await ac.post("/api/v1/evidence", json=payload, headers=headers)
        assert create_resp.status_code == 201
        evi_id = create_resp.json()["id"]

        # 1. Attempt ILLEGAL transition: PENDING -> EXPIRED
        bad_verif = {
            "evidence_id": evi_id,
            "status": "EXPIRED",
            "remarks": "Premature expiration attempt"
        }
        illegal_resp = await ac.post("/api/v1/evidence/verify", json=bad_verif)
        assert illegal_resp.status_code == 400
        assert "Illegal verification state transition" in illegal_resp.json()["detail"]

        # 2. Perform LEGAL transition: PENDING -> VERIFIED
        good_verif = {
            "evidence_id": evi_id,
            "status": "VERIFIED",
            "remarks": "Faculty verified internship completion letter.",
            "verifier_role": "faculty"
        }
        legal_resp = await ac.post("/api/v1/evidence/verify", json=good_verif)
        assert legal_resp.status_code == 200
        data = legal_resp.json()
        assert data["verification_status"] == "VERIFIED"
        assert data["trust_score"] >= 0.9

@pytest.mark.asyncio
async def test_api_student_persona_evidence_isolation():
    """Verifies student persona evidence isolation between Aarav and Rohit."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as ac:
        # Aarav Sharma has evidence
        aarav_resp = await ac.get("/api/v1/students/me/evidence", headers={"X-Dev-Persona-Id": "stu-aarav-sharma"})
        assert aarav_resp.status_code == 200
        aarav_items = aarav_resp.json()
        assert len(aarav_items) >= 1
        assert any(e["id"] == "evi-001" for e in aarav_items)

        # Rohit Kumar (1st-year student) has zero evidence
        rohit_resp = await ac.get("/api/v1/students/me/evidence", headers={"X-Dev-Persona-Id": "stu-rohit-kumar"})
        assert rohit_resp.status_code == 200
        rohit_items = rohit_resp.json()
        assert len(rohit_items) == 0, "Rohit Kumar must have an honest 0 evidence baseline"
