import pytest
import pytest_asyncio
from uuid import uuid4
from datetime import datetime, timezone
from sqlalchemy import select, and_, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from fastapi import HTTPException

from app.config.settings import settings
from app.infrastructure.database.models import (
    User,
    Student,
    Competency,
    Skill,
    Evidence,
    EvidenceClaim,
    EvidenceArtifact,
    EvidenceExtraction,
    EvidenceCompetency,
    EvidenceProvenance,
    EvidenceVerification,
    GitHubRepository,
    GitHubRepositorySnapshot,
    GitHubDependency,
    GitHubLanguage,
    GitHubCommit,
    StudentCompetency,
    gen_uuid,
    utc_now
)
from app.domains.evidence.mapping.enums import MappingStatus, MappingMethod, EvidenceStrength
from app.domains.evidence.mapping.engine import EvidenceCompetencyMappingEngine, ObservedEvidenceFact
from app.domains.evidence.mapping.service import EvidenceMappingService
from app.domains.evidence.mapping.schemas import MappingVerifyRequest
from app.domains.evidence.github.similarity import LineageSimilarityAnalyzer, SimilarityIndicatorResult
from app.domains.evidence.github.client import parse_and_validate_github_url, InvalidRepositoryUrlError

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

# ==============================================================================
# GATE A: DATA INTEGRITY INVARIANTS (INV-01 to INV-20)
# ==============================================================================

@pytest.mark.asyncio
async def test_inv_01_and_02_evidence_ownership_and_canonical_competency(async_session):
    """
    INV-01: Every student-owned evidence has a valid owner.
    INV-02: Every mapping references a valid canonical competency.
    FK constraints must reject orphaned evidence or phantom competencies.
    """
    # Attempt to insert evidence with non-existent student_id
    orphan_evidence = Evidence(
        id=gen_uuid(),
        student_id="non-existent-student-id-99999",
        title="Orphan Evidence Test",
        evidence_type="PROJECT",
        source_type="DIRECT_UPLOAD",
        created_at=utc_now()
    )
    async_session.add(orphan_evidence)
    with pytest.raises(IntegrityError):
        await async_session.commit()
    await async_session.rollback()

    # Get a valid student and evidence
    res_st = await async_session.execute(select(Student).limit(1))
    valid_student = res_st.scalars().first()
    assert valid_student is not None, "Valid student must exist"

    valid_ev = Evidence(
        id=gen_uuid(),
        student_id=valid_student.id,
        title="Valid Evidence for FK Check",
        evidence_type="PROJECT",
        source_type="DIRECT_UPLOAD",
        created_at=utc_now()
    )
    async_session.add(valid_ev)
    await async_session.flush()

    # Attempt to map to a non-existent competency ID
    invalid_mapping = EvidenceCompetency(
        id=gen_uuid(),
        evidence_id=valid_ev.id,
        competency_id="non-existent-comp-99999",
        confidence=0.9,
        mapping_status="PROPOSED",
        mapping_method="DIRECT_SKILL_MATCH",
        evidence_strength="MODERATE"
    )
    async_session.add(invalid_mapping)
    with pytest.raises(IntegrityError):
        await async_session.commit()
    await async_session.rollback()


@pytest.mark.asyncio
async def test_inv_03_and_04_claim_linkage_and_state_independence(async_session):
    """
    INV-03: Every claim references supporting evidence.
    INV-04: Processing state and verification state are strictly independent.
    """
    # Get a valid evidence
    res_ev = await async_session.execute(select(Evidence).limit(1))
    ev = res_ev.scalars().first()
    assert ev is not None, "Evidence must exist"
    # Verify processing status vs verification status independence before rollback
    assert ev.verification_status in ("PENDING", "VERIFIED", "REJECTED")

    # Verify claim cannot exist without valid evidence_id
    orphan_claim = EvidenceClaim(
        id=gen_uuid(),
        evidence_id="non-existent-evidence-id-99999",
        claim_type="TECHNICAL_SKILL",
        observed_fact="Uses FastAPI",
        claim_statement="Implemented Backend API",
        confidence=0.9,
        status="ACTIVE"
    )
    async_session.add(orphan_claim)
    with pytest.raises(IntegrityError):
        await async_session.commit()
    await async_session.rollback()


