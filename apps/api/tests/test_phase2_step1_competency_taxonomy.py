import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config.settings import settings
from app.domains.competencies.taxonomy_constants import (
    ProficiencyLevel, RequirementType, CompetencyRelationType, score_to_proficiency
)

LIVE_SERVER_URL = "http://127.0.0.1:8000"

@pytest.mark.asyncio
async def test_proficiency_scale_mapping():
    """Verify centralized proficiency helper functions."""
    assert score_to_proficiency(95.0) == ProficiencyLevel.EXPERT
    assert score_to_proficiency(85.0) == ProficiencyLevel.ADVANCED
    assert score_to_proficiency(70.0) == ProficiencyLevel.INTERMEDIATE
    assert score_to_proficiency(55.0) == ProficiencyLevel.BEGINNER
    assert score_to_proficiency(30.0) == ProficiencyLevel.FOUNDATIONAL

@pytest.mark.asyncio
async def test_canonical_domains_in_db():
    """Verify GENERAL and AYUSH domains exist in PostgreSQL 16."""
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    engine = create_async_engine(db_url, echo=False)
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT code, name FROM domains ORDER BY code;"))
        rows = res.fetchall()
        codes = [r[0] for r in rows]
        assert "GENERAL" in codes
        assert "AYUSH" in codes
    await engine.dispose()

@pytest.mark.asyncio
async def test_categories_hierarchy_in_db():
    """Verify categories are cleanly associated with domains."""
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    engine = create_async_engine(db_url, echo=False)
    async with engine.connect() as conn:
        res = await conn.execute(text("""
            SELECT c.code, d.code as domain_code 
            FROM categories c 
            JOIN domains d ON c.domain_id = d.id;
        """))
        rows = res.fetchall()
        domain_cats = {r[0]: r[1] for r in rows}
        assert domain_cats.get("CAT-SWE") == "GENERAL"
        assert domain_cats.get("CAT-DATA-AI") == "GENERAL"
        assert domain_cats.get("CAT-AYURVEDA") == "AYUSH"
        assert domain_cats.get("CAT-YOGA") == "AYUSH"
        assert domain_cats.get("CAT-PANCHAKARMA") == "AYUSH"
    await engine.dispose()

@pytest.mark.asyncio
async def test_no_self_competency_relationship_constraint():
    """Verify database check constraint blocks a competency from relating to itself."""
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    engine = create_async_engine(db_url, echo=False)
    async with engine.connect() as conn:
        with pytest.raises(Exception) as exc_info:
            await conn.execute(text("""
                INSERT INTO competency_relationships 
                (id, source_competency_id, target_competency_id, relationship_type, weight, status)
                VALUES ('crel-self-test', 'comp-python', 'comp-python', 'PREREQUISITE_FOR', 1.0, 'ACTIVE');
            """))
        assert "chk_no_self_competency_relationship" in str(exc_info.value) or "check constraint" in str(exc_info.value).lower()
    await engine.dispose()

@pytest.mark.asyncio
async def test_api_list_domains():
    """Verify GET /api/v1/competencies/domains returns GENERAL and AYUSH."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get("/api/v1/competencies/domains")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 2
        codes = [d["code"] for d in data]
        assert "GENERAL" in codes
        assert "AYUSH" in codes

@pytest.mark.asyncio
async def test_api_list_categories_filter():
    """Verify GET /api/v1/competencies/categories with domain filter."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get("/api/v1/competencies/categories?domain=AYUSH")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 3
        for c in data:
            assert c["domain_code"] == "AYUSH"

@pytest.mark.asyncio
async def test_api_list_competencies_paged():
    """Verify GET /api/v1/competencies pagination and filtering."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get("/api/v1/competencies?domain=GENERAL&limit=10")
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data
        assert data["total"] >= 6
        item_codes = [c["code"] for c in data["items"]]
        assert "COMP-PYTHON" in item_codes
        assert "COMP-FASTAPI" in item_codes

@pytest.mark.asyncio
async def test_api_competency_detail_ayush_and_relationships():
    """Verify GET /api/v1/competencies/{slug} returns skills and graph edges."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get("/api/v1/competencies/nadi-pariksha-pulse-diagnostics")
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == "COMP-NADI-PARIKSHA"
        assert data["domain_code"] == "AYUSH"
        assert len(data["skills"]) >= 2
        assert len(data["prerequisites"]) >= 1
        assert data["prerequisites"][0]["target_competency_code"] == "COMP-PANCHAKARMA"

@pytest.mark.asyncio
async def test_api_role_detail_with_requirements():
    """Verify GET /api/v1/competencies/roles/{slug} returns weighted blueprint requirements."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get("/api/v1/competencies/roles/backend-developer")
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == "ROLE-BACKEND-DEV"
        assert len(data["requirements"]) >= 4
        py_req = next(r for r in data["requirements"] if r["competency_code"] == "COMP-PYTHON")
        assert py_req["required_proficiency"] == "ADVANCED"
        assert py_req["requirement_type"] == "MUST_HAVE"
