from typing import Optional
from fastapi import APIRouter, Depends, Header, Path
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.session import get_db
from app.domains.students.service import student_service
from app.config.settings import settings

router = APIRouter(prefix="/students", tags=["Students & Portfolios"])

@router.get("/me")
@router.get("/profile")
async def get_my_student_profile(
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id"),
    db: AsyncSession = Depends(get_db)
):
    """Returns current active student persona profile directly from PostgreSQL."""
    student_id = x_dev_persona_id or settings.DEFAULT_DEV_PERSONA_ID
    return await student_service.get_profile(db, student_id)

@router.get("/{student_id}")
async def get_student_by_id(
    student_id: str = Path(..., description="Student ID or User ID"),
    db: AsyncSession = Depends(get_db)
):
    """Returns specific student profile from PostgreSQL."""
    return await student_service.get_profile(db, student_id)

@router.get("/graph/{student_id}")
@router.get("/graph")
async def get_student_graph(
    student_id: Optional[str] = None,
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id")
):
    target_id = student_id or x_dev_persona_id or settings.DEFAULT_DEV_PERSONA_ID
    return await student_service.get_graph(target_id)
