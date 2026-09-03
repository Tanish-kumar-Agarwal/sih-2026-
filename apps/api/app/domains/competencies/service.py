from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.models import Competency, Skill, SkillCompetency
from app.infrastructure.database.repositories.competency_repo import CompetencyRepository
from app.domains.competencies.schemas import (
    DomainDTO, CategoryDTO, SkillDTO, CompetencySummaryDTO,
    CompetencyDetailDTO, CompetencyRelationshipDTO, RoleCatalogDTO,
    RoleRequirementDTO, PaginatedResponse
)

class CompetencyService:
    # --------------------------------------------------------------------------
    # Domains & Categories
    # --------------------------------------------------------------------------
    async def list_domains(self, db: AsyncSession) -> List[Dict[str, Any]]:
        repo = CompetencyRepository(db)
        domains = await repo.list_domains()
        return [
            {
                "id": d.id,
                "code": d.code,
                "name": d.name,
                "description": d.description,
                "status": d.status
            }
            for d in domains
        ]

    async def list_categories(self, db: AsyncSession, domain_code: Optional[str] = None) -> List[Dict[str, Any]]:
        repo = CompetencyRepository(db)
        cats = await repo.list_categories(domain_code=domain_code)
        return [
            {
                "id": c.id,
                "domain_id": c.domain_id,
                "domain_code": c.domain.code if c.domain else None,
                "code": c.code,
                "name": c.name,
                "slug": c.slug,
                "description": c.description,
                "status": c.status
            }
            for c in cats
        ]

    # --------------------------------------------------------------------------
    # Competencies
    # --------------------------------------------------------------------------
    async def list_competencies(
        self,
        db: AsyncSession,
        domain_code: Optional[str] = None,
        category_slug: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        repo = CompetencyRepository(db)
        comps, total = await repo.list_competencies_paged(
            domain_code=domain_code,
            category_slug=category_slug,
            search=search,
            limit=limit,
            offset=offset
        )

        items = []
        for c in comps:
            domain = c.domain_rel
            cat = c.category_rel
            items.append({
                "id": c.id,
                "code": c.code,
                "name": c.name,
                "slug": c.slug,
                "domain_id": c.domain_id,
                "domain_code": domain.code if domain else None,
                "category_id": c.category_id,
                "category": cat.name if cat else c.category,
                "difficulty_level": c.difficulty_level,
                "description": c.description or "",
                "status": c.status,
                "skills_count": len(c.skills),
                "skills": [{"id": s.id, "name": s.name, "slug": s.slug} for s in c.skills],
                "created_at": c.created_at.isoformat() if c.created_at else None
            })

        return {
            "items": items,
            "total": total,
            "limit": limit,
            "offset": offset
        }

    async def get_competency_detail(self, db: AsyncSession, identifier: str) -> Dict[str, Any]:
        repo = CompetencyRepository(db)
        c = await repo.get_competency_by_id_or_slug(identifier)
        if not c:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Competency '{identifier}' not found in canonical taxonomy."
            )

        domain = c.domain_rel
        cat = c.category_rel

        # Build skills with mapping metadata
        skills_list = []
        for scm in c.skill_mappings:
            sk = scm.skill
            skills_list.append({
                "id": sk.id,
                "name": sk.name,
                "slug": sk.slug,
                "description": sk.description,
                "status": sk.status,
                "is_primary": scm.is_primary,
                "relevance_weight": scm.relevance_weight
            })

        # Build graph edges
        prerequisites = []
        complements = []
        for rel in c.outgoing_relationships:
            target = rel.target_competency
            rel_dto = {
                "id": rel.id,
                "target_competency_id": rel.target_competency_id,
                "target_competency_name": target.name if target else "",
                "target_competency_code": target.code if target else "",
                "relationship_type": rel.relationship_type,
                "weight": rel.weight
            }
            if rel.relationship_type == "PREREQUISITE_FOR":
                prerequisites.append(rel_dto)
            else:
                complements.append(rel_dto)

        return {
            "id": c.id,
            "code": c.code,
            "name": c.name,
            "slug": c.slug,
            "domain_id": c.domain_id,
            "domain_code": domain.code if domain else None,
            "category_id": c.category_id,
            "category": cat.name if cat else c.category,
            "difficulty_level": c.difficulty_level,
            "description": c.description or "",
            "status": c.status,
            "source_type": c.source_type,
            "source_reference": c.source_reference,
            "skills": skills_list,
            "prerequisites": prerequisites,
            "complements": complements,
            "created_at": c.created_at.isoformat() if c.created_at else None
        }

    # --------------------------------------------------------------------------
    # Skills
    # --------------------------------------------------------------------------
    async def list_skills(
        self,
        db: AsyncSession,
        domain_code: Optional[str] = None,
        competency_id: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        repo = CompetencyRepository(db)
        skills, total = await repo.list_skills_paged(
            domain_code=domain_code,
            competency_id=competency_id,
            search=search,
            limit=limit,
            offset=offset
        )
        return {
            "items": [
                {
                    "id": s.id,
                    "domain_id": s.domain_id,
                    "competency_id": s.competency_id,
                    "name": s.name,
                    "slug": s.slug,
                    "description": s.description,
                    "status": s.status
                }
                for s in skills
            ],
            "total": total,
            "limit": limit,
            "offset": offset
        }

    # --------------------------------------------------------------------------
    # Roles Catalog & Role Blueprints
    # --------------------------------------------------------------------------
    async def list_roles(
        self,
        db: AsyncSession,
        domain_code: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        repo = CompetencyRepository(db)
        roles, total = await repo.list_roles_paged(domain_code=domain_code, limit=limit, offset=offset)
        items = []
        for r in roles:
            reqs = [
                {
                    "id": rcr.id,
                    "competency_id": rcr.competency_id,
                    "competency_code": rcr.competency.code if rcr.competency else "",
                    "competency_name": rcr.competency.name if rcr.competency else "",
                    "competency_category": rcr.competency.category if rcr.competency else None,
                    "required_proficiency": rcr.required_proficiency,
                    "requirement_type": rcr.requirement_type,
                    "weight": rcr.weight,
                    "notes": rcr.notes
                }
                for rcr in r.competency_requirements
            ]
            items.append({
                "id": r.id,
                "title": r.title,
                "slug": r.slug,
                "code": r.code,
                "domain": r.domain,
                "domain_id": r.domain_id,
                "description": r.description,
                "status": r.status,
                "requirements": reqs
            })
        return {
            "items": items,
            "total": total,
            "limit": limit,
            "offset": offset
        }

    async def get_role_detail(self, db: AsyncSession, identifier: str) -> Dict[str, Any]:
        repo = CompetencyRepository(db)
        r = await repo.get_role_by_id_or_slug(identifier)
        if not r:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Role '{identifier}' not found in canonical roles catalog."
            )
        reqs = [
            {
                "id": rcr.id,
                "competency_id": rcr.competency_id,
                "competency_code": rcr.competency.code if rcr.competency else "",
                "competency_name": rcr.competency.name if rcr.competency else "",
                "competency_category": rcr.competency.category if rcr.competency else None,
                "required_proficiency": rcr.required_proficiency,
                "requirement_type": rcr.requirement_type,
                "weight": rcr.weight,
                "notes": rcr.notes
            }
            for rcr in r.competency_requirements
        ]
        return {
            "id": r.id,
            "title": r.title,
            "slug": r.slug,
            "code": r.code,
            "domain": r.domain,
            "domain_id": r.domain_id,
            "description": r.description,
            "status": r.status,
            "requirements": reqs
        }

    async def add_competency(self, db: AsyncSession, data: dict) -> Dict[str, Any]:
        slug = data.get("slug") or data["code"].lower().replace("_", "-")
        comp = Competency(
            code=data["code"],
            name=data["name"],
            slug=slug,
            domain_id=data.get("domain_id"),
            category_id=data.get("category_id"),
            category=data.get("category", "Core Technical"),
            difficulty_level=data.get("difficulty_level", "Intermediate"),
            description=data.get("description", ""),
            source_type=data.get("source_type", "SYSTEM")
        )
        db.add(comp)
        await db.commit()
        await db.refresh(comp)

        return {
            "id": comp.id,
            "code": comp.code,
            "name": comp.name,
            "slug": comp.slug,
            "category": comp.category,
            "difficulty_level": comp.difficulty_level
        }

competency_service = CompetencyService()
