from typing import Optional, List
from fastapi import APIRouter, Depends, Header, Path, Query, UploadFile, File, Form, Response, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.session import get_db
from app.config.settings import settings
from app.domains.evidence.service import evidence_service
from app.domains.evidence.schemas import (
    EvidenceCreateDTO,
    EvidenceSummaryDTO,
    EvidenceDetailDTO,
    EvidenceVerifyRequestDTO,
    EvidenceVerifyResponseDTO,
    EvidenceArtifactDTO
)

router = APIRouter(prefix="/evidence", tags=["Evidence & Verification"])

@router.get("/pending", response_model=List[EvidenceSummaryDTO])
async def list_pending_evidence(db: AsyncSession = Depends(get_db)):
    """Lists pending evidence artifacts awaiting verification by faculty/evaluators."""
    return await evidence_service.list_pending(db)

@router.get("/{evidence_id}", response_model=EvidenceDetailDTO)
async def get_evidence_detail(
    evidence_id: str = Path(..., description="Evidence item UUID"),
    db: AsyncSession = Depends(get_db)
):
    """Returns deep evidence details including provenance, observed facts, claims, and verified attestations."""
    return await evidence_service.get_evidence_detail(db, evidence_id)

@router.post("", response_model=EvidenceDetailDTO, status_code=status.HTTP_201_CREATED)
async def create_evidence(
    data: EvidenceCreateDTO,
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id"),
    student_id: Optional[str] = Query(None, description="Explicit student ID override if authorized"),
    db: AsyncSession = Depends(get_db)
):
    """Creates a new canonical evidence item with provenance and observed claims."""
    target_student = student_id or x_dev_persona_id or settings.DEFAULT_DEV_PERSONA_ID
    return await evidence_service.create_evidence(db, target_student, data)

@router.post("/upload", response_model=EvidenceDetailDTO, status_code=status.HTTP_201_CREATED)
async def upload_file_evidence(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    evidence_type: str = Form("DOCUMENT"),
    evidence_strength: str = Form("STRONG"),
    domain_code: str = Form("GENERAL"),
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id"),
    student_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Ingests, stores, and extracts structured text/metadata from an uploaded evidence document.
    Enforces file size bounding, magic signature validation, path sanitization, and SHA-256 identity.
    """
    target_student = student_id or x_dev_persona_id or settings.DEFAULT_DEV_PERSONA_ID
    content = await file.read()
    return await evidence_service.ingest_file_evidence(
        db=db,
        student_id=target_student,
        filename=file.filename or "uploaded_document",
        content=content,
        declared_mime=file.content_type or "application/octet-stream",
        title=title,
        description=description,
        evidence_type=evidence_type,
        evidence_strength=evidence_strength,
        domain_code=domain_code
    )

@router.get("/{evidence_id}/artifacts/{artifact_id}/download")
async def download_evidence_artifact(
    evidence_id: str = Path(...),
    artifact_id: str = Path(...),
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id"),
    db: AsyncSession = Depends(get_db)
):
    """Safely retrieves stored binary artifact with path traversal guards and student isolation."""
    content, mime_type, filename = await evidence_service.get_artifact_file(
        db=db,
        evidence_id=evidence_id,
        artifact_id=artifact_id,
        requesting_student_id=x_dev_persona_id
    )
    return Response(
        content=content,
        media_type=mime_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(content))
        }
    )

@router.post("/verify", response_model=EvidenceVerifyResponseDTO)
async def verify_evidence_item(
    payload: EvidenceVerifyRequestDTO,
    db: AsyncSession = Depends(get_db)
):
    """Formally verifies or rejects an evidence artifact with state machine transition enforcement."""
    return await evidence_service.verify_evidence(
        db=db,
        evidence_id=payload.evidence_id,
        verification_status=payload.status.value,
        remarks=payload.remarks,
        verifier_id=payload.verifier_id,
        verifier_role=payload.verifier_role
    )

@router.get("/student/{student_id}", response_model=List[EvidenceDetailDTO])
async def list_student_evidence(
    student_id: str = Path(..., description="Student ID or User ID"),
    db: AsyncSession = Depends(get_db)
):
    """Returns all evidence items for a specific student."""
    return await evidence_service.list_student_evidence(db, student_id)
