import logging
from typing import Optional, List, Dict, Any, Set
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.infrastructure.database.models import StudentCompetency, Competency, Student
from app.infrastructure.database.repositories.readiness_repo import ReadinessRepository
from app.infrastructure.database.repositories.student_repo import StudentRepository
from app.domains.readiness.enums import CompetencyState, ReadinessState, TargetContextType, EvidenceStrengthLevel
from app.domains.readiness.schemas import (
    StudentCompetencyStateResponse,
    StudentCompetencyStateHistoryResponse,
    StudentCompetencyStateListResponse,
    StudentReadinessStateResponse,
    StudentReadinessStateListResponse,
    CompetencyReference,
)
from app.domains.competencies.taxonomy_constants import ProficiencyLevel
from app.domains.readiness.readiness_engine import (
    ReadinessEngine,
    TargetRequirementInput,
    StudentCompetencyInput,
    ReadinessEvaluationResult
)

logger = logging.getLogger(__name__)

class ReadinessDomainService:
    """
    Phase 4 Step 1: Readiness Domain Foundation & Canonical Competency State Service.
    Enforces cross-student isolation, provenance auditability, and distinct
    semantics for Proficiency, Confidence, Evidence Coverage, Competency State, and Readiness State.
    """

    async def get_canonical_competency_state(
        self,
        db: AsyncSession,
        student_id: str,
        competency_id: str
    ) -> StudentCompetencyStateResponse:
        """
        Retrieve canonical competency state for student + competency.
        If student exists and competency exists but no state has been evaluated yet,
        returns deterministic initial state (NOT_ASSESSED, score=0.0, confidence=0.0)
        without inventing proficiency.
        """
        readiness_repo = ReadinessRepository(db)
        state = await readiness_repo.get_student_competency_state(student_id, competency_id)

        if state:
            return self._map_state_to_response(state)

        # Check if competency exists
        from sqlalchemy import select
        comp_res = await db.execute(select(Competency).where(Competency.id == competency_id))
        comp = comp_res.scalars().first()
        if not comp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Competency '{competency_id}' not found in canonical taxonomy."
            )

        # Return deterministic unassessed initial state (Invariant 8 & Scenario A)
        return StudentCompetencyStateResponse(
            id=f"unassessed-{student_id[:8]}-{competency_id[:8]}",
            student_id=student_id,
            competency_id=competency_id,
            competency=CompetencyReference(
                id=comp.id,
                name=comp.name,
                code=comp.code,
                category=comp.category
            ),
            proficiency_level=ProficiencyLevel.FOUNDATIONAL,
            proficiency_score=0.0,
            confidence=0.0,
            state=CompetencyState.NOT_ASSESSED,
            evidence_count=0,
            verified_evidence_count=0,
            evidence_strength=None,
            assessment_signal=None,
            experience_signal=None,
            is_verified=False,
            algorithm_version="v1.0.0",
            taxonomy_version="v1.0.0",
            provenance={"initialized": True, "reason": "No evaluation recorded yet"},
            last_evaluated_at=None,
            updated_at=None
        )

    async def list_student_competency_states(
        self,
        db: AsyncSession,
        student_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> StudentCompetencyStateListResponse:
        """List all canonical competency states evaluated for the student."""
        readiness_repo = ReadinessRepository(db)
        states, total = await readiness_repo.list_student_competency_states(student_id, limit=limit, offset=offset)

        items = [self._map_state_to_response(s) for s in states]
        return StudentCompetencyStateListResponse(
            student_id=student_id,
            total=total,
            items=items
        )

    async def get_state_history(
        self,
        db: AsyncSession,
        student_id: str,
        competency_id: str,
        limit: int = 20
    ) -> List[StudentCompetencyStateHistoryResponse]:
        """Fetch chronological audit history for this student's competency state."""
        readiness_repo = ReadinessRepository(db)
        history = await readiness_repo.get_state_history(student_id, competency_id, limit=limit)
        return [
            StudentCompetencyStateHistoryResponse(
                id=h.id,
                student_id=h.student_id,
                competency_id=h.competency_id,
                proficiency_level=h.proficiency_level,
                proficiency_score=h.score,
                confidence=h.confidence_score,
                state=h.state,
                evidence_count=h.evidence_count,
                verified_evidence_count=h.verified_evidence_count,
                evidence_strength=h.evidence_strength,
                assessment_signal=h.assessment_score,
                experience_signal=h.experience_score,
                algorithm_version=h.algorithm_version,
                taxonomy_version=h.taxonomy_version,
                provenance=h.provenance or {},
                recorded_at=h.recorded_at
            )
            for h in history
        ]

    async def list_student_readiness_states(
        self,
        db: AsyncSession,
        student_id: str,
        target_type: Optional[str] = None
    ) -> StudentReadinessStateListResponse:
        """List target readiness states for the student."""
        readiness_repo = ReadinessRepository(db)
        records = await readiness_repo.list_student_readiness(student_id, target_type=target_type)
        items = [self._map_readiness_record_to_response(r) for r in records]
        return StudentReadinessStateListResponse(
            student_id=student_id,
            total=len(items),
            items=items
        )

    async def get_target_readiness_state(
        self,
        db: AsyncSession,
        student_id: str,
        target_id: str,
        target_type: str = "ROLE"
    ) -> StudentReadinessStateResponse:
        """
        Fetch target readiness state.
        If already evaluated, returns persisted state with complete explainability.
        If not yet evaluated, automatically evaluates against target requirements and persists foundation.
        """
        readiness_repo = ReadinessRepository(db)
        record = await readiness_repo.get_student_readiness(student_id, target_type, target_id)
        if record:
            return self._map_readiness_record_to_response(record)

        # Check if target exists in canonical catalog before calculation
        target_res = await readiness_repo.get_target_requirements(target_type, target_id)
        if not target_res:
            try:
                tc_enum = TargetContextType(target_type.upper())
            except ValueError:
                tc_enum = TargetContextType.ROLE

            return StudentReadinessStateResponse(
                student_id=student_id,
                target_type=tc_enum,
                target_id=target_id,
                target_title=target_id,
                readiness_state=ReadinessState.NOT_ASSESSED,
                readiness_score=0.0,
                confidence=0.0,
                missing_competencies_count=0,
                satisfied_competencies_count=0,
                total_required_count=0,
                summary=f"Readiness has not yet been evaluated for target '{target_id}'.",
                strengths=[],
                gaps=[],
                critical_blockers=[],
                requirements=[],
                provenance={"notice": "Target readiness not yet calculated"},
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )

        # Evaluate on-demand against canonical target requirements
        return await self.calculate_target_readiness(
            db=db,
            student_id=student_id,
            target_id=target_id,
            target_type=target_type,
            persist=True
        )

    async def calculate_target_readiness(
        self,
        db: AsyncSession,
        student_id: str,
        target_id: str,
        target_type: str = "ROLE",
        persist: bool = True
    ) -> StudentReadinessStateResponse:
        """
        Orchestrates full deterministic readiness evaluation, gap analysis,
        blocker detection, and explainability provenance generation.
        Atomically persists StudentRoleReadiness state into PostgreSQL.
        """
        readiness_repo = ReadinessRepository(db)

        # 1. Fetch canonical target requirements
        target_res = await readiness_repo.get_target_requirements(target_type, target_id)
        if not target_res:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Target '{target_id}' of type '{target_type}' not found in canonical catalog."
            )

        target_obj, raw_reqs = target_res
        target_title = getattr(target_obj, "title", target_id)

        # 2. Build target requirement inputs
        req_inputs: List[TargetRequirementInput] = []
        student_states: Dict[str, StudentCompetencyInput] = {}

        for rq in raw_reqs:
            comp_name = rq.competency.name if rq.competency else rq.competency_id
            req_inputs.append(
                TargetRequirementInput(
                    competency_id=rq.competency_id,
                    competency_name=comp_name,
                    required_proficiency=rq.required_proficiency,
                    requirement_type=rq.requirement_type,
                    weight=rq.weight or 1.0,
                    notes=rq.notes
                )
            )

            # 3. Load student competency state for each requirement
            st_comp = await readiness_repo.get_student_competency_state(student_id, rq.competency_id)
            if st_comp:
                student_states[rq.competency_id] = StudentCompetencyInput(
                    competency_id=st_comp.competency_id,
                    proficiency_level=st_comp.proficiency_level or "FOUNDATIONAL",
                    proficiency_score=st_comp.score or 0.0,
                    confidence=st_comp.confidence_score or 0.0,
                    evidence_count=st_comp.evidence_count or 0,
                    verified_evidence_count=st_comp.verified_evidence_count or 0,
                    state=st_comp.state or "NOT_ASSESSED"
                )

        # 4. Run deterministic Readiness Engine evaluation
        eval_result: ReadinessEvaluationResult = ReadinessEngine.evaluate(
            target_id=target_id,
            target_type=target_type,
            target_title=target_title,
            requirements=req_inputs,
            student_states=student_states
        )

        # 5. Persist to PostgreSQL if required
        persisted_record = None
        if persist:
            persisted_record = await readiness_repo.upsert_target_readiness(
                student_id=student_id,
                target_type=target_type,
                target_id=target_id,
                readiness_state=eval_result.readiness_state.value,
                readiness_score=eval_result.readiness_score,
                confidence=eval_result.confidence,
                missing_competencies_count=eval_result.missing_competencies_count,
                satisfied_competencies_count=eval_result.satisfied_competencies_count,
                total_required_count=eval_result.total_required_count,
                algorithm_version=eval_result.algorithm_version,
                provenance=eval_result.provenance
            )
            await db.commit()

        rec_id = persisted_record.id if persisted_record else f"eval-{student_id[:8]}-{target_id[:8]}"
        calc_at = persisted_record.calculated_at if persisted_record else datetime.now(timezone.utc)
        upd_at = persisted_record.updated_at if persisted_record else None

        return StudentReadinessStateResponse(
            id=rec_id,
            student_id=student_id,
            target_type=TargetContextType(target_type.upper()),
            target_id=target_id,
            target_title=target_title,
            readiness_state=eval_result.readiness_state,
            readiness_score=eval_result.readiness_score,
            confidence=eval_result.confidence,
            missing_competencies_count=eval_result.missing_competencies_count,
            satisfied_competencies_count=eval_result.satisfied_competencies_count,
            total_required_count=eval_result.total_required_count,
            algorithm_version=eval_result.algorithm_version,
            summary=eval_result.summary,
            strengths=eval_result.strengths,
            gaps=eval_result.gaps,
            critical_blockers=eval_result.critical_blockers,
            requirements=eval_result.provenance.get("requirements", []),
            provenance=eval_result.provenance,
            calculated_at=calc_at,
            updated_at=upd_at
        )

    def _map_readiness_record_to_response(self, record: StudentRoleReadiness) -> StudentReadinessStateResponse:
        prov = record.provenance or {}
        state_str = (record.readiness_state or "NOT_ASSESSED").upper()
        try:
            r_state = ReadinessState(state_str)
        except ValueError:
            r_state = ReadinessState.NOT_ASSESSED

        try:
            t_type = TargetContextType(record.target_type.upper())
        except ValueError:
            t_type = TargetContextType.ROLE

        return StudentReadinessStateResponse(
            id=record.id,
            student_id=record.student_id,
            target_type=t_type,
            target_id=record.target_id,
            target_title=prov.get("target_title"),
            readiness_state=r_state,
            readiness_score=record.readiness_score or 0.0,
            confidence=record.confidence or 0.0,
            missing_competencies_count=record.missing_competencies_count or 0,
            satisfied_competencies_count=record.satisfied_competencies_count or 0,
            total_required_count=record.total_required_count or 0,
            algorithm_version=record.algorithm_version or "v1.2.0",
            summary=prov.get("summary"),
            strengths=prov.get("strengths", []),
            gaps=prov.get("gaps", []),
            critical_blockers=prov.get("critical_blockers", []),
            requirements=prov.get("requirements", []),
            provenance=prov,
            calculated_at=record.calculated_at,
            updated_at=record.updated_at
        )

    async def recalculate_competency_proficiency(
        self,
        db: AsyncSession,
        student_id: str,
        competency_id: str
    ) -> StudentCompetencyStateResponse:
        """
        Orchestrates full deterministic aggregation of Phase 3 evidence, assessments,
        and experiences for a student's competency.
        Atomically updates StudentCompetency and records immutable state history.
        """
        from app.domains.readiness.aggregation_engine import (
            ProficiencyAggregationEngine, EvidenceInputItem, AssessmentInputItem, ExperienceInputItem
        )
        readiness_repo = ReadinessRepository(db)

        # Verify competency exists
        from sqlalchemy import select
        comp_res = await db.execute(select(Competency).where(Competency.id == competency_id))
        comp = comp_res.scalars().first()
        if not comp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Competency '{competency_id}' not found in canonical taxonomy."
            )

        # 1. Fetch eligible evidence mappings
        raw_mappings = await readiness_repo.get_evidence_mappings_for_competency(student_id, competency_id)
        evidence_inputs: List[EvidenceInputItem] = []

        for m in raw_mappings:
            ev = m.evidence
            chk = None
            if ev.artifacts and len(ev.artifacts) > 0:
                chk = ev.artifacts[0].sha256_checksum

            commits_cnt = None
            contrib_ratio = None
            if ev.github_snapshots and len(ev.github_snapshots) > 0:
                snap = ev.github_snapshots[0]
                metrics = snap.summary_metrics or {}
                commits_cnt = metrics.get("student_commits_count")
                total_c = metrics.get("total_commits", 0)
                if total_c > 0 and commits_cnt is not None:
                    contrib_ratio = min(1.0, commits_cnt / total_c)

            evidence_inputs.append(
                EvidenceInputItem(
                    mapping_id=m.id,
                    evidence_id=m.evidence_id,
                    evidence_type=ev.evidence_type,
                    source_type=ev.source_type,
                    source_uri=ev.uri,
                    sha256_checksum=chk,
                    mapping_status=m.mapping_status,
                    mapping_method=m.mapping_method,
                    mapping_confidence=m.confidence or 0.8,
                    evidence_strength=m.evidence_strength or "MODERATE",
                    verification_status=ev.verification_status,
                    created_at=m.created_at,
                    student_commits_count=commits_cnt,
                    contribution_ratio=contrib_ratio
                )
            )

        # 2. Fetch completed assessments
        raw_assessments = await readiness_repo.get_assessments_for_competency(student_id, competency_id)
        assessment_inputs: List[AssessmentInputItem] = []
        for a in raw_assessments:
            assessment_inputs.append(
                AssessmentInputItem(
                    assessment_id=a.assessment_id,
                    score=a.score,
                    passed=a.passed,
                    integrity_score=a.integrity_score or 1.0,
                    completed_at=a.completed_at
                )
            )

        # 3. Fetch experiences (Projects, Internships)
        exp_data = await readiness_repo.get_experiences_for_competency(student_id, competency_id)
        experience_inputs: List[ExperienceInputItem] = []
        seen_exp_ids: Set[str] = set()

        for ev in exp_data.get("evidence_experiences", []):
            if ev.id in seen_exp_ids:
                continue
            seen_exp_ids.add(ev.id)

            exp_type = ev.evidence_type.upper()
            title = ev.title
            is_verified = (ev.verification_status.upper() == "VERIFIED")
            duration_months = 3.0

            if ev.entity_id:
                if ev.entity_type == "PROJECT" and ev.entity_id in exp_data.get("projects", {}):
                    proj = exp_data["projects"][ev.entity_id]
                    title = proj.title
                    is_verified = is_verified or proj.is_verified
                    duration_months = 2.0
                elif ev.entity_type == "INTERNSHIP" and ev.entity_id in exp_data.get("internships", {}):
                    intern = exp_data["internships"][ev.entity_id]
                    title = f"{intern.role} at {intern.company_name}"
                    is_verified = is_verified or intern.is_verified
                    if intern.start_date and intern.end_date:
                        duration_months = max(1.0, (intern.end_date - intern.start_date).days / 30.4375)

            experience_inputs.append(
                ExperienceInputItem(
                    experience_id=ev.id,
                    experience_type=exp_type,
                    title=title,
                    is_verified=is_verified,
                    duration_months=round(duration_months, 1)
                )
            )

        # 4. Execute deterministic aggregation
        agg_result = ProficiencyAggregationEngine.aggregate(
            evidence_items=evidence_inputs,
            assessment_items=assessment_inputs,
            experience_items=experience_inputs
        )

        # 4. Atomically persist canonical state
        strength_str = agg_result.evidence_strength.value if agg_result.evidence_strength else None
        state_record = await readiness_repo.upsert_competency_state(
            student_id=student_id,
            competency_id=competency_id,
            proficiency_level=agg_result.proficiency_level.value,
            score=agg_result.proficiency_score,
            confidence=agg_result.confidence,
            state=agg_result.state.value,
            evidence_count=agg_result.evidence_count,
            verified_evidence_count=agg_result.verified_evidence_count,
            evidence_strength=strength_str,
            assessment_score=agg_result.assessment_signal,
            experience_score=agg_result.experience_signal,
            is_verified=agg_result.is_verified,
            algorithm_version=agg_result.algorithm_version,
            taxonomy_version=agg_result.taxonomy_version,
            provenance=agg_result.provenance
        )

        # 5. Record immutable historical snapshot (Option A auditability)
        await readiness_repo.record_state_history(state_record)
        await db.commit()

        return await self.get_canonical_competency_state(db, student_id, competency_id)

    async def recalculate_student_all_competencies(
        self,
        db: AsyncSession,
        student_id: str
    ) -> StudentCompetencyStateListResponse:
        """
        Recalculates proficiency for all competencies that currently have evidence mapped for this student.
        """
        readiness_repo = ReadinessRepository(db)
        comp_ids = await readiness_repo.get_distinct_mapped_competencies(student_id)

        for c_id in comp_ids:
            await self.recalculate_competency_proficiency(db, student_id, c_id)

        return await self.list_student_competency_states(db, student_id)

    def _map_state_to_response(self, state: StudentCompetency) -> StudentCompetencyStateResponse:
        comp_ref = None
        if state.competency:
            comp_ref = CompetencyReference(
                id=state.competency.id,
                name=state.competency.name,
                code=state.competency.code,
                category=state.competency.category
            )

        # Map proficiency level to enum safely
        level_str = (state.proficiency_level or "FOUNDATIONAL").upper()
        try:
            prof_level = ProficiencyLevel(level_str)
        except ValueError:
            prof_level = ProficiencyLevel.FOUNDATIONAL

        # Map state to enum safely
        state_str = (state.state or "NOT_ASSESSED").upper()
        try:
            comp_state = CompetencyState(state_str)
        except ValueError:
            comp_state = CompetencyState.NOT_ASSESSED

        return StudentCompetencyStateResponse(
            id=state.id,
            student_id=state.student_id,
            competency_id=state.competency_id,
            competency=comp_ref,
            proficiency_level=prof_level,
            proficiency_score=state.score or 0.0,
            confidence=state.confidence_score or 0.0,
            state=comp_state,
            evidence_count=state.evidence_count or 0,
            verified_evidence_count=state.verified_evidence_count or 0,
            evidence_strength=state.evidence_strength,
            assessment_signal=state.assessment_score,
            experience_signal=state.experience_score,
            is_verified=state.is_verified or False,
            algorithm_version=state.algorithm_version or "v1.0.0",
            taxonomy_version=state.taxonomy_version or "v1.0.0",
            provenance=state.provenance or {},
            last_evaluated_at=state.last_evaluated_at,
            updated_at=state.updated_at
        )

readiness_service = ReadinessDomainService()

