from typing import Optional
from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.session import get_db
from app.domains.competencies.service import competency_service

router = APIRouter(prefix="/competencies", tags=["Canonical Competency Taxonomy & Ontology"])

@router.get("/domains")
async def list_domains(db: AsyncSession = Depends(get_db)):
    """Lists canonical taxonomy domains (e.g. GENERAL, AYUSH)."""
    return await competency_service.list_domains(db)

@router.get("/categories")
async def list_categories(
    domain: Optional[str] = Query(None, description="Filter by domain code (GENERAL, AYUSH)"),
    db: AsyncSession = Depends(get_db)
):
    """Lists canonical taxonomy categories organized by domain."""
    return await competency_service.list_categories(db, domain_code=domain)

@router.get("/skills")
async def list_skills(
    domain: Optional[str] = Query(None, description="Filter by domain code"),
    competency_id: Optional[str] = Query(None, description="Filter by competency ID"),
    search: Optional[str] = Query(None, description="Search skill name or slug"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """Lists canonical technical and domain skills."""
    return await competency_service.list_skills(
        db,
        domain_code=domain,
        competency_id=competency_id,
        search=search,
        limit=limit,
        offset=offset
    )

@router.get("/roles")
async def list_roles(
    domain: Optional[str] = Query(None, description="Filter by domain code (GENERAL, AYUSH)"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """Lists canonical professional roles catalog with required competency blueprints."""
    return await competency_service.list_roles(db, domain_code=domain, limit=limit, offset=offset)

@router.get("/roles/{role_id_or_slug}")
async def get_role_detail(
    role_id_or_slug: str = Path(..., description="Role ID, slug, or code"),
    db: AsyncSession = Depends(get_db)
):
    """Gets detailed role blueprint with weighted required competencies and proficiencies."""
    return await competency_service.get_role_detail(db, role_id_or_slug)

@router.get("")
async def list_competencies(
    domain: Optional[str] = Query(None, description="Filter by domain code (GENERAL, AYUSH)"),
    category: Optional[str] = Query(None, description="Filter by category slug or legacy category name"),
    search: Optional[str] = Query(None, description="Search by name, code, or description"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """Lists canonical competencies with domain, category, search, and pagination filters."""
    return await competency_service.list_competencies(
        db,
        domain_code=domain,
        category_slug=category,
        search=search,
        limit=limit,
        offset=offset
    )

@router.get("/{competency_id_or_slug}")
async def get_competency_detail(
    competency_id_or_slug: str = Path(..., description="Competency ID, code, or slug"),
    db: AsyncSession = Depends(get_db)
):
    """Gets detailed canonical competency with child skills, prerequisites, and graph relationships."""
    return await competency_service.get_competency_detail(db, competency_id_or_slug)

@router.post("")
async def add_competency(data: dict, db: AsyncSession = Depends(get_db)):
    """Administrative creation of a canonical competency."""
    return await competency_service.add_competency(db, data)
