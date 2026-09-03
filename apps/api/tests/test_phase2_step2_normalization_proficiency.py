import pytest
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool
from app.config.settings import settings
from app.domains.competencies.normalization import normalize_skill_text, generate_skill_slug
from app.domains.competencies.taxonomy_constants import (
    ProficiencyLevel, ProficiencySource, ResolutionStatus, MatchType,
    score_to_proficiency, PROFICIENCY_NUMERIC_MAP
)
from app.domains.competencies.resolver import SkillResolutionEngine
from app.domains.competencies.proficiency_engine import CompetencyProficiencyAggregator

LIVE_SERVER_URL = "http://127.0.0.1:8000"

def get_test_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return create_async_engine(db_url, echo=False, poolclass=NullPool)

# ------------------------------------------------------------------------------
# 1. Pure Text Normalization & Invariant Tests
# ------------------------------------------------------------------------------

def test_normalize_empty_and_whitespace():
    assert normalize_skill_text(None) == ""
    assert normalize_skill_text("") == ""
    assert normalize_skill_text("   ") == ""
    assert normalize_skill_text("\t\n  \r\n") == ""

def test_normalize_whitespace_and_case():
    assert normalize_skill_text("  React JS  ") == "react js"
    assert normalize_skill_text("REACT.JS") == "react.js"
    assert normalize_skill_text("  PYTHON   OOP  ") == "python oop"

def test_normalize_semantic_token_preservation():
    """Ensure programming language symbols are strictly preserved."""
    assert normalize_skill_text("C++") == "c++"
    assert normalize_skill_text("c++") == "c++"
    assert normalize_skill_text("C#") == "c#"
    assert normalize_skill_text(".NET") == ".net"
    assert normalize_skill_text(".NET Core") == ".net core"
    assert normalize_skill_text("Node.js") == "node.js"
    assert normalize_skill_text("Vue.js") == "vue.js"
    assert normalize_skill_text("PL/SQL") == "pl/sql"

def test_anti_over_normalization():
    """Crucial negative test: normalization must NOT destroy semantic distinctions."""
    assert normalize_skill_text("C") != normalize_skill_text("C++")
    assert normalize_skill_text("C++") != normalize_skill_text("C#")
    assert normalize_skill_text("Java") != normalize_skill_text("JavaScript")
    assert normalize_skill_text("React") != normalize_skill_text("React Native")
    assert normalize_skill_text("SQL") != normalize_skill_text("PL/SQL")
    assert normalize_skill_text("AWS") != normalize_skill_text("AWS Lambda")
    assert normalize_skill_text(".NET") != normalize_skill_text(".NET 8")

def test_normalization_idempotency():
    """Invariant: normalize(normalize(x)) == normalize(x)"""
    test_cases = [
        "ReactJS",
        "  react.js  ",
        "C++ Developer",
        "C# / .NET Core",
        "Node.js Backend",
        "Nadi Pariksha (Pulse Diagnostics)",
        "Dravyaguna - Herbal Pharmacology",
        "Docker & Multi-Stage Containers",
        "PostgreSQL 16 Index Tuning",
        "Asynchronous I/O & Coroutines"
    ]
    for tc in test_cases:
        norm1 = normalize_skill_text(tc)
        norm2 = normalize_skill_text(norm1)
        assert norm1 == norm2, f"Idempotency violated for '{tc}': '{norm1}' != '{norm2}'"

def test_generate_skill_slug():
    assert generate_skill_slug("C++") == "cpp"
    assert generate_skill_slug("C#") == "csharp"
    assert generate_skill_slug(".NET Core") == "dotnet-core"
    assert generate_skill_slug("React.js") == "react-js"
    assert generate_skill_slug("Nadi Pariksha") == "nadi-pariksha"