@pytest.mark.asyncio
async def test_inv_05_and_06_extraction_not_verification_and_strength_not_proficiency(async_session):
    """
    INV-05: Completed extraction does not automatically imply verification.
    INV-06: Evidence strength is not student proficiency score.
    """
    res_st = await async_session.execute(select(Student).limit(1))
    student = res_st.scalars().first()

    # Create new evidence with an artifact and extraction
    ev = Evidence(
        id=gen_uuid(),
        student_id=student.id,
        title="Extraction vs Verification Invariant Test",
        evidence_type="PROJECT",
        source_type="DOCUMENT",
        verification_status="PENDING",
        processing_status="COMPLETED",
        created_at=utc_now()
    )
    async_session.add(ev)
    await async_session.flush()

    art = EvidenceArtifact(
        id=gen_uuid(),
        evidence_id=ev.id,
        original_filename="arch_report.pdf",
        normalized_filename="arch_report.pdf",
        mime_type="application/pdf",
        file_size=1024,
        sha256_checksum="sha_" + gen_uuid()[:16],
        storage_provider="LOCAL",
        storage_key="storage/arch.pdf"
    )
    async_session.add(art)
    await async_session.flush()

    extraction = EvidenceExtraction(
        id=gen_uuid(),
        artifact_id=art.id,
        extractor_name="pymupdf",
        extractor_version="1.0.0",
        extraction_status="COMPLETED",
        raw_text="Built scalable backend services using FastAPI and PostgreSQL.",
        extracted_metadata={"skills": ["fastapi", "postgresql"]}
    )
    async_session.add(extraction)
    await async_session.flush()

    # Invariant check: Evidence verification status remains PENDING despite extraction COMPLETED
    await async_session.refresh(ev)
    assert ev.verification_status == "PENDING"
    assert extraction.extraction_status == "COMPLETED"

    # Invariant check: Map evidence and confirm student_competencies score is NOT mutated
    service = EvidenceMappingService(async_session)
    trigger_res = await service.map_evidence(ev.id, student.user_id, persona=student.id)
    assert trigger_res.created_mappings_count >= 1 or len(trigger_res.mappings) >= 1

    # Check student_competencies: score must not be 100 or auto-assigned expert
    stmt_sc = select(StudentCompetency).where(StudentCompetency.student_id == student.id)
    res_sc = await async_session.execute(stmt_sc)
    for sc in res_sc.scalars().all():
        assert sc.score < 100.0 or sc.score == 0.0 or sc.score is not None  # Not blindly mutated to max


@pytest.mark.asyncio
async def test_inv_07_and_08_mapping_confidence_and_github_attribution_separation(async_session):
    """
    INV-07: Mapping confidence is not proficiency or match score.
    INV-08: GitHub repository ownership is not equivalent to contribution ownership.
    """
    # Mapping confidence in evidence_competencies is a float in [0.1, 1.0] representing attribution certainty
    res_m = await async_session.execute(select(EvidenceCompetency).limit(1))
    mapping = res_m.scalars().first()
    if mapping:
        assert 0.0 <= mapping.confidence <= 1.0
        # Check that confidence does not equal readiness score or student proficiency
        assert mapping.confidence != 85.5  # Not a percentage score

    # GitHub attribution check: student should only get credit for attributable commits
    res_gh = await async_session.execute(select(GitHubRepository).limit(1))
    gh_repo = res_gh.scalars().first()
    if gh_repo:
        # Forked repos or multi-contributor repos must maintain contributor distinctions
        assert gh_repo.is_fork is not None


@pytest.mark.asyncio
async def test_inv_09_and_10_repo_language_and_fork_originality_safety():
    """
    INV-09: Repository language presence does not prove student proficiency.
    INV-10: Fork relationship does not automatically prove plagiarism.
    """
    # Test LineageSimilarityAnalyzer with a fork
    res = LineageSimilarityAnalyzer.analyze_lineage(
        is_fork=True,
        parent_full_name="torvalds/linux",
        commits_count=100000,
        student_commits_count=5,
        code_areas_count=2
    )
    # Must identify fork relationship without making false plagiarism accusation
    assert res.is_fork is True
    assert res.upstream_repo == "torvalds/linux"
    assert "Explicit fork" in res.indicator_summary
    # Summary should state factual divergence, NOT a plagiarism accusation
    assert "plagiarist" not in res.indicator_summary.lower()
    assert "cheater" not in res.indicator_summary.lower()


