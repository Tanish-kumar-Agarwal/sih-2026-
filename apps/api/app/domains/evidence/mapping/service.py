from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.infrastructure.database.models import (
    Evidence,
    EvidenceCompetency,
    EvidenceSkill,
    EvidenceClaim,
    EvidenceVerification,
    Competency,
    Skill,
    Student,
    User,
    gen_uuid,
    utc_now
)
from app.domains.evidence.mapping.enums import MappingStatus, MappingMethod, EvidenceStrength
from app.domains.evidence.mapping.engine import EvidenceCompetencyMappingEngine, ResolvedCompetencyMapping
from app.domains.evidence.mapping.schemas import (
    EvidenceCompetencyMappingResponse,
    MappingVerifyRequest,
    MappingVerifyResponse,
    CompetencyEvidenceItemDTO,
    CompetencyEvidenceProfileResponse,
    EvidenceMappingTriggerResponse
)

class EvidenceMappingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.engine = EvidenceCompetencyMappingEngine(db)

    async def map_evidence(
        self,
        evidence_id: str,
        current_user_id: str,
        persona: str = "student"
    ) -> EvidenceMappingTriggerResponse:
        """
        Executes end-to-end deterministic discovery, taxonomy resolution, and mapping persistence.
        Guarantees idempotency and preserves historical human verifications.
        """
        # 1. Fetch evidence with student relationship
        stmt = (
            select(Evidence)
            .where(Evidence.id == evidence_id)
            .options(selectinload(Evidence.student))
        )
        res = await self.db.execute(stmt)
        evidence = res.scalar_one_or_none()

        if not evidence:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Evidence with id '{evidence_id}' not found"
            )

        # Persona authorization boundary
        if not persona.startswith(("fac-", "adm-", "system")):
            if evidence.student and evidence.student.user_id != current_user_id and evidence.student_id != current_user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cross-student access denied: You cannot map evidence belonging to another student"
                )

        # 2. Discover observed facts
        facts = await self.engine.discover_facts(evidence)

        # 3. Resolve canonical competencies
        resolved_mappings = await self.engine.map_facts_to_competencies(evidence, facts)

        # 4. Fetch existing mappings to preserve human verifications
        stmt_existing = (
            select(EvidenceCompetency)
            .where(EvidenceCompetency.evidence_id == evidence_id)
        )
        res_existing = await self.db.execute(stmt_existing)
        existing_by_comp: Dict[str, EvidenceCompetency] = {
            m.competency_id: m for m in res_existing.scalars().all()
        }

        # 5. Persist or update mappings transactionally
        saved_records: List[EvidenceCompetency] = []

        for rm in resolved_mappings:
            if rm.competency_id in existing_by_comp:
                rec = existing_by_comp[rm.competency_id]
                # If already human verified (CONFIRMED or REJECTED), preserve status and decision!
                if rec.mapping_status in (MappingStatus.CONFIRMED.value, MappingStatus.REJECTED.value):
                    # Update secondary facts without overwriting human decision
                    rec.source_location = rm.source_location
                    rec.algorithm_version = rm.algorithm_version
                else:
                    # Update with latest deterministic values
                    rec.mapping_method = rm.mapping_method.value
                    rec.confidence = rm.confidence
                    rec.confidence_reason = rm.confidence_reason
                    rec.evidence_strength = rm.evidence_strength.value
                    rec.skill_id = rm.skill_id
                    rec.source_location = rm.source_location
                    rec.source_claim_id = rm.source_claim_id
                    rec.algorithm_version = rm.algorithm_version
                rec.updated_at = utc_now()
                saved_records.append(rec)
            else:
                # Create structured supporting claim if none exists
                claim_id = rm.source_claim_id
                if not claim_id and rm.skill_name:
                    claim_obj = EvidenceClaim(
                        id=gen_uuid(),
                        evidence_id=evidence.id,
                        claim_type="COMPETENCY_INDICATOR",
                        observed_fact=f"Demonstrates competence in {rm.competency_name} via {rm.skill_name}",
                        claim_statement=rm.confidence_reason,
                        confidence=rm.confidence,
                        status="ACTIVE",
                        created_at=utc_now()
                    )
                    self.db.add(claim_obj)
                    await self.db.flush()
                    claim_id = claim_obj.id

                new_rec = EvidenceCompetency(
                    id=gen_uuid(),
                    evidence_id=evidence.id,
                    competency_id=rm.competency_id,
                    claim_id=claim_id,
                    mapping_source="ALGORITHM_RESOLVED",
                    confidence=rm.confidence,
                    weight=1.0,
                    mapping_status=rm.mapping_status.value,
                    mapping_method=rm.mapping_method.value,
                    confidence_reason=rm.confidence_reason,
                    evidence_strength=rm.evidence_strength.value,
                    skill_id=rm.skill_id,
                    source_location=rm.source_location,
                    algorithm_version=rm.algorithm_version,
                    created_at=utc_now(),
                    updated_at=utc_now()
                )
                self.db.add(new_rec)
                saved_records.append(new_rec)

            # Ensure evidence_skills entry exists for canonical skill
            if rm.skill_id:
                sk_stmt = select(EvidenceSkill).where(
                    and_(
                        EvidenceSkill.evidence_id == evidence.id,
                        EvidenceSkill.skill_id == rm.skill_id
                    )
                )
                sk_res = await self.db.execute(sk_stmt)
                if not sk_res.scalar_one_or_none():
                    new_sk = EvidenceSkill(
                        id=gen_uuid(),
                        evidence_id=evidence.id,
                        skill_id=rm.skill_id,
                        claim_id=rm.source_claim_id,
                        relevance_score=rm.confidence,
                        created_at=utc_now()
                    )
                    self.db.add(new_sk)

        # Update processing_status on evidence if not already completed
        if evidence.processing_status != "COMPLETED":
            evidence.processing_status = "COMPLETED"
            evidence.updated_at = utc_now()

        await self.db.commit()

        # Reload mappings with full relations
        reloaded = await self.get_evidence_mappings(evidence_id)

        return EvidenceMappingTriggerResponse(
            success=True,
            evidence_id=evidence_id,
            discovered_facts_count=len(facts),
            created_mappings_count=len(saved_records),
            mappings=reloaded
        )

    async def get_evidence_mappings(self, evidence_id: str) -> List[EvidenceCompetencyMappingResponse]:
        """Returns all competency mappings for an evidence item."""
        stmt = (
            select(EvidenceCompetency)
            .where(EvidenceCompetency.evidence_id == evidence_id)
            .options(
                selectinload(EvidenceCompetency.competency).selectinload(Competency.category_rel),
                selectinload(EvidenceCompetency.skill)
            )
            .order_by(EvidenceCompetency.confidence.desc())
        )
        res = await self.db.execute(stmt)
        records = res.scalars().all()

        results = []
        for r in records:
            cat_name = r.competency.category_rel.name if (r.competency and r.competency.category_rel) else None
            results.append(
                EvidenceCompetencyMappingResponse(
                    id=r.id,
                    evidence_id=r.evidence_id,
                    competency_id=r.competency_id,
                    competency_name=r.competency.name if r.competency else "Unknown",
                    competency_slug=r.competency.slug if r.competency else "unknown",
                    competency_category=cat_name,
                    skill_id=r.skill_id,
                    skill_name=r.skill.name if r.skill else None,
                    claim_id=r.claim_id,
                    mapping_status=MappingStatus(r.mapping_status),
                    mapping_method=MappingMethod(r.mapping_method),
                    confidence=r.confidence or 0.0,
                    confidence_reason=r.confidence_reason,
                    evidence_strength=EvidenceStrength(r.evidence_strength or "MODERATE"),
                    source_location=r.source_location,
                    algorithm_version=r.algorithm_version or "v1.0.0",
                    reviewed_by=r.reviewed_by,
                    reviewed_at=r.reviewed_at,
                    review_reason=r.review_reason,
                    created_at=r.created_at,
                    updated_at=r.updated_at
                )
            )
        return results

    async def verify_mapping(
        self,
        evidence_id: str,
        competency_id: str,
        reviewer_id: str,
        reviewer_role: str,
        verification_req: MappingVerifyRequest
    ) -> MappingVerifyResponse:
        """
        Auditable human verification (CONFIRMED or REJECTED) of an evidence-competency mapping.
        """
        # 1. Enforce reviewer role
        if not reviewer_role.startswith(("fac-", "faculty", "ind-", "industry", "adm-", "admin")):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Reviewer authorization required: Only faculty, industry, or admin personas can verify mappings."
            )

        stmt = (
            select(EvidenceCompetency)
            .where(
                and_(
                    EvidenceCompetency.evidence_id == evidence_id,
                    EvidenceCompetency.competency_id == competency_id
                )
            )
        )
        res = await self.db.execute(stmt)
        mapping = res.scalar_one_or_none()

        if not mapping:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mapping for evidence '{evidence_id}' and competency '{competency_id}' not found."
            )

        # Resolve user ID for foreign key constraint if a persona alias like 'fac-ramesh-chandra' was supplied
        clean_key = reviewer_id.split("-", 1)[1] if "-" in reviewer_id else reviewer_id
        user_stmt = select(User).where(or_(User.id == reviewer_id, User.id == f"usr-{clean_key}"))
        u_res = await self.db.execute(user_stmt)
        valid_user = u_res.scalars().first()
        valid_reviewer_id = valid_user.id if valid_user else None

        # 2. Update mapping state and audit record
        mapping.mapping_status = verification_req.status.value
        mapping.reviewed_by = valid_reviewer_id
        mapping.reviewed_at = utc_now()
        mapping.review_reason = verification_req.review_reason
        mapping.updated_at = utc_now()

        if verification_req.status == MappingStatus.CONFIRMED:
            mapping.mapping_method = MappingMethod.HUMAN_VERIFIED.value
            mapping.evidence_strength = EvidenceStrength.STRONG.value
            mapping.confidence = min(0.99, max(mapping.confidence or 0.8, 0.95))

        # 3. Create an EvidenceVerification audit record
        audit = EvidenceVerification(
            id=gen_uuid(),
            evidence_id=evidence_id,
            verifier_id=valid_reviewer_id,
            verifier_role=reviewer_role,
            status="APPROVED" if verification_req.status == MappingStatus.CONFIRMED else "REJECTED",
            remarks=f"Mapping to competency {competency_id} marked as {verification_req.status.value}: {verification_req.review_reason}"
        )
        self.db.add(audit)

        await self.db.commit()

        return MappingVerifyResponse(
            success=True,
            mapping_id=mapping.id,
            evidence_id=evidence_id,
            competency_id=competency_id,
            new_status=verification_req.status,
            reviewed_by=reviewer_id,
            reviewed_at=mapping.reviewed_at,
            review_reason=verification_req.review_reason
        )

    async def get_student_competency_evidence_profile(
        self,
        student_id: str,
        competency_id: str
    ) -> CompetencyEvidenceProfileResponse:
        """
        Aggregates all independent evidence supporting a student's competency.
        Zero black-box proficiency calculation. Retains complete provenance and auditability.
        """
        # 1. Fetch competency
        stmt_c = (
            select(Competency)
            .where(Competency.id == competency_id)
            .options(selectinload(Competency.category_rel))
        )
        res_c = await self.db.execute(stmt_c)
        comp = res_c.scalar_one_or_none()

        if not comp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Competency '{competency_id}' not found in canonical taxonomy."
            )

        # 2. Fetch all mappings for this student and competency
        stmt_m = (
            select(EvidenceCompetency)
            .join(Evidence, EvidenceCompetency.evidence_id == Evidence.id)
            .where(
                and_(
                    Evidence.student_id == student_id,
                    EvidenceCompetency.competency_id == competency_id
                )
            )
            .options(
                selectinload(EvidenceCompetency.evidence),
                selectinload(EvidenceCompetency.skill)
            )
            .order_by(EvidenceCompetency.confidence.desc())
        )
        res_m = await self.db.execute(stmt_m)
        mappings = res_m.scalars().all()

        items: List[CompetencyEvidenceItemDTO] = []
        verified_count = 0
        max_conf = 0.0
        strength_ranks = {
            EvidenceStrength.WEAK: 1,
            EvidenceStrength.MODERATE: 2,
            EvidenceStrength.STRONG: 3,
            EvidenceStrength.VERY_STRONG: 4
        }
        highest_strength: Optional[EvidenceStrength] = None

        for m in mappings:
            ev = m.evidence
            ev_str = EvidenceStrength(m.evidence_strength or "MODERATE")

            if m.mapping_status == MappingStatus.CONFIRMED.value or ev.verification_status == "VERIFIED":
                verified_count += 1

            if m.confidence and m.confidence > max_conf:
                max_conf = m.confidence

            if highest_strength is None or strength_ranks[ev_str] > strength_ranks[highest_strength]:
                highest_strength = ev_str

            items.append(
                CompetencyEvidenceItemDTO(
                    mapping_id=m.id,
                    evidence_id=m.evidence_id,
                    evidence_title=ev.title if ev else "Untitled Evidence",
                    evidence_type=ev.evidence_type if ev else "OTHER",
                    source_type=ev.source_type if ev else "OTHER",
                    uri=ev.uri if ev else None,
                    verification_status=ev.verification_status if ev else "PENDING",
                    mapping_status=MappingStatus(m.mapping_status),
                    mapping_method=MappingMethod(m.mapping_method),
                    confidence=m.confidence or 0.0,
                    confidence_reason=m.confidence_reason,
                    evidence_strength=ev_str,
                    source_location=m.source_location,
                    skill_name=m.skill.name if m.skill else None,
                    created_at=m.created_at
                )
            )

        cat_name = comp.category_rel.name if comp.category_rel else None

        return CompetencyEvidenceProfileResponse(
            competency_id=comp.id,
            competency_name=comp.name,
            competency_slug=comp.slug,
            competency_category=cat_name,
            mapped_evidence_count=len(items),
            verified_evidence_count=verified_count,
            strongest_evidence=highest_strength,
            max_mapping_confidence=round(max_conf, 2),
            evidence_items=items
        )

    async def get_student_evidence_mappings(
        self,
        student_id: str,
        status_filter: Optional[str] = None
    ) -> List[EvidenceCompetencyMappingResponse]:
        """Returns all evidence mappings for a student across all competencies."""
        stmt = (
            select(EvidenceCompetency)
            .join(Evidence, EvidenceCompetency.evidence_id == Evidence.id)
            .where(Evidence.student_id == student_id)
            .options(
                selectinload(EvidenceCompetency.competency).selectinload(Competency.category_rel),
                selectinload(EvidenceCompetency.skill)
            )
            .order_by(EvidenceCompetency.created_at.desc())
        )
        if status_filter:
            stmt = stmt.where(EvidenceCompetency.mapping_status == status_filter.upper())

        res = await self.db.execute(stmt)
        records = res.scalars().all()

        results = []
        for r in records:
            cat_name = r.competency.category_rel.name if (r.competency and r.competency.category_rel) else None
            results.append(
                EvidenceCompetencyMappingResponse(
                    id=r.id,
                    evidence_id=r.evidence_id,
                    competency_id=r.competency_id,
                    competency_name=r.competency.name if r.competency else "Unknown",
                    competency_slug=r.competency.slug if r.competency else "unknown",
                    competency_category=cat_name,
                    skill_id=r.skill_id,
                    skill_name=r.skill.name if r.skill else None,
                    claim_id=r.claim_id,
                    mapping_status=MappingStatus(r.mapping_status),
                    mapping_method=MappingMethod(r.mapping_method),
                    confidence=r.confidence or 0.0,
                    confidence_reason=r.confidence_reason,
                    evidence_strength=EvidenceStrength(r.evidence_strength or "MODERATE"),
                    source_location=r.source_location,
                    algorithm_version=r.algorithm_version or "v1.0.0",
                    reviewed_by=r.reviewed_by,
                    reviewed_at=r.reviewed_at,
                    review_reason=r.review_reason,
                    created_at=r.created_at,
                    updated_at=r.updated_at
                )
            )
        return results
