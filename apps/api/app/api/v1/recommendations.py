from fastapi import APIRouter
from app.domains.recommendations.service import recommendations_service

router = APIRouter(prefix="/recommendations", tags=["Learning Paths & Curated Upskilling"])

@router.get("/path")
async def get_learning_path(role: str = "AI Platform Engineer"):
    return await recommendations_service.get_learning_path("demo-student-id", role)
