from fastapi import APIRouter
from app.domains.analytics.service import analytics_service
from app.domains.institutions.service import institution_service

router = APIRouter(prefix="/analytics", tags=["Macro Analytics & Readiness"])

@router.get("/macro")
async def get_macro_trends():
    return await analytics_service.get_macro_trends()

@router.get("/institution/{institution_id}")
async def get_institution_readiness(institution_id: str):
    return await institution_service.get_readiness_matrix(institution_id)
