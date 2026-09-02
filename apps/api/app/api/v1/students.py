from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.session import get_db
from app.domains.students.service import student_service
from app.security.auth import get_current_user

router = APIRouter(prefix="/students", tags=["Students & Portfolios"])

@router.get("/profile")
async def get_student_profile(db: AsyncSession = Depends(get_db)):
    # Return active student profile
    return await student_service.get_profile(db, "demo-student-id")

@router.get("/graph")
async def get_student_graph():
    # Return visualizer graph data (Neo4j node-link format)
    return await student_service.get_graph("stu-aarav-sharma")
