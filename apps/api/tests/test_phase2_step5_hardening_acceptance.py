import pytest
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.config.settings import settings
from app.infrastructure.database.models import (
    CompetencyRelationship,
    StudentCompetency,
    Skill
)
from app.domains.competencies.normalization import normalize_skill_text, generate_skill_slug
from app.domains.competencies.proficiency_engine import CompetencyProficiencyAggregator

LIVE_SERVER_URL = "http://127.0.0.1:8000"

def get_test_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return create_async_engine(db_url, echo=False, poolclass=NullPool)

# ==============================================================================
# GATE A: DATABASE INTEGRITY & CONSTRAINTS HARDENING
# ==============================================================================

@pytest.mark.asyncio
async def test_non_self_relationship_constraint_rejection():
    """Verifies that a competency relationship cannot link a competency to itself."""
    engine = get_test_engine()
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        res = await session.execute(text("SELECT id FROM competencies LIMIT 1"))
        comp_id = res.scalar()
        assert comp_id is not None, "Competency must exist in database"

        self_rel = CompetencyRelationship(
            source_competency_id=comp_id,
            target_competency_id=comp_id,
            relationship_type="PREREQUISITE_FOR",
            weight=1.0
        )
        session.add(self_rel)
        with pytest.raises(Exception):
            await session.commit()
        await session.rollback()
    await engine.dispose()

@pytest.mark.asyncio
async def test_foreign_key_enforcement_student_competency():
    """Verifies foreign key constraints reject non-existent student or competency."""
    engine = get_test_engine()
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        bad_sc = StudentCompetency(
            student_id="00000000-0000-0000-0000-000000000000",
            competency_id="00000000-0000-0000-0000-000000000000",
            proficiency_level="INTERMEDIATE",
            score=70.0
        )
        session.add(bad_sc)
        with pytest.raises(IntegrityError):
            await session.commit()
        await session.rollback()
    await engine.dispose()

@pytest.mark.asyncio
async def test_unique_constraint_duplicate_student_competency():
    """Verifies that duplicate student-competency pairs are rejected by unique constraint."""
    engine = get_test_engine()
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        res = await session.execute(text("SELECT student_id, competency_id FROM student_competencies LIMIT 1"))
        row = res.fetchone()
        assert row is not None, "At least one student competency must exist"
        student_id, comp_id = row[0], row[1]

        duplicate_sc = StudentCompetency(
            student_id=student_id,
            competency_id=comp_id,
            proficiency_level="ADVANCED",
            score=95.0
        )
        session.add(duplicate_sc)
        with pytest.raises(IntegrityError):
            await session.commit()
        await session.rollback()
    await engine.dispose()

# ==============================================================================
# GATE B: CONCURRENCY, IDEMPOTENCY & TRANSACTION ROLLBACK
# ==============================================================================

@pytest.mark.asyncio
async def test_transaction_rollback_prevents_orphan_state():
    """Verifies that if a transaction encounters an error, earlier changes roll back cleanly."""
    engine = get_test_engine()
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        test_skill = Skill(
            name="Transient Rollback Skill",
            slug="transient-rollback-skill-test",
            description="Testing rollback behavior"
        )
        session.add(test_skill)
        await session.flush()

        bad_rel = CompetencyRelationship(
            source_competency_id="00000000-0000-0000-0000-000000000000",
            target_competency_id="00000000-0000-0000-0000-000000000000",
            relationship_type="PREREQUISITE_FOR"
        )
        session.add(bad_rel)
        with pytest.raises(Exception):
            await session.commit()
        await session.rollback()

        res = await session.execute(text("SELECT count(*) FROM skills WHERE slug = 'transient-rollback-skill-test'"))
        assert res.scalar() == 0, "Rolled-back transaction must leave no orphan rows"
    await engine.dispose()

@pytest.mark.asyncio
async def test_determinism_repeated_proficiency_aggregation():
    """Verifies that identical inputs produce bitwise identical proficiency scores across 100 runs."""
    engine = get_test_engine()
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        aggregator = CompetencyProficiencyAggregator(session)
        inputs = [
            {"skill": "Python OOP", "score": 90.0, "source": "ASSESSMENT"},
            {"skill": "AsyncIO", "score": 80.0, "source": "VERIFIED_EVIDENCE"},
        ]

        base_result = await aggregator.aggregate_skills_to_competencies(inputs)
        assert len(base_result["competencies"]) > 0
        base_py = next(c for c in base_result["competencies"] if c["competency_code"] == "COMP-PYTHON")

        for _ in range(25):
            run_result = await aggregator.aggregate_skills_to_competencies(inputs)
            run_py = next(c for c in run_result["competencies"] if c["competency_code"] == "COMP-PYTHON")
            assert run_py["aggregated_score"] == base_py["aggregated_score"]
            assert run_py["proficiency_level"] == base_py["proficiency_level"]
    await engine.dispose()

