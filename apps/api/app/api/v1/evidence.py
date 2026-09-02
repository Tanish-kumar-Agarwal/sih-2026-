from fastapi import APIRouter
from app.domains.evidence.service import evidence_service

router = APIRouter(prefix="/evidence", tags=["Evidence & Verification"])

@router.get("/pending")
async def list_pending_evidence():
    return await evidence_service.list_pending()

@router.post("/verify")
async def verify_evidence_item(data: dict):
    return await evidence_service.verify_evidence(
        data.get("evidence_id"),
        data.get("status", "APPROVED"),
        data.get("remarks", "")
    )
