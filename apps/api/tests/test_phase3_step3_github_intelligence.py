import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, patch
from uuid import uuid4
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.domains.evidence.github.client import (
    parse_and_validate_github_url,
    InvalidRepositoryUrlError,
    GitHubNotFoundError,
    GitHubRateLimitError,
    GitHubForbiddenError,
    GitHubApiClient,
)
from app.domains.evidence.github.identity import identity_resolver
from app.domains.evidence.github.code_areas import code_area_analyzer
from app.domains.evidence.github.similarity import lineage_similarity_analyzer
from app.domains.evidence.github.normalizer import normalizer
from app.domains.evidence.github.schemas import GitHubAnalyzeRequestDTO
from app.domains.evidence.github.service import github_intelligence_service
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.config.settings import settings
from app.infrastructure.database.models import (
    User,
    Role,
    Student,
    Evidence,
    EvidenceProvenance,
    EvidenceClaim,
    GitHubRepository,
    GitHubRepositorySnapshot,
    GitHubLanguage,
    GitHubDependency,
    GitHubContributor,
    GitHubCommit,
    GitHubCodeArea,
    GitHubSimilarityIndicator,
)

def get_test_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return create_async_engine(db_url, echo=False, poolclass=NullPool)

@pytest_asyncio.fixture
async def async_session():
    engine = get_test_engine()
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
    await engine.dispose()

# ---------------------------------------------------------------------------
# 1. URL Validation & SSRF Hardening Tests
# ---------------------------------------------------------------------------

def test_url_validation_valid():
    owner, repo, canon = parse_and_validate_github_url("https://github.com/torvalds/linux")
    assert owner == "torvalds"
    assert repo == "linux"
    assert canon == "https://github.com/torvalds/linux"

    owner2, repo2, canon2 = parse_and_validate_github_url("https://github.com/facebook/react.git")
    assert owner2 == "facebook"
    assert repo2 == "react"
    assert canon2 == "https://github.com/facebook/react"


def test_url_validation_ssrf_rejection():
    # Non-HTTPS
    with pytest.raises(InvalidRepositoryUrlError, match="Only https://"):
        parse_and_validate_github_url("http://github.com/owner/repo")

    # Non-GitHub host
    with pytest.raises(InvalidRepositoryUrlError, match="Unsupported host"):
        parse_and_validate_github_url("https://gitlab.com/owner/repo")

    with pytest.raises(InvalidRepositoryUrlError, match="Unsupported host"):
        parse_and_validate_github_url("https://github.attacker.com/owner/repo")

    # Internal IP literal
    with pytest.raises(InvalidRepositoryUrlError):
        parse_and_validate_github_url("https://127.0.0.1/owner/repo")

    with pytest.raises(InvalidRepositoryUrlError):
        parse_and_validate_github_url("https://169.254.169.254/latest/meta-data")

    # Path traversal
    with pytest.raises(InvalidRepositoryUrlError):
        parse_and_validate_github_url("https://github.com/../etc/passwd")

    # Empty
    with pytest.raises(InvalidRepositoryUrlError):
        parse_and_validate_github_url("")


# ---------------------------------------------------------------------------
# 2. Identity Resolution Engine Tests
# ---------------------------------------------------------------------------

def test_identity_resolution_levels():
    # Level 1: Exact Email -> HIGH
    attr1 = identity_resolver.resolve_commit_identity(
        author_name="Aarav Sharma",
        author_email="aarav.sharma@example.edu",
        student_name="Aarav Sharma",
        student_email="aarav.sharma@example.edu",
    )
    assert attr1.is_student is True
    assert attr1.confidence == "HIGH"

    # Level 2: Linked GitHub handle -> HIGH
    attr2 = identity_resolver.resolve_commit_identity(
        author_name="aaravsharma",
        author_email="noreply@github.com",
        student_name="Aarav Sharma",
        student_email="aarav.other@example.edu",
        student_github_handle="aaravsharma",
    )
    assert attr2.is_student is True
    assert attr2.confidence == "HIGH"

    # Level 3: Normalized name -> MEDIUM
    attr3 = identity_resolver.resolve_commit_identity(
        author_name="Aarav Sharma",
        author_email="unknown.dev@gmail.com",
        student_name="Aarav Sharma",
        student_email="aarav.college@example.edu",
    )
    assert attr3.is_student is True
    assert attr3.confidence == "MEDIUM"

    # Level 4: Weak first name only -> LOW / False
    attr4 = identity_resolver.resolve_commit_identity(
        author_name="Aarav Patel",
        author_email="patel@gmail.com",
        student_name="Aarav Sharma",
    )
    assert attr4.is_student is False
    assert attr4.confidence == "LOW"

    # Level 5: Completely uncorrelated -> UNKNOWN / False
    attr5 = identity_resolver.resolve_commit_identity(
        author_name="John Doe",
        author_email="johndoe@example.com",
        student_name="Aarav Sharma",
    )
    assert attr5.is_student is False
    assert attr5.confidence == "UNKNOWN"