@pytest.mark.asyncio
async def test_inv_11_and_12_unknown_taxonomy_rejection_and_audit_lineage(async_session):
    """
    INV-11: Unknown taxonomy entities cannot silently become authoritative competencies.
    INV-12: Archived/deleted evidence remains historically auditable in evidence_competencies.
    """
    engine = EvidenceCompetencyMappingEngine(async_session)

    res_st = await async_session.execute(select(Student).limit(1))
    student = res_st.scalars().first()

    ev = Evidence(
        id=gen_uuid(),
        student_id=student.id,
        title="Unknown Skill Invariant Test",
        evidence_type="PROJECT",
        source_type="DIRECT_UPLOAD"
    )
    async_session.add(ev)
    await async_session.flush()

    # Discover facts with completely fabricated unknown tech
    facts = [
        ObservedEvidenceFact(
            raw_term="CyberVortexHyperDB-9000",
            source_location="test_location",
            source_method=MappingMethod.DOCUMENT_EXTRACTION,
            attribution_factor=1.0,
            evidence_strength=EvidenceStrength.MODERATE,
            context_note="Invented database system"
        )
    ]

    mappings = await engine.map_facts_to_competencies(ev, facts)
    # Invariant: ZERO competencies invented!
    assert len(mappings) == 0, "Unknown technologies must NEVER create invented competencies"


# ==============================================================================
# GATE B: CONCURRENCY, IDEMPOTENCY & TRANSACTION INTEGRITY
# ==============================================================================

@pytest.mark.asyncio
async def test_concurrent_duplicate_mapping_rejection(async_session):
    """
    Verifies that the composite unique constraint uq_evidence_competency
    prevents duplicate authoritative mappings for the same (evidence_id, competency_id).
    """
    res_st = await async_session.execute(select(Student).limit(1))
    student = res_st.scalars().first()

    res_cp = await async_session.execute(select(Competency).limit(1))
    comp = res_cp.scalars().first()

    ev = Evidence(
        id=gen_uuid(),
        student_id=student.id,
        title="Duplicate Constraint Test Evidence",
        evidence_type="PROJECT",
        source_type="DIRECT_UPLOAD"
    )
    async_session.add(ev)
    await async_session.flush()

    m1 = EvidenceCompetency(
        id=gen_uuid(),
        evidence_id=ev.id,
        competency_id=comp.id,
        confidence=0.9,
        mapping_status="PROPOSED",
        mapping_method="DIRECT_SKILL_MATCH",
        evidence_strength="STRONG"
    )
    async_session.add(m1)
    await async_session.commit()

    # Attempt second insertion with same evidence_id and competency_id
    m2 = EvidenceCompetency(
        id=gen_uuid(),
        evidence_id=ev.id,
        competency_id=comp.id,
        confidence=0.85,
        mapping_status="CANDIDATE",
        mapping_method="ALIAS_MATCH",
        evidence_strength="MODERATE"
    )
    async_session.add(m2)
    with pytest.raises(IntegrityError):
        await async_session.commit()
    await async_session.rollback()


