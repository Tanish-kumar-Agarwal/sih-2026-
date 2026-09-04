import logging
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timezone
import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.infrastructure.database.models import (
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
    GitHubPullRequest,
    GitHubCodeArea,
    GitHubSimilarityIndicator,
    utc_now,
)
from app.domains.evidence.github.client import (
    github_client,
    parse_and_validate_github_url,
    GitHubError,
    InvalidRepositoryUrlError,
    GitHubNotFoundError,
    GitHubRateLimitError,
    GitHubForbiddenError,
    GitHubNetworkError,
)
from app.domains.evidence.github.normalizer import normalizer
from app.domains.evidence.github.identity import identity_resolver
from app.domains.evidence.github.code_areas import code_area_analyzer
from app.domains.evidence.github.similarity import lineage_similarity_analyzer
from app.domains.evidence.github.schemas import (
    GitHubAnalyzeRequestDTO,
    GitHubAnalysisResponseDTO,
    GitHubRepositoryDTO,
    GitHubSnapshotDTO,
    GitHubLanguageDTO,
    GitHubDependencyDTO,
    GitHubContributorDTO,
    GitHubCommitDTO,
    GitHubPullRequestDTO,
    GitHubCodeAreaDTO,
    GitHubSimilarityDTO,
)
from app.config.settings import settings

logger = logging.getLogger(__name__)


