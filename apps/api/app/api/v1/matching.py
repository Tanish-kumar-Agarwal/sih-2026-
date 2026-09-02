from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.session import get_db
from app.domains.students.service import student_service
from app.domains.matching.service import matchmaking_engine

router = APIRouter(prefix="/matching", tags=["AI Matchmaking & Explainability"])

@router.get("/recommendations")
async def get_match_recommendations(db: AsyncSession = Depends(get_db)):
    profile = await student_service.get_profile(db, "demo-student-id")
    return await matchmaking_engine.compute_matches_for_student(profile)