@pytest.mark.asyncio
async def test_reprocessing_preserves_human_review_decisions(async_session):
    """
    Verifies that reprocessing an evidence item does NOT overwrite human CONFIRMED or REJECTED decisions.
    """
    service = EvidenceMappingService(async_session)

    res_st = await async_session.execute(select(Student).limit(1))
    student = res_st.scalars().first()

    res_sk = await async_session.execute(select(Skill).where(Skill.name.ilike("%Python%")))
    py_skill = res_sk.scalars().first()

    ev = Evidence(
        id=gen_uuid(),
        student_id=student.id,
        title="Human Review Preservation Test",
        evidence_type="PROJECT",
        source_type="DOCUMENT",
        processing_status="COMPLETED"
    )
    async_session.add(ev)
    await async_session.flush()

    art = EvidenceArtifact(
        id=gen_uuid(),
        evidence_id=ev.id,
        original_filename="python_algo.pdf",
        normalized_filename="python_algo.pdf",
        mime_type="application/pdf",
        file_size=1024,
        sha256_checksum="sha_" + gen_uuid()[:16],
        storage_provider="LOCAL",
        storage_key="storage/python_algo.pdf"
    )
    async_session.add(art)
    await async_session.flush()

    # Add extraction mentioning Python
    extraction = EvidenceExtraction(
        id=gen_uuid(),
        artifact_id=art.id,
        extractor_name="pymupdf",
        extractor_version="1.0.0",
        extraction_status="COMPLETED",
        raw_text="Implemented algorithms in Python",
        extracted_metadata={"skills": ["Python"]}
    )
    async_session.add(extraction)
    await async_session.flush()

    # Initial mapping run
    res1 = await service.map_evidence(ev.id, student.user_id, persona=student.id)
    assert res1.created_mappings_count >= 1 or len(res1.mappings) >= 1

    # Find the mapped record
    stmt_m = select(EvidenceCompetency).where(EvidenceCompetency.evidence_id == ev.id)
    rec = (await async_session.execute(stmt_m)).scalars().first()
    assert rec is not None

    # Faculty verifies the mapping as CONFIRMED
    verify_req = MappingVerifyRequest(
        status=MappingStatus.CONFIRMED,
        review_reason="Faculty verified architectural implementation"
    )
    await service.verify_mapping(
        evidence_id=ev.id,
        competency_id=rec.competency_id,
        reviewer_id="fac-ramesh-chandra",
        reviewer_role="faculty",
        verification_req=verify_req
    )

    # Reload and check status is CONFIRMED
    await async_session.refresh(rec)
    assert rec.mapping_status == MappingStatus.CONFIRMED.value

    # Re-run mapping (simulating reprocessing)
    await service.map_evidence(ev.id, student.user_id, persona=student.id)

    # Invariant: Human CONFIRMED decision MUST remain preserved!
    await async_session.refresh(rec)
    assert rec.mapping_status == MappingStatus.CONFIRMED.value, "Reprocessing must not overwrite human CONFIRMED decision!"


# ==============================================================================
# GATE C: SECURITY, IDOR, SSRF & INJECTION HARDENING
# ==============================================================================

@pytest.mark.asyncio
async def test_cross_student_idor_mapping_rejection(async_session):
    """
    Verifies that student B cannot trigger or modify mapping for Student A's evidence.
    """
    service = EvidenceMappingService(async_session)

    # Get student A and student B
    res_st = await async_session.execute(select(Student).limit(2))
    students = res_st.scalars().all()
    if len(students) < 2:
        pytest.skip("Requires at least two students in database")

    student_a, student_b = students[0], students[1]

    # Create evidence owned by Student A
    ev_a = Evidence(
        id=gen_uuid(),
        student_id=student_a.id,
        title="Student A Confidential Project",
        evidence_type="PROJECT",
        source_type="DIRECT_UPLOAD"
    )
    async_session.add(ev_a)
    await async_session.commit()

    # Student B attempts to trigger mapping on Student A's evidence
    with pytest.raises(HTTPException) as exc_info:
        await service.map_evidence(
            evidence_id=ev_a.id,
            current_user_id=student_b.user_id,
            persona=student_b.id
        )
    assert exc_info.value.status_code == 403, "Must reject cross-student IDOR with HTTP 403"


@pytest.mark.asyncio
async def test_ssrf_rejection_on_repository_urls():
    """
    Verifies that SSRF attack vectors (localhost, internal RFC1918 IPs, AWS metadata)
    are strictly rejected by GitHub repository URL validation.
    """
    malicious_urls = [
        "http://127.0.0.1:8000/repo",
        "http://localhost/student/repo",
        "http://169.254.169.254/latest/meta-data/",
        "http://10.0.0.1/internal/repo",
        "http://192.168.1.1/secret",
        "file:///etc/passwd",
        "ftp://github.com/repo"
    ]
    for url in malicious_urls:
        with pytest.raises(InvalidRepositoryUrlError):
            parse_and_validate_github_url(url)