# ---------------------------------------------------------------------------
# 3. Code Area Classification Tests
# ---------------------------------------------------------------------------

def test_code_area_classification():
    assert code_area_analyzer.classify_file_path("apps/api/controllers/user.py") == "backend"
    assert code_area_analyzer.classify_file_path("apps/web/src/components/Card.tsx") == "frontend"
    assert code_area_analyzer.classify_file_path("alembic/versions/001_initial.py") == "database"
    assert code_area_analyzer.classify_file_path("tests/unit/test_service.py") == "tests"
    assert code_area_analyzer.classify_file_path("docs/architecture.md") == "documentation"
    assert code_area_analyzer.classify_file_path("docker/Dockerfile") == "infrastructure"


# ---------------------------------------------------------------------------
# 4. Fork Lineage & Similarity Indicator Tests
# ---------------------------------------------------------------------------

def test_lineage_and_divergence():
    # Root original repo
    res_root = lineage_similarity_analyzer.analyze_lineage(
        is_fork=False,
        parent_full_name=None,
        commits_count=50,
        student_commits_count=20,
        code_areas_count=4,
    )
    assert res_root.is_fork is False
    assert res_root.fork_divergence_level == "NONE"
    assert "Original root repository" in res_root.indicator_summary

    # High divergence fork
    res_high = lineage_similarity_analyzer.analyze_lineage(
        is_fork=True,
        parent_full_name="upstream/base-project",
        commits_count=30,
        student_commits_count=15,
        code_areas_count=4,
    )
    assert res_high.is_fork is True
    assert res_high.fork_divergence_level == "HIGH"

    # Low divergence fork
    res_low = lineage_similarity_analyzer.analyze_lineage(
        is_fork=True,
        parent_full_name="upstream/base-project",
        commits_count=30,
        student_commits_count=1,
        code_areas_count=1,
    )
    assert res_low.is_fork is True
    assert res_low.fork_divergence_level == "LOW"


# ---------------------------------------------------------------------------
# 5. Static Dependency Manifest Parsing Tests
# ---------------------------------------------------------------------------

def test_static_manifest_parsing():
    # package.json
    pkg_json = '{"dependencies": {"react": "^18.2.0", "axios": "1.4.0"}, "devDependencies": {"typescript": "^5.0.0"}}'
    deps_npm = normalizer.parse_dependencies("package.json", pkg_json)
    assert len(deps_npm) == 3
    names = {d.package_name for d in deps_npm}
    assert "react" in names
    assert "typescript" in names
    assert all(d.ecosystem == "npm" for d in deps_npm)

    # requirements.txt
    req_txt = "fastapi==0.110.0\nuvicorn[standard]>=0.28.0\n# comment\nsqlalchemy\n"
    deps_pip = normalizer.parse_dependencies("requirements.txt", req_txt)
    assert len(deps_pip) == 3
    pip_names = {d.package_name for d in deps_pip}
    assert "fastapi" in pip_names
    assert "sqlalchemy" in pip_names
    assert all(d.ecosystem == "pip" for d in deps_pip)


