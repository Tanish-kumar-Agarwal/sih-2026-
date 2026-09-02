from fastapi import APIRouter
from app.domains.assessments.service import assessment_service

router = APIRouter(prefix="/assessments", tags=["Assessments & Skill Tests"])

@router.get("/challenge/{competency_code}")
async def get_challenge(competency_code: str):
    return await assessment_service.get_adaptive_assessment(competency_code)
