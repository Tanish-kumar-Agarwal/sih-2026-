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

# ------------------------------------------------------------------------------
# Student Competency Engine Endpoints (Step 3)
# ------------------------------------------------------------------------------

from app.domains.competencies.student_competency_service import student_competency_service
from app.domains.competencies.schemas import (
    StudentCompetenciesPaginatedDTO, StudentCompetencyDetailDTO,
    StudentCompetencyDeriveRequestDTO, StudentCompetencyDeriveResponseDTO,
    CompetencyGraphResponseDTO
)

@router.get("/me/competencies", response_model=StudentCompetenciesPaginatedDTO)
async def get_my_competencies(
    search: Optional[str] = None,
    domain: Optional[str] = None,
    category: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns active competencies for the current development persona student.
    Truthfully returns [] if student has no competencies.
    """
    persona = x_dev_persona_id or settings.DEFAULT_DEV_PERSONA_ID
    return await student_competency_service.get_student_competencies(
        db=db,
        persona_identifier=persona,
        search=search,
        domain_code=domain,
        category=category,
        page=page,
        page_size=page_size
    )

@router.get("/me/competencies/{competency_id_or_slug}", response_model=StudentCompetencyDetailDTO)
async def get_my_competency_detail(
    competency_id_or_slug: str = Path(..., description="Competency UUID or slug"),
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id"),
    db: AsyncSession = Depends(get_db)
):
    """
    Deep lookup of a specific competency for the current student persona,
    including supporting skills, demonstrated projects, and prerequisite edges.
    """
    persona = x_dev_persona_id or settings.DEFAULT_DEV_PERSONA_ID
    return await student_competency_service.get_student_competency_detail(
        db=db,
        persona_identifier=persona,
        competency_id_or_slug=competency_id_or_slug
    )

@router.post("/me/competencies/derive", response_model=StudentCompetencyDeriveResponseDTO)
async def derive_my_competencies(
    payload: Optional[StudentCompetencyDeriveRequestDTO] = None,
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id"),
    db: AsyncSession = Depends(get_db)
):
    """
    Deterministically derive and persist competencies from demonstrated skills across
    projects, verified evidence, or explicit skill inputs using the Step 2 aggregation engine.
    Idempotent: running multiple times updates without creating duplicate records.
    """
    persona = x_dev_persona_id or settings.DEFAULT_DEV_PERSONA_ID
    explicit_skills = [s.model_dump() for s in payload.skills] if payload and payload.skills else None
    include_proj = payload.include_projects if payload else True

    return await student_competency_service.derive_student_competencies(
        db=db,
        persona_identifier=persona,
        explicit_skills=explicit_skills,
        include_projects=include_proj
    )

@router.get("/me/competency-graph", response_model=CompetencyGraphResponseDTO)
async def get_my_competency_graph(
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns relational competency graph (nodes & edges) for the current student
    incorporating canonical competencies, supporting skills, and prerequisite relationships.
    """
    persona = x_dev_persona_id or settings.DEFAULT_DEV_PERSONA_ID
    return await student_competency_service.get_student_competency_graph(
        db=db,
        persona_identifier=persona
    )

@router.get("/{student_id}/competencies", response_model=StudentCompetenciesPaginatedDTO)
async def get_student_competencies_by_id(
    student_id: str = Path(..., description="Student ID or User ID"),
    search: Optional[str] = None,
    domain: Optional[str] = None,
    category: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Returns competencies for a specific student ID (for faculty/institution views)."""
    return await student_competency_service.get_student_competencies(
        db=db,
        persona_identifier=student_id,
        search=search,
        domain_code=domain,
        category=category,
        page=page,
        page_size=page_size
    )

