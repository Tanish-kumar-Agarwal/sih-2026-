import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select, func
from app.config.settings import settings
from app.infrastructure.database.models import StudentCompetency

LIVE_SERVER_URL = "http://127.0.0.1:8000"

@pytest.mark.asyncio
async def test_persona_isolation_aarav_sharma():
    """Verify stu-aarav-sharma returns Software & AI competencies."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get(
            "/api/v1/students/me/competencies",
            headers={"X-Dev-Persona-Id": "stu-aarav-sharma"}
        )
        assert resp.status_code == 200
        data = resp.json()
        items = data["items"]
        assert len(items) >= 5
        comp_codes = [c["competency_code"] for c in items]
        assert "COMP-PYTHON" in comp_codes
        assert "COMP-FASTAPI" in comp_codes
        # Should NOT contain AYUSH competencies
        assert "COMP-NADI-PARIKSHA" not in comp_codes


@pytest.mark.asyncio
async def test_persona_isolation_priya_patel_ayush():
    """Verify stu-priya-patel returns AYUSH competencies and no SWE competencies."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get(
            "/api/v1/students/me/competencies",
            headers={"X-Dev-Persona-Id": "stu-priya-patel"}
        )
        assert resp.status_code == 200
        data = resp.json()
        items = data["items"]
        assert len(items) >= 3
        comp_codes = [c["competency_code"] for c in items]
        assert "COMP-NADI-PARIKSHA" in comp_codes
        assert "COMP-DRAVYAGUNA" in comp_codes
        # Should NOT contain Aarav's general competencies
        assert "COMP-PYTHON" not in comp_codes
        assert "COMP-FASTAPI" not in comp_codes


@pytest.mark.asyncio
async def test_truthful_empty_state_rohit_kumar():
    """Verify stu-rohit-kumar returns truthful empty list without fabrication."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get(
            "/api/v1/students/me/competencies",
            headers={"X-Dev-Persona-Id": "stu-rohit-kumar"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 0
        assert data["items"] == []
        assert data["page"] == 1


@pytest.mark.asyncio
async def test_competency_detail_lookup():
    """Verify /me/competencies/{id_or_slug} returns deep details with supporting skills and graph edges."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get(
            "/api/v1/students/me/competencies/python-engineering",
            headers={"X-Dev-Persona-Id": "stu-aarav-sharma"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["competency_code"] == "COMP-PYTHON"
        assert data["competency_name"] == "Python Engineering"
        assert len(data["supporting_skills"]) >= 2
        # Verify prerequisite relationship
        prereq_targets = [p["target_competency_code"] for p in data["prerequisites"]]
        assert "COMP-FASTAPI" in prereq_targets


@pytest.mark.asyncio
async def test_competency_detail_nonexistent_returns_404():
    """Verify lookup of unassigned or nonexistent competency returns 404."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get(
            "/api/v1/students/me/competencies/nonexistent-competency-xyz",
            headers={"X-Dev-Persona-Id": "stu-aarav-sharma"}
        )
        assert resp.status_code == 404


@pytest.mark.asyncio
async def test_deterministic_derivation_and_idempotency():
    """Verify /me/competencies/derive calculates from demonstrated skills and is idempotent."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        # First call: derive
        resp1 = await client.post(
            "/api/v1/students/me/competencies/derive",
            headers={"X-Dev-Persona-Id": "stu-aarav-sharma"},
            json={"include_projects": True}
        )
        assert resp1.status_code == 200
        data1 = resp1.json()
        assert data1["student_id"] == "stu-aarav-sharma"
        assert data1["total_competencies"] >= 5

        # Second call: derive again with same data - must be idempotent (0 newly derived)
        resp2 = await client.post(
            "/api/v1/students/me/competencies/derive",
            headers={"X-Dev-Persona-Id": "stu-aarav-sharma"},
            json={"include_projects": True}
        )
        assert resp2.status_code == 200
        data2 = resp2.json()
        assert data2["derived_count"] == 0  # Nothing new created, updated existing
        assert data2["total_competencies"] == data1["total_competencies"]


@pytest.mark.asyncio
async def test_competency_graph_endpoint():
    """Verify /me/competency-graph returns node-edge graph payload."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        resp = await client.get(
            "/api/v1/students/me/competency-graph",
            headers={"X-Dev-Persona-Id": "stu-aarav-sharma"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_nodes"] >= 5
        assert data["total_edges"] >= 5
        node_types = {n["type"] for n in data["nodes"]}
        assert "competency" in node_types
        assert "domain" in node_types
        assert "skill" in node_types


@pytest.mark.asyncio
async def test_canonical_roles_catalog():
    """Verify /api/v1/roles returns canonical role blueprints and requirements."""
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as client:
        # 1. List roles
        resp = await client.get("/api/v1/roles")
        assert resp.status_code == 200
        data = resp.json()
        roles = data.get("items", data.get("roles", []))
        assert len(roles) >= 5
        slugs = [r["slug"] for r in roles]
        assert "backend-developer" in slugs
        assert "ayurvedic-clinical-specialist" in slugs

        # 2. Get role detail
        detail_resp = await client.get("/api/v1/roles/backend-developer/competencies")
        assert detail_resp.status_code == 200
        detail = detail_resp.json()
        assert detail["code"] == "ROLE-BACKEND-DEV"
        reqs = detail.get("requirements", [])
        assert len(reqs) >= 4
        comp_codes = [rc["competency_code"] for rc in reqs]
        assert "COMP-PYTHON" in comp_codes
        assert "COMP-FASTAPI" in comp_codes