class GitHubIntelligenceService:
    """
    Orchestrates end-to-end GitHub repository analysis, identity resolution,
    evidence persistence, and contribution extraction.
    """

    @staticmethod
    def _extract_github_handle(github_url_or_handle: Optional[str]) -> Optional[str]:
        if not github_url_or_handle:
            return None
        val = github_url_or_handle.strip().rstrip("/")
        if "github.com/" in val:
            return val.split("github.com/")[-1].split("/")[0]
        return val.lstrip("@")

    async def analyze_repository(
        self, db: AsyncSession, request: GitHubAnalyzeRequestDTO
    ) -> GitHubAnalysisResponseDTO:
        # 1. SSRF & URL Validation
        try:
            owner, repo_name, canonical_url = parse_and_validate_github_url(request.repo_url)
        except InvalidRepositoryUrlError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )

        # 2. Verify Student Exists
        student_id_str = str(request.student_id)
        stmt = (
            select(Student)
            .options(selectinload(Student.user))
            .where(Student.id == student_id_str)
        )
        res = await db.execute(stmt)
        student = res.scalar_one_or_none()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with ID '{request.student_id}' not found.",
            )

        student_name = f"{student.user.first_name} {student.user.last_name}" if student.user else "Student"
        student_email = student.user.email if student.user else None
        student_handle = self._extract_github_handle(student.github_url)

        # 3. Query GitHub API via Client
        try:
            raw_repo = await github_client.get_repository_metadata(owner, repo_name)
            raw_langs = await github_client.get_languages(owner, repo_name)
            raw_contributors = await github_client.get_contributors(owner, repo_name)
            raw_commits = await github_client.get_commits(
                owner, repo_name, limit=settings.GITHUB_MAX_COMMITS_ANALYZED
            )
            raw_prs = await github_client.get_pull_requests(
                owner, repo_name, limit=settings.GITHUB_MAX_PRS_ANALYZED
            )

            # Static Dependency Manifests check
            manifest_files = ["package.json", "requirements.txt", "pyproject.toml"]
            raw_manifests: Dict[str, str] = {}
            for mf in manifest_files:
                content = await github_client.get_raw_manifest(owner, repo_name, mf)
                if content:
                    raw_manifests[mf] = content

        except GitHubNotFoundError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Repository '{owner}/{repo_name}' not found on GitHub or is inaccessible.",
            )
        except GitHubRateLimitError as e:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"GitHub API rate limit exceeded: {str(e)}",
            )
        except GitHubForbiddenError as e:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access to GitHub repository forbidden: {str(e)}",
            )
        except GitHubNetworkError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Upstream GitHub network error: {str(e)}",
            )
        except Exception as e:
            logger.exception("Unexpected error during GitHub ingestion: %s", str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Internal ingestion error: {str(e)}",
            )

        # 4. Normalize API Data
        normalized_repo = normalizer.normalize_repository(raw_repo)
        normalized_langs = normalizer.normalize_languages(raw_langs)
        normalized_contributors = normalizer.normalize_contributors(raw_contributors)
        normalized_commits = normalizer.normalize_commits(raw_commits)
        normalized_prs = normalizer.normalize_pull_requests(raw_prs)

        all_deps = []
        for path, raw_text in raw_manifests.items():
            parsed_deps = normalizer.parse_dependencies(path, raw_text)
            all_deps.extend(parsed_deps)

        # 5. Deterministic Identity Resolution
        student_commit_count = 0
        student_additions = 0
        student_deletions = 0
        commit_records: List[Dict[str, Any]] = []

        for c in normalized_commits:
            attr = identity_resolver.resolve_commit_identity(
                author_name=c.author_name,
                author_email=c.author_email,
                student_name=student_name,
                student_email=student_email,
                student_github_handle=student_handle,
            )
            is_student = attr.is_student
            if is_student:
                student_commit_count += 1
                student_additions += c.additions
                student_deletions += c.deletions

            commit_records.append({
                "commit": c,
                "is_student": is_student,
                "confidence": attr.confidence,
            })

        contributor_records: List[Dict[str, Any]] = []
        for contrib in normalized_contributors:
            attr = identity_resolver.resolve_contributor_identity(
                contributor_username=contrib.username,
                student_name=student_name,
                student_github_handle=student_handle,
            )
            contributor_records.append({
                "contributor": contrib,
                "is_student": attr.is_student,
                "confidence": attr.confidence,
            })

        student_pr_count = 0
        pr_records: List[Dict[str, Any]] = []
        for pr in normalized_prs:
            attr = identity_resolver.resolve_contributor_identity(
                contributor_username=pr.author_username,
                student_name=student_name,
                student_github_handle=student_handle,
            )
            if attr.is_student:
                student_pr_count += 1
            pr_records.append({
                "pr": pr,
                "is_student": attr.is_student,
            })

        # 6. Code Area & Lineage Divergence
        commits_for_area_analysis = [
            {"message": cr["commit"].message, "is_student_attributed": cr["is_student"]}
            for cr in commit_records
        ]
        area_stats = code_area_analyzer.aggregate_areas_from_commits(commits_for_area_analysis)

        similarity_result = lineage_similarity_analyzer.analyze_lineage(
            is_fork=normalized_repo.is_fork,
            parent_full_name=normalized_repo.parent_full_name,
            commits_count=len(normalized_commits),
            student_commits_count=student_commit_count,
            code_areas_count=len(area_stats),
        )

        # 7. Database Persistence (Atomic Transaction)
        try:
            # 7a. Upsert GitHubRepository
            repo_stmt = select(GitHubRepository).where(
                GitHubRepository.canonical_url == normalized_repo.canonical_url
            )
            repo_res = await db.execute(repo_stmt)
            db_repo = repo_res.scalar_one_or_none()

            if not db_repo:
                db_repo = GitHubRepository(
                    owner=normalized_repo.owner,
                    name=normalized_repo.name,
                    full_name=normalized_repo.full_name,
                    canonical_url=normalized_repo.canonical_url,
                    default_branch=normalized_repo.default_branch,
                    is_fork=normalized_repo.is_fork,
                    parent_full_name=normalized_repo.parent_full_name,
                    parent_url=normalized_repo.parent_url,
                    stars_count=normalized_repo.stars_count,
                    forks_count=normalized_repo.forks_count,
                    open_issues_count=normalized_repo.open_issues_count,
                    license_spdx=normalized_repo.license_spdx,
                    topics=normalized_repo.topics,
                )
                db.add(db_repo)
                await db.flush()
            else:
                # Update metadata
                db_repo.stars_count = normalized_repo.stars_count
                db_repo.forks_count = normalized_repo.forks_count
                db_repo.open_issues_count = normalized_repo.open_issues_count
                db_repo.default_branch = normalized_repo.default_branch
                db_repo.license_spdx = normalized_repo.license_spdx
                db_repo.topics = normalized_repo.topics
                db_repo.updated_at = utc_now()
                await db.flush()

            # 7b. Create Evidence & Provenance
            title = request.title or f"GitHub Repository: {normalized_repo.full_name}"
            desc = request.description or (
                f"Digital contribution evidence for {normalized_repo.full_name}. "
                f"Languages: {', '.join([l.language for l in normalized_langs[:3]]) or 'Not detected'}. "
                f"Attributed commits: {student_commit_count} / {len(normalized_commits)}."
            )

            evidence = Evidence(
                student_id=student_id_str,
                entity_type="PROJECT",
                evidence_type="GITHUB_REPOSITORY",
                source_type="REPOSITORY",
                title=title,
                description=desc,
                uri=normalized_repo.canonical_url,
                source_reference=normalized_repo.full_name,
                trust_score=0.85 if student_commit_count > 0 else 0.5,
                confidence_score=0.9 if student_commit_count > 0 else 0.4,
                evidence_strength="STRONG" if student_commit_count >= 5 else ("MODERATE" if student_commit_count > 0 else "WEAK"),
                processing_status="COMPLETED",  # Invariant: Processing is complete
                verification_status="PENDING",  # Invariant: Pending human/Phase 3 Step 4 verification
                domain_code="ENGINEERING",
            )
            db.add(evidence)
            await db.flush()

            provenance = EvidenceProvenance(
                evidence_id=evidence.id,
                source_type="GITHUB_API",
                source_url=normalized_repo.canonical_url,
                source_reference=normalized_repo.full_name,
                collection_method="API_INTELLIGENCE",
                extraction_method="GIT_METADATA_ANALYSIS",
                analysis_method="CODE_ATTRIBUTION_V1",
                algorithm_version="v1.0.0",
                observed_at=utc_now(),
            )
            db.add(provenance)

            # 7c. Create Snapshot
            target_branch = request.branch or normalized_repo.default_branch
            head_sha = normalized_commits[0].sha if normalized_commits else None

            primary_lang = normalized_langs[0].language if normalized_langs else None
            snapshot_summary = (
                f"{normalized_repo.full_name} ({primary_lang or 'Unknown'}) - "
                f"{student_commit_count} commits attributed to {student_name}."
            )

            snapshot = GitHubRepositorySnapshot(
                repository_id=db_repo.id,
                evidence_id=evidence.id,
                student_id=student_id_str,
                commit_sha=head_sha,
                snapshot_status="COMPLETED",
                analysis_limits_reached=(len(normalized_commits) >= settings.GITHUB_MAX_COMMITS_ANALYZED),
                summary_metrics={
                    "branch": target_branch,
                    "commit_count": len(normalized_commits),
                    "student_commit_count": student_commit_count,
                    "student_lines_added": student_additions,
                    "student_lines_deleted": student_deletions,
                    "pr_count": len(normalized_prs),
                    "student_pr_count": student_pr_count,
                    "primary_language": primary_lang,
                    "total_languages": len(normalized_langs),
                    "total_dependencies": len(all_deps),
                    "total_contributors": len(normalized_contributors),
                    "student_attributed_commits": student_commit_count,
                },
                error_message=None,
                fetched_at=utc_now(),
            )
            db.add(snapshot)
            await db.flush()

            # 7d. Persist Languages
            for lang in normalized_langs:
                db.add(GitHubLanguage(
                    snapshot_id=snapshot.id,
                    language=lang.language,
                    byte_count=lang.byte_count,
                    percentage=lang.percentage,
                ))

            # 7e. Persist Dependencies
            for dep in all_deps:
                db.add(GitHubDependency(
                    snapshot_id=snapshot.id,
                    ecosystem=dep.ecosystem,
                    package_name=dep.package_name,
                    declared_version=dep.declared_version,
                    manifest_path=dep.manifest_path,
                ))

            # 7f. Persist Contributors
            total_repo_commits = sum(c["contributor"].commit_count for c in contributor_records) or 1
            for cr in contributor_records:
                contrib = cr["contributor"]
                ratio = round((contrib.commit_count / total_repo_commits), 4)
                db.add(GitHubContributor(
                    snapshot_id=snapshot.id,
                    username=contrib.username,
                    external_user_id=contrib.external_user_id,
                    commit_count=contrib.commit_count,
                    additions=0,
                    deletions=0,
                    contribution_ratio=ratio,
                    is_student_linked=cr["is_student"],
                    identity_confidence=cr["confidence"],
                ))

            # 7g. Persist Commits
            for cr in commit_records:
                c = cr["commit"]
                db.add(GitHubCommit(
                    snapshot_id=snapshot.id,
                    sha=c.sha,
                    author_name=c.author_name,
                    author_email=c.author_email,
                    commit_date=c.commit_date,
                    message=c.message,
                    additions=c.additions,
                    deletions=c.deletions,
                    is_student_attributed=cr["is_student"],
                    identity_confidence=cr["confidence"],
                ))

            # 7h. Persist Pull Requests
            for pr_rec in pr_records:
                pr = pr_rec["pr"]
                db.add(GitHubPullRequest(
                    snapshot_id=snapshot.id,
                    pr_number=pr.pr_number,
                    title=pr.title,
                    state=pr.state,
                    author_username=pr.author_username,
                    is_merged=pr.is_merged,
                    merged_at=pr.merged_at,
                    additions=pr.additions,
                    deletions=pr.deletions,
                    changed_files=pr.changed_files,
                ))

            # 7i. Persist Code Areas
            for area_name, stats_dict in area_stats.items():
                db.add(GitHubCodeArea(
                    snapshot_id=snapshot.id,
                    area_name=area_name,
                    files_count=stats_dict.get("files_count", 0),
                    commits_count=stats_dict.get("commits_count", 0),
                    student_commits_count=stats_dict.get("student_commits_count", 0),
                ))

            # 7j. Persist Lineage Indicator
            db.add(GitHubSimilarityIndicator(
                snapshot_id=snapshot.id,
                is_fork=similarity_result.is_fork,
                upstream_repo=similarity_result.upstream_repo,
                fork_divergence_level=similarity_result.fork_divergence_level,
                file_path_overlap_ratio=similarity_result.file_path_overlap_ratio,
                readme_similarity_level=similarity_result.readme_similarity_level,
                indicator_summary=similarity_result.indicator_summary,
                confidence=similarity_result.confidence,
            ))

            # 7k. Create Structured EvidenceClaims
            claims_count = 0
            # Claim 1: Primary Language & Distribution
            if normalized_langs:
                top_langs = ", ".join([f"{l.language} ({l.percentage}%)" for l in normalized_langs[:3]])
                claim1 = EvidenceClaim(
                    evidence_id=evidence.id,
                    claim_type="LANGUAGE_DISTRIBUTION",
                    observed_fact=f"GitHub repository codebase consists of: {top_langs}.",
                    claim_statement=f"Demonstrates development experience in {normalized_langs[0].language}.",
                    confidence=0.95,
                    status="ACTIVE",
                )
                db.add(claim1)
                claims_count += 1

            # Claim 2: Contribution Attribution
            if student_commit_count > 0:
                claim2 = EvidenceClaim(
                    evidence_id=evidence.id,
                    claim_type="AUTHOR_CONTRIBUTION",
                    observed_fact=(
                        f"Student authored {student_commit_count} commits (+{student_additions} / -{student_deletions} lines) "
                        f"out of {len(normalized_commits)} analyzed commits."
                    ),
                    claim_statement=f"Verified direct source code contribution to repository '{normalized_repo.name}'.",
                    confidence=0.9,
                    status="ACTIVE",
                )
                db.add(claim2)
                claims_count += 1

            # Claim 3: Ecosystem & Dependencies
            if all_deps:
                ecosystems = sorted(list({d.ecosystem for d in all_deps}))
                dep_names = ", ".join([d.package_name for d in all_deps[:5]])
                claim3 = EvidenceClaim(
                    evidence_id=evidence.id,
                    claim_type="DEPENDENCY_INTEGRATION",
                    observed_fact=f"Declared {len(all_deps)} dependencies across ecosystems [{', '.join(ecosystems)}]: {dep_names}...",
                    claim_statement=f"Utilized industry-standard libraries and package tooling in {', '.join(ecosystems)}.",
                    confidence=0.85,
                    status="ACTIVE",
                )
                db.add(claim3)
                claims_count += 1

            # Claim 4: Architectural Breadth
            if area_stats:
                areas_list = ", ".join(area_stats.keys())
                claim4 = EvidenceClaim(
                    evidence_id=evidence.id,
                    claim_type="ARCHITECTURAL_AREAS",
                    observed_fact=f"Commit activity touches architectural areas: {areas_list}.",
                    claim_statement=f"Exhibits cross-cutting software development capabilities across {len(area_stats)} code domains.",
                    confidence=0.8,
                    status="ACTIVE",
                )
                db.add(claim4)
                claims_count += 1

            # Claim 5: Lineage / Originality
            if normalized_repo.is_fork:
                claim5 = EvidenceClaim(
                    evidence_id=evidence.id,
                    claim_type="FORK_LINEAGE",
                    observed_fact=similarity_result.indicator_summary,
                    claim_statement=f"Post-fork divergence assessed as {similarity_result.fork_divergence_level}.",
                    confidence=0.85,
                    status="ACTIVE",
                )
                db.add(claim5)
                claims_count += 1
            else:
                claim5 = EvidenceClaim(
                    evidence_id=evidence.id,
                    claim_type="ROOT_REPOSITORY",
                    observed_fact="Repository has no upstream fork parent.",
                    claim_statement="Original project root repository.",
                    confidence=0.95,
                    status="ACTIVE",
                )
                db.add(claim5)
                claims_count += 1

            await db.commit()

        except Exception as e:
            await db.rollback()
            logger.exception("Database transaction failed during GitHub analysis: %s", str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error persisting GitHub intelligence: {str(e)}",
            )

        # 8. Construct Response DTO
        snapshot_dto = await self.get_snapshot_by_id(db, snapshot.id)
        if not snapshot_dto:
            raise HTTPException(status_code=500, detail="Snapshot creation succeeded but retrieval failed.")

        repo_dto = GitHubRepositoryDTO.model_validate(db_repo)

        return GitHubAnalysisResponseDTO(
            evidence_id=str(evidence.id),
            repository=repo_dto,
            snapshot=snapshot_dto,
            claims_count=claims_count,
            processing_status=evidence.processing_status,
            verification_status=evidence.verification_status,
            message=(
                f"Successfully ingested and analyzed repository '{normalized_repo.full_name}'. "
                f"Extracted {len(normalized_langs)} languages, {len(all_deps)} dependencies, "
                f"and attributed {student_commit_count} commits to {student_name}."
            ),
        )

    async def get_snapshot_by_id(
        self, db: AsyncSession, snapshot_id: str
    ) -> Optional[GitHubSnapshotDTO]:
        stmt = (
            select(GitHubRepositorySnapshot)
            .options(
                selectinload(GitHubRepositorySnapshot.languages),
                selectinload(GitHubRepositorySnapshot.dependencies),
                selectinload(GitHubRepositorySnapshot.contributors),
                selectinload(GitHubRepositorySnapshot.commits),
                selectinload(GitHubRepositorySnapshot.pull_requests),
                selectinload(GitHubRepositorySnapshot.code_areas),
                selectinload(GitHubRepositorySnapshot.similarity_indicators),
            )
            .where(GitHubRepositorySnapshot.id == str(snapshot_id))
        )
        res = await db.execute(stmt)
        s = res.scalar_one_or_none()
        if not s:
            return None

        # Format DTOs
        langs_dto = [
            GitHubLanguageDTO(
                language=l.language,
                byte_count=l.byte_count,
                percentage=l.percentage,
            )
            for l in s.languages
        ]
        deps_dto = [
            GitHubDependencyDTO(
                ecosystem=d.ecosystem,
                package_name=d.package_name,
                declared_version=d.declared_version,
                manifest_path=d.manifest_path,
            )
            for d in s.dependencies
        ]
        contribs_dto = [
            GitHubContributorDTO(
                username=c.username,
                commit_count=c.commit_count,
                student_matched=c.is_student_linked,
                match_confidence=c.identity_confidence,
            )
            for c in s.contributors
        ]
        commits_dto = [
            GitHubCommitDTO(
                sha=cm.sha,
                author_name=cm.author_name,
                author_email=cm.author_email,
                commit_date=cm.commit_date,
                message=cm.message or "",
                additions=cm.additions,
                deletions=cm.deletions,
                student_matched=cm.is_student_attributed,
                match_confidence=cm.identity_confidence,
            )
            for cm in s.commits[:20]  # Return top 20 recent commits in snapshot
        ]
        metrics = s.summary_metrics or {}
        branch = metrics.get("branch", "main")
        commit_count = metrics.get("commit_count", len(s.commits))
        student_commit_count = metrics.get("student_commit_count", sum(1 for c in s.commits if c.is_student_attributed))
        student_lines_added = metrics.get("student_lines_added", 0)
        student_lines_deleted = metrics.get("student_lines_deleted", 0)
        pr_count = metrics.get("pr_count", len(s.pull_requests))
        student_pr_count = metrics.get("student_pr_count", 0)
        primary_language = metrics.get("primary_language", s.languages[0].language if s.languages else None)

        total_areas_files = sum(ca.files_count for ca in s.code_areas) or 1
        code_areas_dto = [
            GitHubCodeAreaDTO(
                area_name=ca.area_name,
                file_count=ca.commits_count,  # commit activity representation
                percentage=round((ca.commits_count / max(commit_count, 1)) * 100.0, 1),
            )
            for ca in s.code_areas
        ]

        sim_dto = None
        if s.similarity_indicators:
            si = s.similarity_indicators[0]
            sim_dto = GitHubSimilarityDTO(
                source_type="FORK" if si.is_fork else "ROOT",
                parent_repo_url=f"https://github.com/{si.upstream_repo}" if si.upstream_repo else None,
                divergence_level=si.fork_divergence_level,
                ahead_by_commits=student_commit_count,
                behind_by_commits=0,
                notes=si.indicator_summary,
            )

        summary_text = (
            f"Analyzed {commit_count} commits on branch '{branch}'. "
            f"Primary Language: {primary_language or 'None'}. "
            f"Student Contributions: {student_commit_count} commits."
        )

        return GitHubSnapshotDTO(
            id=str(s.id),
            repository_id=str(s.repository_id),
            evidence_id=str(s.evidence_id),
            student_id=str(s.student_id),
            snapshot_timestamp=s.fetched_at,
            branch=branch,
            head_commit_sha=s.commit_sha,
            commit_count=commit_count,
            student_commit_count=student_commit_count,
            student_lines_added=student_lines_added,
            student_lines_deleted=student_lines_deleted,
            pr_count=pr_count,
            student_pr_count=student_pr_count,
            primary_language=primary_language,
            languages=langs_dto,
            dependencies=deps_dto,
            contributors=contribs_dto,
            recent_commits=commits_dto,
            code_areas=code_areas_dto,
            similarity=sim_dto,
            summary=summary_text,
        )

    async def get_snapshots_for_student(
        self, db: AsyncSession, student_id: str
    ) -> List[GitHubSnapshotDTO]:
        stmt = (
            select(GitHubRepositorySnapshot.id)
            .where(GitHubRepositorySnapshot.student_id == str(student_id))
            .order_by(GitHubRepositorySnapshot.fetched_at.desc())
        )
        res = await db.execute(stmt)
        snapshot_ids = res.scalars().all()

        snapshots: List[GitHubSnapshotDTO] = []
        for sid in snapshot_ids:
            dto = await self.get_snapshot_by_id(db, sid)
            if dto:
                snapshots.append(dto)
        return snapshots

    async def get_repository_by_id(
        self, db: AsyncSession, repo_id: str
    ) -> Optional[GitHubRepositoryDTO]:
        stmt = select(GitHubRepository).where(GitHubRepository.id == str(repo_id))
        res = await db.execute(stmt)
        repo = res.scalar_one_or_none()
        if not repo:
            return None
        return GitHubRepositoryDTO.model_validate(repo)


github_intelligence_service = GitHubIntelligenceService()
