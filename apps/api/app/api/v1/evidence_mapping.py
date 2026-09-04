from typing import Optional, List
from fastapi import APIRouter, Depends, Header, Path, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db
from app.config.settings import settings
from app.infrastructure.database.repositories.student_repo import StudentRepository
from app.domains.evidence.mapping.service import EvidenceMappingService
from app.domains.evidence.mapping.schemas import (
    EvidenceCompetencyMappingResponse,
    EvidenceMappingTriggerResponse,
    MappingVerifyRequest,
    MappingVerifyResponse,
    CompetencyEvidenceProfileResponse
)

router = APIRouter(tags=["Evidence Competency Mapping & Verification"])

@router.post(
    "/evidence/{evidence_id}/map",
    response_model=EvidenceMappingTriggerResponse,
    summary="Trigger automated evidence to competency mapping"
)
async def trigger_evidence_mapping(
    evidence_id: str = Path(..., description="Evidence UUID"),
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id"),
    db: AsyncSession = Depends(get_db)
):
    """
    Executes deterministic fact extraction and canonical competency resolution for an evidence item.
    Guarantees zero invented competencies, deterministic confidence calculation, and idempotency.
    """
    persona = x_dev_persona_id or settings.DEFAULT_DEV_PERSONA_ID
    service = EvidenceMappingService(db)
    return await service.map_evidence(
        evidence_id=evidence_id,
        current_user_id=persona,
        persona=persona
    )

@router.get(
    "/evidence/{evidence_id}/mappings",
    response_model=List[EvidenceCompetencyMappingResponse],
    summary="List all canonical competency mappings for an evidence item"
)
async def list_evidence_mappings(
    evidence_id: str = Path(..., description="Evidence UUID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns all active and historical competency mappings for an evidence item with full explainability.
    """
    service = EvidenceMappingService(db)
    return await service.get_evidence_mappings(evidence_id)

@router.post(
    "/evidence/{evidence_id}/mappings/{competency_id}/verify",
    response_model=MappingVerifyResponse,
    summary="Verify or reject an evidence-competency mapping"
)
async def verify_evidence_mapping(
    evidence_id: str = Path(..., description="Evidence UUID"),
    competency_id: str = Path(..., description="Canonical Competency UUID"),
    verification_req: MappingVerifyRequest = ...,
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id"),
    db: AsyncSession = Depends(get_db)
):
    """
    Records an auditable verification or rejection of an evidence-competency mapping.
    Enforces persona role boundaries (faculty, industry, or admin).
    """
    reviewer = x_dev_persona_id or settings.DEFAULT_DEV_PERSONA_ID
    service = EvidenceMappingService(db)
    return await service.verify_mapping(
        evidence_id=evidence_id,
        competency_id=competency_id,
        reviewer_id=reviewer,
        reviewer_role=reviewer,
        verification_req=verification_req
    )

@router.get(
    "/students/me/competencies/{competency_id}/evidence",
    response_model=CompetencyEvidenceProfileResponse,
    summary="Get aggregated evidence profile for a student's competency"
)
async def get_my_competency_evidence_profile(
    competency_id: str = Path(..., description="Canonical Competency UUID"),
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id"),
    db: AsyncSession = Depends(get_db)
):
    """
    Aggregates all independent evidence artifacts supporting a student's competency.
    Answers: 'Why does SkillSetu believe this student has evidence for this competency?'
    """
    persona = x_dev_persona_id or settings.DEFAULT_DEV_PERSONA_ID
    student_repo = StudentRepository(db)
    student = await student_repo.get_by_id_or_user_id(persona)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student record for persona '{persona}' not found"
        )

    service = EvidenceMappingService(db)
    return await service.get_student_competency_evidence_profile(
        student_id=student.id,
        competency_id=competency_id
    )

@router.get(
    "/students/me/evidence-mappings",
    response_model=List[EvidenceCompetencyMappingResponse],
    summary="List all evidence competency mappings for the active student"
)
async def get_my_evidence_mappings(
    mapping_status: Optional[str] = Query(None, description="Optional status filter: CANDIDATE, PROPOSED, CONFIRMED, REJECTED"),
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns full ledger of evidence-competency mappings for the authenticated student.
    """
    persona = x_dev_persona_id or settings.DEFAULT_DEV_PERSONA_ID
    student_repo = StudentRepository(db)
    student = await student_repo.get_by_id_or_user_id(persona)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student record for persona '{persona}' not found"
        )

    service = EvidenceMappingService(db)
    return await service.get_student_evidence_mappings(
        student_id=student.id,
        status_filter=mapping_status
    )