# ------------------------------------------------------------------------------
# 2. Database & Engine-Level Resolution Tests
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_resolver_canonical_and_alias_resolution():
    engine = get_test_engine()
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        res_engine = SkillResolutionEngine(session)

        # 1. Exact canonical slug
        r_slug = await res_engine.resolve_one("python-oop")
        assert r_slug["status"] == ResolutionStatus.RESOLVED.value
        assert r_slug["skill"]["name"] == "Python OOP & Metaprogramming"

        # 2. Exact alias: "ReactJS" -> "sk-react-rsc"
        r_alias1 = await res_engine.resolve_one("ReactJS")
        assert r_alias1["status"] == ResolutionStatus.RESOLVED.value
        assert r_alias1["match_type"] == MatchType.ALIAS_EXACT.value
        assert r_alias1["skill"]["id"] == "sk-react-rsc"

        # 3. Normalized alias: "react-js"
        r_alias2 = await res_engine.resolve_one("react-js")
        assert r_alias2["status"] == ResolutionStatus.RESOLVED.value
        assert r_alias2["match_type"] in [MatchType.ALIAS_NORMALIZED.value, MatchType.ALIAS_EXACT.value]
        assert r_alias2["skill"]["id"] == "sk-react-rsc"

        # 4. AYUSH alias: "Pulse Reading" -> "sk-pulse-rhythm"
        r_ayush = await res_engine.resolve_one("Pulse Reading")
        assert r_ayush["status"] == ResolutionStatus.RESOLVED.value
        assert r_ayush["skill"]["id"] == "sk-pulse-rhythm"
        assert r_ayush["skill"]["domain_code"] == "AYUSH"

        # 5. AYUSH alias: "Nadi Parikshan" -> "sk-pulse-rhythm"
        r_np = await res_engine.resolve_one("Nadi Parikshan")
        assert r_np["status"] == ResolutionStatus.RESOLVED.value
        assert r_np["skill"]["id"] == "sk-pulse-rhythm"

        # 6. Unresolved skill: must NOT create new records
        r_unknown = await res_engine.resolve_one("Quantum Quantum HyperLedger 9000")
        assert r_unknown["status"] == ResolutionStatus.UNRESOLVED.value
        assert r_unknown["skill"] is None
    await engine.dispose()

@pytest.mark.asyncio
async def test_resolver_batch_resolution_performance():
    engine = get_test_engine()
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        res_engine = SkillResolutionEngine(session)
        batch_inputs = [
            "ReactJS",
            "python-oop",
            "FastAPI REST",
            "NonexistentQuantumSkill",
            "Pulse Diagnostics",
            "Postgres DB"
        ]
        result = await res_engine.resolve_batch(batch_inputs)
        assert result["total"] == 6
        assert result["resolved_count"] == 5
        assert result["unresolved_count"] == 1
        assert len(result["items"]) == 6

        # Check input order preservation
        assert result["items"][0]["input"] == "ReactJS"
        assert result["items"][0]["status"] == ResolutionStatus.RESOLVED.value
        assert result["items"][3]["input"] == "NonexistentQuantumSkill"
        assert result["items"][3]["status"] == ResolutionStatus.UNRESOLVED.value
    await engine.dispose()

@pytest.mark.asyncio
async def test_alias_unique_constraint_at_database_level():
    """Negative test: PostgreSQL constraint uq_skill_alias_normalized must reject duplicate normalized aliases."""
    engine = get_test_engine()
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        # Attempt to insert an alias whose normalized form already exists ("reactjs")
        with pytest.raises(Exception) as excinfo:
            await session.execute(text("""
                INSERT INTO skill_aliases (id, skill_id, alias_name, normalized_alias, source_type, status)
                VALUES ('al-dup-test', 'sk-react-rsc', 'ReactJS Clone', 'reactjs', 'SYSTEM', 'ACTIVE');
            """))
            await session.commit()
        assert "uq_skill_alias_normalized" in str(excinfo.value) or "duplicate key" in str(excinfo.value)
    await engine.dispose()

