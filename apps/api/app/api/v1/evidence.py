from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.session import get_db
from app.domains.evidence.service import evidence_service

router = APIRouter(prefix="/evidence", tags=["Evidence & Verification"])

@router.get("/pending")
async def list_pending_evidence(db: AsyncSession = Depends(get_db)):
    return await evidence_service.list_pending(db)

@router.post("/verify")
async def verify_evidence_item(data: dict, db: AsyncSession = Depends(get_db)):
    return await evidence_service.verify_evidence(
        db,
        evidence_id=data["evidence_id"],
        verification_status=data.get("status", "VERIFIED"),
        remarks=data.get("remarks", ""),
        verifier_id=data.get("verifier_id"),
        verifier_role=data.get("verifier_role", "faculty")
    )
