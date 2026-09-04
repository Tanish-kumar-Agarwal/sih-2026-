from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sqlalchemy.orm import selectinload
from app.infrastructure.database.models import (
    StudentCompetency,
    StudentCompetencyStateHistory,
    StudentRoleReadiness,
    Competency,
    Student
)
from app.infrastructure.database.repositories.base import BaseRepository

class ReadinessRepository(BaseRepository[StudentCompetency]):
    def __init__(self, db: AsyncSession):
        super().__init__(StudentCompetency, db)

    async def get_student_competency_state(
        self,
        student_id: str,
        competency_id: str
    ) -> Optional[StudentCompetency]:
        """Fetch canonical current competency state with loaded competency metadata."""
        stmt = (
            select(StudentCompetency)
            .where(
                and_(
                    StudentCompetency.student_id == student_id,
                    StudentCompetency.competency_id == competency_id
                )
            )
            .options(
                selectinload(StudentCompetency.competency)
            )
        )
        res = await self.db.execute(stmt)
        return res.scalars().first()

    async def list_student_competency_states(
        self,
        student_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[StudentCompetency], int]:
        """Paginated list of all active canonical competency states for a student."""
        count_stmt = (
            select(func.count(StudentCompetency.id))
            .where(StudentCompetency.student_id == student_id)
        )
        total = await self.db.scalar(count_stmt) or 0

        stmt = (
            select(StudentCompetency)
            .where(StudentCompetency.student_id == student_id)
            .options(
                selectinload(StudentCompetency.competency)
            )
            .order_by(StudentCompetency.score.desc(), StudentCompetency.created_at)
            .offset(offset)
            .limit(limit)
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all()), total

    async def get_state_history(
        self,
        student_id: str,
        competency_id: str,
        limit: int = 20
    ) -> List[StudentCompetencyStateHistory]:
        """Fetch chronological audit history of competency state changes."""
        stmt = (
            select(StudentCompetencyStateHistory)
            .where(
                and_(
                    StudentCompetencyStateHistory.student_id == student_id,
                    StudentCompetencyStateHistory.competency_id == competency_id
                )
            )
            .order_by(desc(StudentCompetencyStateHistory.recorded_at))
            .limit(limit)
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def record_state_history(
        self,
        state: StudentCompetency
    ) -> StudentCompetencyStateHistory:
        """Create an immutable historical snapshot for an evaluated state."""
        history_entry = StudentCompetencyStateHistory(
            student_id=state.student_id,
            competency_id=state.competency_id,
            proficiency_level=state.proficiency_level,
            score=state.score,
            confidence_score=state.confidence_score,
            state=state.state,
            evidence_count=state.evidence_count,
            verified_evidence_count=state.verified_evidence_count,
            evidence_strength=state.evidence_strength,
            assessment_score=state.assessment_score,
            experience_score=state.experience_score,
            algorithm_version=state.algorithm_version,
            taxonomy_version=state.taxonomy_version,
            provenance=state.provenance or {},
        )
        self.db.add(history_entry)
        await self.db.flush()
        return history_entry

    async def get_student_readiness(
        self,
        student_id: str,
        target_type: str,
        target_id: str
    ) -> Optional[StudentRoleReadiness]:
        """Fetch student target readiness state."""
        stmt = (
            select(StudentRoleReadiness)
            .where(
                and_(
                    StudentRoleReadiness.student_id == student_id,
                    StudentRoleReadiness.target_type == target_type,
                    StudentRoleReadiness.target_id == target_id
                )
            )
        )
        res = await self.db.execute(stmt)
        return res.scalars().first()

    async def list_student_readiness(
        self,
        student_id: str,
        target_type: Optional[str] = None
    ) -> List[StudentRoleReadiness]:
        """List target readiness states for a student."""
        stmt = select(StudentRoleReadiness).where(StudentRoleReadiness.student_id == student_id)
        if target_type:
            stmt = stmt.where(StudentRoleReadiness.target_type == target_type)
        stmt = stmt.order_by(desc(StudentRoleReadiness.readiness_score))
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_target_requirements(
        self,
        target_type: str,
        target_id: str
    ) -> Optional[Tuple[Any, List[Any]]]:
        """
        Fetch canonical target and its required competencies.
        Currently resolves RolesCatalog targets with RoleCompetencyRequirements.
        """
        from app.infrastructure.database.models import RolesCatalog, RoleCompetencyRequirement, Competency
        from sqlalchemy import or_

        if target_type.upper() == "ROLE":
            stmt = (
                select(RolesCatalog)
                .where(
                    or_(
                        RolesCatalog.id == target_id,
                        RolesCatalog.slug == target_id,
                        RolesCatalog.code == target_id
                    )
                )
                .options(
                    selectinload(RolesCatalog.competency_requirements)
                    .selectinload(RoleCompetencyRequirement.competency)
                )
            )
            res = await self.db.execute(stmt)
            role = res.scalars().first()
            if not role:
                return None
            return role, list(role.competency_requirements)
        return None

    async def upsert_target_readiness(
        self,
        student_id: str,
        target_type: str,
        target_id: str,
        readiness_state: str,
        readiness_score: float,
        confidence: float,
        missing_competencies_count: int,
        satisfied_competencies_count: int,
        total_required_count: int,
        algorithm_version: str,
        provenance: Dict[str, Any]
    ) -> StudentRoleReadiness:
        """
        Idempotent atomic update of StudentRoleReadiness evaluation.
        Ensures strict database integrity and constraint satisfaction.
        """
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)

        existing = await self.get_student_readiness(student_id, target_type, target_id)
        if existing:
            existing.readiness_state = readiness_state
            existing.readiness_score = readiness_score
            existing.confidence = confidence
            existing.missing_competencies_count = missing_competencies_count
            existing.satisfied_competencies_count = satisfied_competencies_count
            existing.total_required_count = total_required_count
            existing.algorithm_version = algorithm_version
            existing.provenance = provenance
            existing.calculated_at = now
            existing.updated_at = now
            await self.db.flush()
            return existing
        else:
            new_record = StudentRoleReadiness(
                student_id=student_id,
                target_type=target_type,
                target_id=target_id,
                readiness_state=readiness_state,
                readiness_score=readiness_score,
                confidence=confidence,
                missing_competencies_count=missing_competencies_count,
                satisfied_competencies_count=satisfied_competencies_count,
                total_required_count=total_required_count,
                algorithm_version=algorithm_version,
                provenance=provenance,
                calculated_at=now,
                created_at=now,
                updated_at=now
            )
            self.db.add(new_record)
            await self.db.flush()
            return new_record

    async def get_evidence_mappings_for_competency(
        self,
        student_id: str,
        competency_id: str
    ) -> List[Any]:
        """
        Fetch all evidence-competency mappings for a student and competency,
        eagerly loading evidence, artifacts, and GitHub snapshots.
        """
        from app.infrastructure.database.models import EvidenceCompetency, Evidence, EvidenceArtifact, GitHubRepositorySnapshot
        stmt = (
            select(EvidenceCompetency)
            .join(Evidence, EvidenceCompetency.evidence_id == Evidence.id)
            .where(
                and_(
                    Evidence.student_id == student_id,
                    EvidenceCompetency.competency_id == competency_id
                )
            )
            .options(
                selectinload(EvidenceCompetency.evidence).selectinload(Evidence.artifacts),
                selectinload(EvidenceCompetency.evidence).selectinload(Evidence.github_snapshots),
            )
            .order_by(desc(EvidenceCompetency.confidence))
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_assessments_for_competency(
        self,
        student_id: str,
        competency_id: str
    ) -> List[Any]:
        """Fetch all completed assessment results for a student and competency."""
        from app.infrastructure.database.models import AssessmentResult, CompetencyAssessment
        stmt = (
            select(AssessmentResult)
            .join(CompetencyAssessment, AssessmentResult.assessment_id == CompetencyAssessment.id)
            .where(
                and_(
                    AssessmentResult.student_id == student_id,
                    CompetencyAssessment.competency_id == competency_id
                )
            )
            .order_by(desc(AssessmentResult.completed_at))
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_experiences_for_competency(
        self,
        student_id: str,
        competency_id: str
    ) -> Dict[str, Any]:
        """
        Fetch experiences (internships, projects) relevant to this student and competency.
        Inspects mapped evidence items with PROJECT or INTERNSHIP types, and joins with
        student projects and internships.
        """
        from app.infrastructure.database.models import EvidenceCompetency, Evidence, Project, Internship
        # Query evidence items mapped to this competency that represent projects or internships
        stmt = (
            select(Evidence)
            .join(EvidenceCompetency, Evidence.id == EvidenceCompetency.evidence_id)
            .where(
                and_(
                    Evidence.student_id == student_id,
                    EvidenceCompetency.competency_id == competency_id,
                    Evidence.evidence_type.in_(["PROJECT", "INTERNSHIP", "EXPERIENCE", "WORK_EXPERIENCE"])
                )
            )
        )
        res = await self.db.execute(stmt)
        evidence_exps = list(res.scalars().all())

        # Also fetch student projects and internships for entity metadata enrichment
        proj_res = await self.db.execute(select(Project).where(Project.student_id == student_id))
        student_projects = {p.id: p for p in proj_res.scalars().all()}

        intern_res = await self.db.execute(select(Internship).where(Internship.student_id == student_id))
        student_internships = {i.id: i for i in intern_res.scalars().all()}

        return {
            "evidence_experiences": evidence_exps,
            "projects": student_projects,
            "internships": student_internships
        }

    async def get_distinct_mapped_competencies(
        self,
        student_id: str
    ) -> List[str]:
        """Retrieve distinct competency IDs that have evidence mapped for a student."""
        from app.infrastructure.database.models import EvidenceCompetency, Evidence
        stmt = (
            select(EvidenceCompetency.competency_id)
            .join(Evidence, EvidenceCompetency.evidence_id == Evidence.id)
            .where(Evidence.student_id == student_id)
            .distinct()
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def upsert_competency_state(
        self,
        student_id: str,
        competency_id: str,
        proficiency_level: str,
        score: float,
        confidence: float,
        state: str,
        evidence_count: int,
        verified_evidence_count: int,
        evidence_strength: Optional[str],
        assessment_score: Optional[float],
        experience_score: Optional[float],
        is_verified: bool,
        algorithm_version: str,
        taxonomy_version: str,
        provenance: Dict[str, Any]
    ) -> StudentCompetency:
        """
        Idempotent atomic update of StudentCompetency state.
        Ensures strict database integrity and constraint satisfaction.
        """
        from datetime import datetime, timezone
        from sqlalchemy import func
        now = datetime.now(timezone.utc)

        existing = await self.get_student_competency_state(student_id, competency_id)
        if existing:
            existing.proficiency_level = proficiency_level
            existing.score = score
            existing.confidence_score = confidence
            existing.state = state
            existing.evidence_count = evidence_count
            existing.verified_evidence_count = verified_evidence_count
            existing.evidence_strength = evidence_strength
            existing.assessment_score = assessment_score
            existing.experience_score = experience_score
            existing.is_verified = is_verified
            if is_verified and not existing.verified_at:
                existing.verified_at = now
            existing.algorithm_version = algorithm_version
            existing.taxonomy_version = taxonomy_version
            existing.provenance = provenance
            existing.last_evaluated_at = now
            existing.updated_at = now
            await self.db.flush()
            return existing
        else:
            new_state = StudentCompetency(
                student_id=student_id,
                competency_id=competency_id,
                proficiency_level=proficiency_level,
                score=score,
                confidence_score=confidence,
                state=state,
                evidence_count=evidence_count,
                verified_evidence_count=verified_evidence_count,
                evidence_strength=evidence_strength,
                assessment_score=assessment_score,
                experience_score=experience_score,
                is_verified=is_verified,
                verified_at=now if is_verified else None,
                algorithm_version=algorithm_version,
                taxonomy_version=taxonomy_version,
                provenance=provenance,
                last_evaluated_at=now,
                created_at=now,
                updated_at=now
            )
            self.db.add(new_state)
            await self.db.flush()
            return new_state
