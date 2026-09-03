from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload
from app.infrastructure.database.models import (
    Domain, Category, Competency, Skill, SkillAlias, SkillCompetency,
    RolesCatalog, RoleCompetencyRequirement, CompetencyRelationship
)
from .base import BaseRepository

class CompetencyRepository(BaseRepository[Competency]):
    def __init__(self, db: AsyncSession):
        super().__init__(Competency, db)

    # --------------------------------------------------------------------------
    # Domains & Categories
    # --------------------------------------------------------------------------
    async def list_domains(self) -> List[Domain]:
        stmt = select(Domain).where(Domain.status == "ACTIVE").order_by(Domain.code)
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def list_categories(self, domain_code: Optional[str] = None) -> List[Category]:
        stmt = (
            select(Category)
            .join(Domain, Category.domain_id == Domain.id)
            .where(Category.status == "ACTIVE")
            .options(selectinload(Category.domain))
        )
        if domain_code:
            stmt = stmt.where(Domain.code == domain_code.upper())
        stmt = stmt.order_by(Category.name)
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    # --------------------------------------------------------------------------
    # Competencies
    # --------------------------------------------------------------------------
    async def list_competencies_paged(
        self,
        domain_code: Optional[str] = None,
        category_slug: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Competency], int]:
        base_query = (
            select(Competency)
            .outerjoin(Domain, Competency.domain_id == Domain.id)
            .outerjoin(Category, Competency.category_id == Category.id)
            .where(Competency.status == "ACTIVE")
        )

        if domain_code:
            base_query = base_query.where(Domain.code == domain_code.upper())
        if category_slug:
            base_query = base_query.where(Category.slug == category_slug.lower())
        if search:
            pattern = f"%{search}%"
            base_query = base_query.where(
                or_(
                    Competency.name.ilike(pattern),
                    Competency.code.ilike(pattern),
                    Competency.description.ilike(pattern)
                )
            )

        # Count total
        count_stmt = select(func.count()).select_from(base_query.subquery())
        total = await self.db.scalar(count_stmt) or 0

        # Fetch items
        stmt = (
            base_query
            .options(
                selectinload(Competency.domain_rel),
                selectinload(Competency.category_rel),
                selectinload(Competency.skills),
            )
            .order_by(Competency.name)
            .offset(offset)
            .limit(limit)
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all()), total

    async def list_with_skills(self, category: Optional[str] = None) -> List[Competency]:
        """Backward-compatible query method."""
        stmt = select(Competency).options(
            selectinload(Competency.domain_rel),
            selectinload(Competency.category_rel),
            selectinload(Competency.skills),
        )
        if category:
            stmt = stmt.where(
                or_(
                    Competency.category == category,
                    Competency.category_id == category
                )
            )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_competency_by_id_or_slug(self, identifier: str) -> Optional[Competency]:
        stmt = (
            select(Competency)
            .where(
                or_(
                    Competency.id == identifier,
                    Competency.slug == identifier.lower(),
                    Competency.code == identifier.upper()
                )
            )
            .options(
                selectinload(Competency.domain_rel),
                selectinload(Competency.category_rel),
                selectinload(Competency.skill_mappings).selectinload(SkillCompetency.skill),
                selectinload(Competency.outgoing_relationships).selectinload(CompetencyRelationship.target_competency),
                selectinload(Competency.incoming_relationships).selectinload(CompetencyRelationship.source_competency),
            )
        )
        res = await self.db.execute(stmt)
        return res.scalars().first()

    # --------------------------------------------------------------------------
    # Skills
    # --------------------------------------------------------------------------
    async def list_skills_paged(
        self,
        domain_code: Optional[str] = None,
        competency_id: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Skill], int]:
        base_query = (
            select(Skill)
            .outerjoin(Domain, Skill.domain_id == Domain.id)
            .where(Skill.status == "ACTIVE")
        )

        if domain_code:
            base_query = base_query.where(Domain.code == domain_code.upper())
        if competency_id:
            base_query = base_query.where(
                or_(
                    Skill.competency_id == competency_id,
                    Skill.id.in_(
                        select(SkillCompetency.skill_id).where(SkillCompetency.competency_id == competency_id)
                    )
                )
            )
        if search:
            pattern = f"%{search}%"
            base_query = base_query.where(
                or_(Skill.name.ilike(pattern), Skill.slug.ilike(pattern))
            )

        count_stmt = select(func.count()).select_from(base_query.subquery())
        total = await self.db.scalar(count_stmt) or 0

        stmt = base_query.order_by(Skill.name).offset(offset).limit(limit)
        res = await self.db.execute(stmt)
        return list(res.scalars().all()), total

    # --------------------------------------------------------------------------
    # Roles Catalog & Role Competency Requirements
    # --------------------------------------------------------------------------
    async def list_roles_paged(
        self,
        domain_code: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[RolesCatalog], int]:
        base_query = (
            select(RolesCatalog)
            .outerjoin(Domain, RolesCatalog.domain_id == Domain.id)
            .where(RolesCatalog.status == "ACTIVE")
        )

        if domain_code:
            base_query = base_query.where(
                or_(
                    Domain.code == domain_code.upper(),
                    RolesCatalog.domain == domain_code.upper()
                )
            )

        count_stmt = select(func.count()).select_from(base_query.subquery())
        total = await self.db.scalar(count_stmt) or 0

        stmt = (
            base_query
            .options(
                selectinload(RolesCatalog.competency_requirements)
                .selectinload(RoleCompetencyRequirement.competency)
            )
            .order_by(RolesCatalog.title)
            .offset(offset)
            .limit(limit)
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all()), total

    async def get_role_by_id_or_slug(self, identifier: str) -> Optional[RolesCatalog]:
        stmt = (
            select(RolesCatalog)
            .where(
                or_(
                    RolesCatalog.id == identifier,
                    RolesCatalog.slug == identifier.lower(),
                    RolesCatalog.code == identifier.upper()
                )
            )
            .options(
                selectinload(RolesCatalog.competency_requirements)
                .selectinload(RoleCompetencyRequirement.competency)
            )
        )
        res = await self.db.execute(stmt)
        return res.scalars().first()

    # --------------------------------------------------------------------------
    # Normalization, Aliases & M:N Mapping Queries
    # --------------------------------------------------------------------------
    async def find_skills_by_identifiers_or_keys(
        self,
        ids: List[str],
        slugs: List[str],
        names: List[str]
    ) -> List[Skill]:
        """Fetch active canonical skills matching any of the given IDs, slugs, or normalized names in a single query."""
        clauses = []
        if ids:
            clauses.append(Skill.id.in_(ids))
        if slugs:
            clauses.append(Skill.slug.in_(slugs))
        if names:
            clauses.append(func.lower(Skill.name).in_([n.lower() for n in names]))

        if not clauses:
            return []

        stmt = (
            select(Skill)
            .where(and_(Skill.status == "ACTIVE", or_(*clauses)))
            .options(
                selectinload(Skill.domain_rel),
                selectinload(Skill.competencies)
            )
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def find_aliases_by_keys(
        self,
        raw_aliases: List[str],
        normalized_aliases: List[str]
    ) -> List[SkillAlias]:
        """Fetch active aliases matching raw or normalized aliases in a single query."""
        clauses = []
        if raw_aliases:
            clauses.append(func.lower(SkillAlias.alias_name).in_([a.lower() for a in raw_aliases]))
        if normalized_aliases:
            clauses.append(SkillAlias.normalized_alias.in_(normalized_aliases))

        if not clauses:
            return []

        stmt = (
            select(SkillAlias)
            .where(and_(SkillAlias.status == "ACTIVE", or_(*clauses)))
            .options(
                selectinload(SkillAlias.skill).selectinload(Skill.domain_rel)
            )
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_skill_with_competencies(self, identifier: str) -> Optional[Skill]:
        """Fetch single skill with mapped competencies and aliases."""
        stmt = (
            select(Skill)
            .where(
                or_(
                    Skill.id == identifier,
                    Skill.slug == identifier.lower()
                )
            )
            .options(
                selectinload(Skill.domain_rel),
                selectinload(Skill.competency_mappings).selectinload(SkillCompetency.competency),
                selectinload(Skill.aliases)
            )
        )
        res = await self.db.execute(stmt)
        return res.scalars().first()

    async def get_skills_competency_mappings_batch(self, skill_ids: List[str]) -> List[SkillCompetency]:
        """Batch fetch skill-to-competency mappings with competencies eagerly loaded."""
        if not skill_ids:
            return []
        stmt = (
            select(SkillCompetency)
            .where(SkillCompetency.skill_id.in_(skill_ids))
            .options(
                selectinload(SkillCompetency.competency),
                selectinload(SkillCompetency.skill)
            )
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_all_relationships(self) -> List[CompetencyRelationship]:
        """Fetch all active cross-competency relationships."""
        stmt = (
            select(CompetencyRelationship)
            .where(CompetencyRelationship.status == "ACTIVE")
            .options(
                selectinload(CompetencyRelationship.source_competency),
                selectinload(CompetencyRelationship.target_competency)
            )
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())