# ------------------------------------------------------------------------------
# 3. Deterministic Proficiency Aggregation Tests
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_competency_proficiency_aggregation():
    engine = get_test_engine()
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        aggregator = CompetencyProficiencyAggregator(session)
        inputs = [
            {
                "skill": "Python OOP",  # resolves to sk-py-oop
                "score": 90.0,
                "source": "ASSESSMENT"
            },
            {
                "skill": "AsyncIO",     # resolves to sk-async-io
                "score": 80.0,
                "source": "VERIFIED_EVIDENCE"
            },
            {
                "skill": "CompletelyFakeSkill",  # unresolved
                "score": 100.0,
                "source": "SELF_REPORTED"
            }
        ]
        res = await aggregator.aggregate_skills_to_competencies(inputs)
        assert len(res["competencies"]) > 0
        assert "CompletelyFakeSkill" in res["unresolved_skills"]

        # Find Python Engineering competency
        py_comp = next((c for c in res["competencies"] if c["competency_code"] == "COMP-PYTHON"), None)
        assert py_comp is not None
        # Formula: (90*1.0 + 80*0.95) / (1.0 + 0.95) = (90 + 76) / 1.95 = 166 / 1.95 = 85.13
        assert 84.0 <= py_comp["aggregated_score"] <= 86.0
        assert py_comp["proficiency_level"] == ProficiencyLevel.ADVANCED.value
        # Precedence: VERIFIED_EVIDENCE > ASSESSMENT
        assert py_comp["dominant_source"] == ProficiencySource.VERIFIED_EVIDENCE.value
        assert py_comp["primary_skills_covered"] >= 2
    await engine.dispose()

# ------------------------------------------------------------------------------
# 4. API Endpoint Integration Tests (Hit Live Server)
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_api_resolve_skill_endpoint():
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as ac:
        # 1. Resolve ReactJS
        resp = await ac.post("/api/v1/skills/resolve", json={"skill": "ReactJS"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "RESOLVED"
        assert data["match_type"] == "ALIAS_EXACT"
        assert data["skill"]["id"] == "sk-react-rsc"

        # 2. Resolve unknown skill
        resp_unk = await ac.post("/api/v1/skills/resolve", json={"skill": "UnrecognizedQuantumSkill"})
        assert resp_unk.status_code == 200
        data_unk = resp_unk.json()
        assert data_unk["status"] == "UNRESOLVED"
        assert data_unk["skill"] is None

@pytest.mark.asyncio
async def test_api_resolve_batch_endpoint():
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as ac:
        resp = await ac.post("/api/v1/skills/resolve-batch", json={
            "skills": ["React", "FastAPI REST", "Pulse Reading", "UnknownXYZ"]
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 4
        assert data["resolved_count"] == 3
        assert data["unresolved_count"] == 1

@pytest.mark.asyncio
async def test_api_aggregate_proficiency_endpoint():
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as ac:
        payload = {
            "skills": [
                {"skill": "Pulse Reading", "score": 92.0, "source": "VERIFIED_EVIDENCE"},
                {"skill": "Tridosha Assessment", "score": 86.0, "source": "ASSESSMENT"}
            ]
        }
        resp = await ac.post("/api/v1/skills/aggregate-proficiency", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["competencies"]) >= 1
        comp = data["competencies"][0]
        assert comp["competency_code"] == "COMP-NADI-PARIKSHA"
        assert comp["proficiency_level"] in [ProficiencyLevel.ADVANCED.value, ProficiencyLevel.EXPERT.value]
        assert comp["dominant_source"] == "VERIFIED_EVIDENCE"

@pytest.mark.asyncio
async def test_api_get_skill_competencies_endpoint():
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as ac:
        resp = await ac.get("/api/v1/skills/python-oop/competencies")
        assert resp.status_code == 200
        data = resp.json()
        assert data["slug"] == "python-oop"
        assert len(data["competencies"]) >= 1
        assert data["competencies"][0]["competency_code"] == "COMP-PYTHON"
        assert len(data["aliases"]) >= 1