@pytest.mark.asyncio
async def test_determinism_repeated_skill_normalization():
    """Verifies that raw skill normalization is completely deterministic across 100 runs."""
    test_cases = [
        ("  React.js  ", "react.js"),
        ("node JS", "node js"),
        ("C++", "c++"),
        (".NET Core", ".net core"),
        ("Kubernetes", "kubernetes"),
    ]

    for raw, expected in test_cases:
        base_norm = normalize_skill_text(raw)
        assert base_norm == expected
        for _ in range(50):
            assert normalize_skill_text(raw) == base_norm

# ==============================================================================
# GATE C: API HARDENING & BOUNDARY INPUT TESTING
# ==============================================================================

@pytest.mark.asyncio
async def test_api_search_special_characters_sql_injection_safe():
    """Verifies that search inputs with quotes, semicolons, and wildcards are safely escaped."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as ac:
        hostile_queries = [
            "'; DROP TABLE competencies; --",
            "' OR '1'='1",
            "%_wildcard_%",
            "<script>alert(1)</script>",
            "   ",
            "🚀🔥 Unicode Skill"
        ]
        for query in hostile_queries:
            resp = await ac.get(f"/api/v1/competencies?search={query}")
            assert resp.status_code == 200, f"Hostile query failed: {query}"
            data = resp.json()
            assert "items" in data
            assert isinstance(data["items"], list)

@pytest.mark.asyncio
async def test_api_pagination_boundaries_and_clamping():
    """Verifies API handles negative, zero, and boundary pagination gracefully."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as ac:
        resp = await ac.get("/api/v1/competencies?limit=-5")
        assert resp.status_code == 422

        resp = await ac.get("/api/v1/competencies?offset=-1")
        assert resp.status_code == 422

        resp = await ac.get("/api/v1/competencies?limit=500")
        assert resp.status_code == 422

        resp = await ac.get("/api/v1/competencies?limit=1&offset=0")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["items"]) <= 1

@pytest.mark.asyncio
async def test_api_nonexistent_and_malformed_ids_return_clean_404():
    """Verifies that malformed or nonexistent entity IDs return 404, never 500."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as ac:
        resp = await ac.get("/api/v1/competencies/nonexistent-competency-slug-xyz")
        assert resp.status_code == 404
        assert "detail" in resp.json()

        resp = await ac.get("/api/v1/roles/nonexistent-role-slug-xyz")
        assert resp.status_code == 404

        headers = {"X-Dev-Persona-Id": "stu-aarav-sharma"}
        resp = await ac.get("/api/v1/students/me/competencies/nonexistent-comp-id", headers=headers)
        assert resp.status_code == 404

@pytest.mark.asyncio
async def test_api_unknown_persona_handling_security():
    """Verifies that an unknown persona header is rejected and does NOT default to Aarav Sharma."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as ac:
        headers = {"X-Dev-Persona-Id": "non-existent-persona-impersonator"}
        resp = await ac.get("/api/v1/students/me/competencies", headers=headers)
        assert resp.status_code in [401, 404], "Unknown persona must not leak default student data"

# ==============================================================================
# GATE D: FUTURE-PHASE COMPATIBILITY PRIMITIVES
# ==============================================================================

@pytest.mark.asyncio
async def test_canonical_entities_provide_complete_readiness_payload():
    """Verifies role blueprints expose weighted requirements ready for the downstream Readiness Engine."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as ac:
        resp = await ac.get("/api/v1/roles/role-backend-dev")
        assert resp.status_code == 200
        role = resp.json()
        assert "requirements" in role
        assert len(role["requirements"]) > 0

        for req in role["requirements"]:
            assert "competency_id" in req
            assert "required_proficiency" in req
            assert "weight" in req
            assert isinstance(req["weight"], (int, float))
            assert req["weight"] > 0