# ---------------------------------------------------------------------------
# 6. End-to-End Service & Database Durability Test
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_github_analyze_end_to_end(async_session):
    # Use canonical student
    res = await async_session.execute(
        select(Student).options(selectinload(Student.user)).where(Student.id == "stu-aarav-sharma")
    )
    student = res.scalar_one_or_none()
    assert student is not None, "stu-aarav-sharma must exist"
    user_email = student.user.email
    user_name = f"{student.user.first_name} {student.user.last_name}"

    # Mocked GitHub API responses
    mock_repo_data = {
        "id": 12345678,
        "name": "competency-tracker",
        "full_name": "devcontributor/competency-tracker",
        "owner": {"login": "devcontributor"},
        "html_url": "https://github.com/devcontributor/competency-tracker",
        "default_branch": "main",
        "fork": False,
        "stargazers_count": 12,
        "forks_count": 3,
        "open_issues_count": 1,
        "license": {"spdx_id": "MIT"},
        "topics": ["fastapi", "nextjs", "competencies"],
        "created_at": "2026-01-10T12:00:00Z",
        "updated_at": "2026-09-01T15:00:00Z",
        "pushed_at": "2026-09-04T08:00:00Z",
    }
    mock_languages = {"Python": 85000, "TypeScript": 45000, "CSS": 5000}
    mock_contributors = [
        {"login": "devcontributor", "id": 99991, "contributions": 18},
        {"login": "external-collaborator", "id": 99992, "contributions": 4},
    ]
    mock_commits = [
        {
            "sha": "a1b2c3d4e5f6001",
            "commit": {
                "author": {"name": user_name, "email": user_email, "date": "2026-09-03T10:00:00Z"},
                "message": "feat(backend): implement competency evaluation engine",
            },
            "stats": {"additions": 140, "deletions": 20},
        },
        {
            "sha": "a1b2c3d4e5f6002",
            "commit": {
                "author": {"name": user_name, "email": user_email, "date": "2026-09-02T14:00:00Z"},
                "message": "feat(database): add migration for evidence intelligence",
            },
            "stats": {"additions": 85, "deletions": 5},
        },
        {
            "sha": "a1b2c3d4e5f6003",
            "commit": {
                "author": {"name": "External Person", "email": "ext@gmail.com", "date": "2026-08-20T09:00:00Z"},
                "message": "chore: fix typo in README",
            },
            "stats": {"additions": 2, "deletions": 2},
        },
    ]
    mock_prs = [
        {
            "number": 1,
            "title": "feat: competency engine implementation",
            "state": "closed",
            "user": {"login": "devcontributor"},
            "merged_at": "2026-09-03T11:00:00Z",
            "additions": 225,
            "deletions": 25,
            "changed_files": 5,
        }
    ]

    with patch("app.domains.evidence.github.service.github_client.get_repository_metadata", new=AsyncMock(return_value=mock_repo_data)), \
         patch("app.domains.evidence.github.service.github_client.get_languages", new=AsyncMock(return_value=mock_languages)), \
         patch("app.domains.evidence.github.service.github_client.get_contributors", new=AsyncMock(return_value=mock_contributors)), \
         patch("app.domains.evidence.github.service.github_client.get_commits", new=AsyncMock(return_value=mock_commits)), \
         patch("app.domains.evidence.github.service.github_client.get_pull_requests", new=AsyncMock(return_value=mock_prs)), \
         patch("app.domains.evidence.github.service.github_client.get_raw_manifest", new=AsyncMock(return_value=None)):

        req = GitHubAnalyzeRequestDTO(
            repo_url="https://github.com/devcontributor/competency-tracker",
            student_id=student.id,
        )

        response = await github_intelligence_service.analyze_repository(async_session, req)

        # 1. Verify Response Structure
        assert response.repository.name == "competency-tracker"
        assert response.repository.owner == "devcontributor"
        assert response.snapshot.commit_count == 3
        assert response.snapshot.student_commit_count == 2
        assert response.snapshot.student_lines_added == 225
        assert response.snapshot.student_lines_deleted == 25
        assert response.claims_count >= 3

        # 2. Strict Decoupling Invariant Check
        assert response.processing_status == "COMPLETED"
        assert response.verification_status == "PENDING"

        # 3. Database Referential Integrity Verification
        ev_id_str = str(response.evidence_id)
        ev_res = await async_session.execute(select(Evidence).where(Evidence.id == ev_id_str))
        evidence = ev_res.scalar_one_or_none()
        assert evidence is not None
        assert evidence.evidence_type == "GITHUB_REPOSITORY"
        assert evidence.source_type == "REPOSITORY"
        assert evidence.processing_status == "COMPLETED"
        assert evidence.verification_status == "PENDING"

        # Check Provenance
        prov_res = await async_session.execute(select(EvidenceProvenance).where(EvidenceProvenance.evidence_id == ev_id_str))
        prov = prov_res.scalar_one_or_none()
        assert prov is not None
        assert prov.source_type == "GITHUB_API"

        # Check Snapshot & Languages
        snap_id_str = str(response.snapshot.id)
        langs_res = await async_session.execute(select(GitHubLanguage).where(GitHubLanguage.snapshot_id == snap_id_str))
        langs = langs_res.scalars().all()
        assert len(langs) == 3
        lang_names = {l.language for l in langs}
        assert "Python" in lang_names
        assert "TypeScript" in lang_names

        # Check Claims
        claims_res = await async_session.execute(select(EvidenceClaim).where(EvidenceClaim.evidence_id == ev_id_str))
        claims = claims_res.scalars().all()
        assert len(claims) >= 3
        claim_types = {c.claim_type for c in claims}
        assert "AUTHOR_CONTRIBUTION" in claim_types
        assert "LANGUAGE_DISTRIBUTION" in claim_types

        # 4. Idempotency on Re-Analysis
        re_response = await github_intelligence_service.analyze_repository(async_session, req)
        assert re_response.repository.id == response.repository.id  # Same repository row updated!

        # 5. Snapshot and Repository Retrieval
        snap_dto = await github_intelligence_service.get_snapshot_by_id(async_session, response.snapshot.id)
        assert snap_dto is not None
        assert snap_dto.id == response.snapshot.id
        assert snap_dto.head_commit_sha == "a1b2c3d4e5f6001"

        student_snaps = await github_intelligence_service.get_snapshots_for_student(async_session, "stu-aarav-sharma")
        assert len(student_snaps) >= 1
        assert any(s.id == response.snapshot.id for s in student_snaps)

        repo_dto = await github_intelligence_service.get_repository_by_id(async_session, response.repository.id)
        assert repo_dto is not None
        assert repo_dto.full_name == "devcontributor/competency-tracker"


