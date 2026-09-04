import logging
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Header, Path, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db
from app.config.settings import settings
from app.domains.evidence.github.service import github_intelligence_service
from app.domains.evidence.github.schemas import (
    GitHubAnalyzeRequestDTO,
    GitHubAnalysisResponseDTO,
    GitHubSnapshotDTO,
    GitHubRepositoryDTO,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/github", tags=["GitHub Repository Intelligence"])


@router.post("/analyze", response_model=GitHubAnalysisResponseDTO, status_code=status.HTTP_201_CREATED)
async def analyze_github_repository(
    request: GitHubAnalyzeRequestDTO,
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id"),
    db: AsyncSession = Depends(get_db)
):
    """
    Ingests and analyzes a public GitHub repository.
    Strictly validates URL against SSRF, extracts languages, package dependencies,
    bounded commits, pull requests, performs deterministic identity resolution for the student,
    computes code areas and divergence indicators, and persists Evidence + Provenance + Claims.
    """
    if not request.student_id:
        fallback_id = x_dev_persona_id or settings.DEFAULT_DEV_PERSONA_ID
        request.student_id = fallback_id

    return await github_intelligence_service.analyze_repository(db, request)


@router.get("/snapshots/{snapshot_id}", response_model=GitHubSnapshotDTO)
async def get_github_snapshot(
    snapshot_id: str = Path(..., description="Snapshot UUID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves full repository snapshot intelligence including language distributions,
    package dependencies, contributors, commits, code areas, and lineage indicators.
    """
    snapshot = await github_intelligence_service.get_snapshot_by_id(db, snapshot_id)
    if not snapshot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"GitHub snapshot with ID '{snapshot_id}' not found.",
        )
    return snapshot


@router.get("/student/{student_id}", response_model=List[GitHubSnapshotDTO])
async def list_student_github_snapshots(
    student_id: str = Path(..., description="Student UUID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Lists all GitHub repository snapshots linked to a given student.
    """
    return await github_intelligence_service.get_snapshots_for_student(db, student_id)


@router.get("/repositories/{repository_id}", response_model=GitHubRepositoryDTO)
async def get_github_repository(
    repository_id: str = Path(..., description="GitHub Repository UUID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves persisted GitHub repository metadata.
    """
    repo = await github_intelligence_service.get_repository_by_id(db, repository_id)
    if not repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"GitHub repository with ID '{repository_id}' not found.",
        )
    return repo
