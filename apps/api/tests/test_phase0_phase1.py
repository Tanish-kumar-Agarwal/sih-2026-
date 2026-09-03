import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config.settings import settings
from app.security.auth import verify_password, get_password_hash

LIVE_SERVER_URL = "http://127.0.0.1:8000"

@pytest.mark.asyncio
async def test_postgresql_connection():
    """Verify PostgreSQL 16 is accessible and version query succeeds."""
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    engine = create_async_engine(db_url, echo=False)
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT version();"))
        version = res.scalar()
        assert "PostgreSQL 16" in version
    await engine.dispose()

@pytest.mark.asyncio
async def test_health_endpoint():
    """Verify /api/v1/health returns status ONLINE and database_connected True."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get("/api/v1/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ONLINE"
        assert data["database_connected"] is True
        assert "PostgreSQL 16" in data["database_engine"]

@pytest.mark.asyncio
async def test_development_personas_endpoint():
    """Verify /api/v1/context/personas returns seeded development personas."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get("/api/v1/context/personas")
        assert resp.status_code == 200
        personas = resp.json()
        assert len(personas) >= 5
        persona_ids = [p["id"] for p in personas]
        assert "stu-aarav-sharma" in persona_ids
        assert "ind-nextgen-recruiter" in persona_ids
        assert "inst-iitd-dean" in persona_ids
        assert "fac-ramesh-chandra" in persona_ids
        assert "adm-super-admin" in persona_ids

@pytest.mark.asyncio
async def test_student_profile_from_database():
    """Verify /api/v1/students/me returns seeded student record from PostgreSQL."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get(
            "/api/v1/students/me",
            headers={"X-Dev-Persona-Id": "stu-aarav-sharma"}
        )
        assert resp.status_code == 200
        student = resp.json()
        assert student["first_name"] == "Aarav"
        assert student["last_name"] == "Sharma"
        assert student["institution_name"] == "Indian Institute of Technology, Delhi"
        assert len(student["competencies"]) >= 5
        assert len(student["projects"]) >= 2

@pytest.mark.asyncio
async def test_opportunities_from_database():
    """Verify /api/v1/opportunities queries PostgreSQL table."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get("/api/v1/opportunities")
        assert resp.status_code == 200
        opps = resp.json()
        assert len(opps) >= 1
        assert opps[0]["company_name"] == "NextGen AI Labs"

@pytest.mark.asyncio
async def test_competencies_from_database():
    """Verify /api/v1/competencies queries PostgreSQL table."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get("/api/v1/competencies")
        assert resp.status_code == 200
        data = resp.json()
        comps = data["items"] if isinstance(data, dict) and "items" in data else data
        assert len(comps) >= 6
        comp_codes = [c["code"] for c in comps]
        assert "COMP-PYTHON" in comp_codes
        assert "COMP-FASTAPI" in comp_codes

@pytest.mark.asyncio
async def test_security_hardening_no_plaintext_fallback():
    """Verify plaintext password fallback was eliminated and incorrect passwords return False."""
    hashed = get_password_hash("CorrectPassword123!")
    assert verify_password("CorrectPassword123!", hashed) is True
    assert verify_password("WrongPassword!", hashed) is False
    assert verify_password("PlainTextAttempt", "PlainTextAttempt") is False