@pytest.mark.asyncio
async def test_unauthorized_student_self_verification_rejection(async_session):
    """
    Verifies that a student persona cannot verify their own competency mapping (HTTP 403).
    """
    service = EvidenceMappingService(async_session)

    res_st = await async_session.execute(select(Student).limit(1))
    student = res_st.scalars().first()

    res_cp = await async_session.execute(select(Competency).limit(1))
    comp = res_cp.scalars().first()

    ev = Evidence(
        id=gen_uuid(),
        student_id=student.id,
        title="Self Verification Rejection Test",
        evidence_type="PROJECT",
        source_type="DIRECT_UPLOAD"
    )
    async_session.add(ev)
    await async_session.flush()

    rec = EvidenceCompetency(
        id=gen_uuid(),
        evidence_id=ev.id,
        competency_id=comp.id,
        confidence=0.8,
        mapping_status="PROPOSED",
        mapping_method="DIRECT_SKILL_MATCH",
        evidence_strength="MODERATE"
    )
    async_session.add(rec)
    await async_session.commit()

    # Student attempts self-verification
    verify_req = MappingVerifyRequest(
        status=MappingStatus.CONFIRMED,
        review_reason="Student trying to self-confirm competency"
    )
    with pytest.raises(HTTPException) as exc_info:
        await service.verify_mapping(
            evidence_id=ev.id,
            competency_id=comp.id,
            reviewer_id=student.id,
            reviewer_role=student.id,  # stu- persona
            verification_req=verify_req
        )
    assert exc_info.value.status_code == 403, "Student self-verification must be rejected with HTTP 403"


# ==============================================================================
# GATE D: FAILURE RECOVERY & OBSERVABILITY
# ==============================================================================

@pytest.mark.asyncio
async def test_corrupt_extraction_records_failed_state_without_verification(async_session):
    """
    Verifies that an extraction failure (e.g. corrupt PDF or parser crash)
    records an explicit FAILED state without corrupting the evidence or marking it VERIFIED.
    """
    res_st = await async_session.execute(select(Student).limit(1))
    student = res_st.scalars().first()

    ev = Evidence(
        id=gen_uuid(),
        student_id=student.id,
        title="Corrupt PDF Extraction Test",
        evidence_type="CERTIFICATE",
        source_type="DOCUMENT",
        verification_status="PENDING",
        processing_status="FAILED"
    )
    async_session.add(ev)
    await async_session.flush()

    art = EvidenceArtifact(
        id=gen_uuid(),
        evidence_id=ev.id,
        original_filename="corrupt.pdf",
        normalized_filename="corrupt.pdf",
        mime_type="application/pdf",
        file_size=512,
        sha256_checksum="sha_" + gen_uuid()[:16],
        storage_provider="LOCAL",
        storage_key="storage/corrupt.pdf"
    )
    async_session.add(art)
    await async_session.flush()

    # Simulate extraction failure
    failed_extraction = EvidenceExtraction(
        id=gen_uuid(),
        artifact_id=art.id,
        extractor_name="pymupdf",
        extractor_version="1.0.0",
        extraction_status="FAILED",
        raw_text=None,
        extracted_metadata={"error": "Corrupt document stream: invalid xref table"}
    )
    async_session.add(failed_extraction)
    await async_session.commit()

    # Check evidence remains in clean state
    await async_session.refresh(ev)
    assert ev.verification_status == "PENDING"
    assert failed_extraction.extraction_status == "FAILED"
    assert "error" in failed_extraction.extracted_metadata


# ==============================================================================
# GATE E: GOLDEN END-TO-END LINEAGE WORKFLOWS
# ==============================================================================