# ---------------------------------------------------------------------------
# 7. Error Handling & Provider Resilience Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_github_error_conditions(async_session):
    # 404 Not Found
    with patch("app.domains.evidence.github.service.github_client.get_repository_metadata", side_effect=GitHubNotFoundError("Repo not found")):
        req = GitHubAnalyzeRequestDTO(
            repo_url="https://github.com/unknown-owner/non-existent-repo",
            student_id="stu-aarav-sharma",
        )
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await github_intelligence_service.analyze_repository(async_session, req)
        assert exc_info.value.status_code == 404

    # 429 / 403 Rate Limit
    with patch("app.domains.evidence.github.service.github_client.get_repository_metadata", side_effect=GitHubRateLimitError("Rate limit exceeded")):
        with pytest.raises(HTTPException) as exc_info:
            await github_intelligence_service.analyze_repository(async_session, req)
        assert exc_info.value.status_code == 429

    # 403 Forbidden
    with patch("app.domains.evidence.github.service.github_client.get_repository_metadata", side_effect=GitHubForbiddenError("Private repository")):
        with pytest.raises(HTTPException) as exc_info:
            await github_intelligence_service.analyze_repository(async_session, req)
        assert exc_info.value.status_code == 403


# ---------------------------------------------------------------------------
# 8. Live HTTP API Integration Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_live_github_api_endpoints():
    LIVE_SERVER_URL = "http://127.0.0.1:8000"
    from httpx import AsyncClient
    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=10.0) as ac:
        # Invalid URL SSRF check via API
        resp = await ac.post("/api/v1/github/analyze", json={
            "repo_url": "http://evil.com/fake/repo",
            "student_id": "stu-aarav-sharma"
        })
        assert resp.status_code == 400

        # Non-existent snapshot 404
        resp404 = await ac.get("/api/v1/github/snapshots/00000000-0000-0000-0000-000000000000")
        assert resp404.status_code == 404

        # Non-existent repo 404
        resp_repo_404 = await ac.get("/api/v1/github/repositories/00000000-0000-0000-0000-000000000000")
        assert resp_repo_404.status_code == 404

        # List snapshots for student
        resp_student = await ac.get("/api/v1/github/student/stu-aarav-sharma")
        assert resp_student.status_code == 200
        assert isinstance(resp_student.json(), list)

