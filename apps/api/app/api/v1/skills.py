from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.session import get_db
from app.domains.competencies.resolver import SkillResolutionEngine
from app.domains.competencies.proficiency_engine import CompetencyProficiencyAggregator
from app.infrastructure.database.repositories.competency_repo import CompetencyRepository
from app.domains.competencies.schemas import (
    SkillResolutionRequest, SkillResolutionBatchRequest,
    SkillResolutionItemDTO, SkillResolutionBatchResponseDTO,
    CompetencyAggregationRequestDTO, CompetencyAggregationResponseDTO
)

router = APIRouter(prefix="/skills", tags=["Skill Normalization, Aliases & Proficiency Engine"])

@router.post("/resolve", response_model=SkillResolutionItemDTO)
async def resolve_skill(
    payload: SkillResolutionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Deterministic resolution of an arbitrary raw skill representation into a canonical SkillSetu skill.
    Uses: Canonical ID -> Canonical Slug -> Normalized Name -> Exact Alias -> Normalized Alias.
    """
    engine = SkillResolutionEngine(db)
    return await engine.resolve_one(payload.skill)

@router.post("/resolve-batch", response_model=SkillResolutionBatchResponseDTO)
async def resolve_skills_batch(
    payload: SkillResolutionBatchRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Batch resolution of multiple raw skill strings in a single query pass.
    Guarantees constant-time DB operations with zero N+1 queries and input order preservation.
    """
    if len(payload.skills) > 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch size exceeds maximum limit of 200 skills per request."
        )
    engine = SkillResolutionEngine(db)
    return await engine.resolve_batch(payload.skills)

@router.post("/aggregate-proficiency", response_model=CompetencyAggregationResponseDTO)
async def aggregate_skill_proficiency(
    payload: CompetencyAggregationRequestDTO,
    db: AsyncSession = Depends(get_db)
):
    """
    Deterministic aggregation of resolved skill signals into canonical competency proficiency levels.
    Applies weighted scoring, threshold mapping, and provenance precedence.
    """
    aggregator = CompetencyProficiencyAggregator(db)
    raw_inputs = [s.model_dump() for s in payload.skills]
    return await aggregator.aggregate_skills_to_competencies(raw_inputs)

@router.get("/{id_or_slug}/competencies")
async def get_skill_competencies(
    id_or_slug: str = Path(..., description="Canonical Skill ID or slug"),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch all canonical competencies mapped to a specific skill with relevance weights and primary flag.
    """
    repo = CompetencyRepository(db)
    skill = await repo.get_skill_with_competencies(id_or_slug)
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill '{id_or_slug}' not found in canonical taxonomy."
        )

    mappings = []
    for scm in skill.competency_mappings:
        c = scm.competency
        if c:
            mappings.append({
                "competency_id": c.id,
                "competency_code": c.code,
                "competency_name": c.name,
                "competency_slug": c.slug,
                "category": c.category,
                "relevance_weight": scm.relevance_weight,
                "is_primary": scm.is_primary
            })

    aliases = [{"id": a.id, "alias_name": a.alias_name, "normalized_alias": a.normalized_alias} for a in skill.aliases]

    return {
        "skill_id": skill.id,
        "name": skill.name,
        "slug": skill.slug,
        "domain_id": skill.domain_id,
        "domain_code": skill.domain_rel.code if skill.domain_rel else None,
        "aliases": aliases,
        "competencies": mappings
    }