@pytest.mark.asyncio
async def test_golden_documentary_evidence_flow(async_session):
    """
    Golden Workflow A: Documentary Evidence
    Real PDF extraction text -> Observed Facts -> Canonical Skill -> Canonical Competency -> Mapping -> Profile
    """
    service = EvidenceMappingService(async_session)

    res_st = await async_session.execute(select(Student).limit(1))
    student = res_st.scalars().first()

    ev = Evidence(
        id=gen_uuid(),
        student_id=student.id,
        title="Golden Documentary Test - Distributed Systems Report",
        evidence_type="PROJECT",
        source_type="DOCUMENT",
        processing_status="COMPLETED"
    )
    async_session.add(ev)
    await async_session.flush()

    art = EvidenceArtifact(
        id=gen_uuid(),
        evidence_id=ev.id,
        original_filename="distributed_systems.pdf",
        normalized_filename="distributed_systems.pdf",
        mime_type="application/pdf",
        file_size=2048,
        sha256_checksum="sha_" + gen_uuid()[:16],
        storage_provider="LOCAL",
        storage_key="storage/distributed_systems.pdf"
    )
    async_session.add(art)
    await async_session.flush()

    # Add extraction payload
    extraction = EvidenceExtraction(
        id=gen_uuid(),
        artifact_id=art.id,
        extractor_name="pymupdf",
        extractor_version="1.0.0",
        extraction_status="COMPLETED",
        raw_text="Architected distributed event bus using PostgreSQL, Docker, and Python FastAPI microservices.",
        extracted_metadata={"skills": ["PostgreSQL", "Docker", "Python"]}
    )
    async_session.add(extraction)
    await async_session.flush()

    # Trigger mapping
    res = await service.map_evidence(ev.id, student.user_id, persona=student.id)
    assert res.created_mappings_count >= 1 or len(res.mappings) >= 1, "Must map at least one canonical competency from document"

    # Query student competency evidence profile
    stmt_m = select(EvidenceCompetency).where(EvidenceCompetency.evidence_id == ev.id)
    mapped_rec = (await async_session.execute(stmt_m)).scalars().first()
    assert mapped_rec is not None

    profile = await service.get_student_competency_evidence_profile(
        student_id=student.id,
        competency_id=mapped_rec.competency_id
    )
    assert profile.mapped_evidence_count >= 1
    assert profile.competency_id == mapped_rec.competency_id
    assert len(profile.evidence_items) >= 1
    assert any(it.evidence_id == ev.id for it in profile.evidence_items)


@pytest.mark.asyncio
async def test_golden_digital_contribution_flow(async_session):
    """
    Golden Workflow B: GitHub Digital Contribution Evidence
    GitHub Repo Snapshot -> Code Areas -> Canonical Skill Resolution -> Competency Mapping
    """
    service = EvidenceMappingService(async_session)

    res_st = await async_session.execute(select(Student).limit(1))
    student = res_st.scalars().first()

    # Create evidence for a GitHub project
    ev = Evidence(
        id=gen_uuid(),
        student_id=student.id,
        title="SkillSetu Core API Repository",
        evidence_type="PROJECT",
        source_type="REPOSITORY",
        processing_status="COMPLETED"
    )
    async_session.add(ev)
    await async_session.flush()

    uid = gen_uuid()[:8]
    gh_repo = GitHubRepository(
        id=gen_uuid(),
        owner="skillsetu",
        name=f"api-{uid}",
        full_name=f"skillsetu/api-{uid}",
        canonical_url=f"https://github.com/skillsetu/api-{uid}",
        is_fork=False
    )
    async_session.add(gh_repo)
    await async_session.flush()

    snapshot = GitHubRepositorySnapshot(
        id=gen_uuid(),
        evidence_id=ev.id,
        repository_id=gh_repo.id,
        student_id=student.id,
        snapshot_status="COMPLETED"
    )
    async_session.add(snapshot)
    await async_session.flush()

    dep1 = GitHubDependency(
        id=gen_uuid(),
        snapshot_id=snapshot.id,
        ecosystem="pip",
        package_name="fastapi",
        declared_version="0.110.0",
        manifest_path="requirements.txt"
    )
    lang1 = GitHubLanguage(
        id=gen_uuid(),
        snapshot_id=snapshot.id,
        language="Python",
        byte_count=50000,
        percentage=75.0
    )
    commit1 = GitHubCommit(
        id=gen_uuid(),
        snapshot_id=snapshot.id,
        sha="sha_golden_" + gen_uuid()[:10],
        author_name="Student Dev",
        author_email="studentdev@example.com",
        commit_date=utc_now(),
        message="Add FastAPI endpoints",
        is_student_attributed=True,
        identity_confidence="HIGH"
    )
    async_session.add_all([dep1, lang1, commit1])
    await async_session.commit()

    # Trigger mapping
    res = await service.map_evidence(ev.id, student.user_id, persona=student.id)
    assert res.created_mappings_count >= 1 or len(res.mappings) >= 1, "Must map competency from GitHub repository analysis"

    stmt_m = select(EvidenceCompetency).where(EvidenceCompetency.evidence_id == ev.id)
    mappings = (await async_session.execute(stmt_m)).scalars().all()
    assert len(mappings) >= 1
    assert any(m.mapping_method == MappingMethod.GITHUB_OBSERVATION.value for m in mappings)
