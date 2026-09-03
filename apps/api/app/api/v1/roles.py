from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.session import get_db
from app.domains.competencies.service import competency_service
from app.domains.competencies.schemas import RoleCatalogDTO

router = APIRouter(prefix="/roles", tags=["Roles & Industry Competency Blueprints"])

@router.get("", response_model=Dict[str, Any])
async def list_canonical_roles(
    domain: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List all canonical industry role catalogs across GENERAL and AYUSH domains."""
    return await competency_service.list_roles(db, domain_code=domain)

@router.get("/{role_id_or_slug}/competencies", response_model=RoleCatalogDTO)
@router.get("/{role_id_or_slug}", response_model=RoleCatalogDTO)
async def get_role_competency_requirements(
    role_id_or_slug: str = Path(..., description="Role UUID or slug"),
    db: AsyncSession = Depends(get_db)
):
    """Fetch weighted competency blueprint requirements for a specific canonical role."""
    return await competency_service.get_role_detail(db, role_id_or_slug)
