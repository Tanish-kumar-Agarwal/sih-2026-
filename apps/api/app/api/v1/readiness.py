from typing import Optional, List
from fastapi import APIRouter, Depends, Header, Path, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db
from app.infrastructure.database.repositories.student_repo import StudentRepository
from app.domains.readiness.service import readiness_service
from app.domains.readiness.schemas import (
    StudentCompetencyStateResponse,
    StudentCompetencyStateHistoryResponse,
    StudentCompetencyStateListResponse,
    StudentReadinessStateResponse,
    StudentReadinessStateListResponse,
)
from app.config.settings import settings

router = APIRouter(prefix="/students/me", tags=["Readiness & Competency State"])

async def get_current_student_id(
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id"),
    db: AsyncSession = Depends(get_db)
) -> str:
    """Resolve current development persona student ID strictly from database."""
    identifier = x_dev_persona_id or settings.DEFAULT_DEV_PERSONA_ID
    student_repo = StudentRepository(db)
    student_id = await student_repo.resolve_student_id(identifier)
    if not student_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student record not found for persona identifier '{identifier}'."
        )
    return student_id

@router.get("/competency-states", response_model=StudentCompetencyStateListResponse)
async def list_my_competency_states(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    student_id: str = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db)
):
    """
    List all evaluated canonical competency states for the current student.
    Separates Proficiency, Confidence, State, and Evidence coverage signals.
    """
    return await readiness_service.list_student_competency_states(
        db=db,
        student_id=student_id,
        limit=limit,
        offset=offset
    )

@router.get("/competency-states/{competency_id}", response_model=StudentCompetencyStateResponse)
async def get_my_competency_state(
    competency_id: str = Path(..., description="Canonical Competency UUID"),
    student_id: str = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve canonical competency state for current student and specified competency.
    If no evaluation has occurred yet, returns deterministic initial state (NOT_ASSESSED, score=0.0).
    Never invents proficiency.
    """
    return await readiness_service.get_canonical_competency_state(
        db=db,
        student_id=student_id,
        competency_id=competency_id
    )

@router.get("/competency-states/{competency_id}/history", response_model=List[StudentCompetencyStateHistoryResponse])
async def get_my_competency_state_history(
    competency_id: str = Path(..., description="Canonical Competency UUID"),
    limit: int = Query(20, ge=1, le=50),
    student_id: str = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch immutable chronological audit history for changes to this competency state.
    Allows inspecting state transitions and recalculation provenance over time.
    """
    return await readiness_service.get_state_history(
        db=db,
        student_id=student_id,
        competency_id=competency_id,
        limit=limit
    )

@router.get("/readiness-states", response_model=StudentReadinessStateListResponse)
async def list_my_readiness_states(
    target_type: Optional[str] = Query(None, description="ROLE, OPPORTUNITY, or BLUEPRINT"),
    student_id: str = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db)
):
    """
    List evaluated target-readiness states for the current student.
    Explicitly distinguishes CompetencyState from Target ReadinessState.
    """
    return await readiness_service.list_student_readiness_states(
        db=db,
        student_id=student_id,
        target_type=target_type
    )

@router.get("/readiness-states/{target_id}", response_model=StudentReadinessStateResponse)
async def get_my_target_readiness(
    target_id: str = Path(..., description="Target UUID (Role, Opportunity, or Blueprint)"),
    target_type: str = Query("ROLE", description="Target type: ROLE, OPPORTUNITY, or BLUEPRINT"),
    student_id: str = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve target readiness state for current student against a specific target.
    If not yet evaluated, returns NOT_ASSESSED foundation without fake scores.
    """
    return await readiness_service.get_target_readiness_state(
        db=db,
        student_id=student_id,
        target_id=target_id,
        target_type=target_type
    )

@router.post("/readiness-states/{target_id}/recalculate", response_model=StudentReadinessStateResponse)
async def recalculate_my_target_readiness(
    target_id: str = Path(..., description="Target UUID (Role, Opportunity, or Blueprint)"),
    target_type: str = Query("ROLE", description="Target type: ROLE, OPPORTUNITY, or BLUEPRINT"),
    student_id: str = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Triggers deterministic evaluation of student's competencies against target requirements.
    Performs gap analysis, blocker detection, and explainability provenance generation.
    Persists resulting state into PostgreSQL.
    """
    return await readiness_service.calculate_target_readiness(
        db=db,
        student_id=student_id,
        target_id=target_id,
        target_type=target_type,
        persist=True
    )

@router.post("/competency-states/{competency_id}/recalculate", response_model=StudentCompetencyStateResponse)
async def recalculate_my_competency_proficiency(
    competency_id: str = Path(..., description="Canonical Competency UUID"),
    student_id: str = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Triggers deterministic aggregation of Phase 3 evidence, assessments, and experiences
    to update canonical proficiency score, level, confidence, and state.
    Records immutable historical audit entry.
    """
    return await readiness_service.recalculate_competency_proficiency(
        db=db,
        student_id=student_id,
        competency_id=competency_id
    )

@router.post("/competency-states/recalculate", response_model=StudentCompetencyStateListResponse)
async def recalculate_all_my_competencies(
    student_id: str = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Batch recalculates proficiency for all competencies mapped to current student's evidence.
    """
    return await readiness_service.recalculate_student_all_competencies(
        db=db,
        student_id=student_id
    )

