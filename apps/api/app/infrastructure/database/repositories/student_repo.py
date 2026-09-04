from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload
from app.infrastructure.database.models import Student, User, Institution, Department, StudentCompetency, Project, Competency
from .base import BaseRepository

class StudentRepository(BaseRepository[Student]):
    def __init__(self, db: AsyncSession):
        super().__init__(Student, db)

    async def get_by_user_id(self, user_id: str) -> Optional[Student]:
        stmt = (
            select(Student)
            .where(Student.user_id == user_id)
            .options(
                selectinload(Student.user),
                selectinload(Student.institution),
                selectinload(Student.department),
                selectinload(Student.competencies).selectinload(StudentCompetency.competency),
                selectinload(Student.projects),
            )
        )
        res = await self.db.execute(stmt)
        return res.scalars().first()

    async def get_by_student_id(self, student_id: str) -> Optional[Student]:
        stmt = (
            select(Student)
            .where(Student.id == student_id)
            .options(
                selectinload(Student.user),
                selectinload(Student.institution),
                selectinload(Student.department),
                selectinload(Student.competencies).selectinload(StudentCompetency.competency),
                selectinload(Student.projects),
            )
        )
        res = await self.db.execute(stmt)
        return res.scalars().first()

    async def get_by_id_or_user_id(self, identifier: str) -> Optional[Student]:
        """Fetch student record resolving by either student_id or user_id."""
        stmt = (
            select(Student)
            .where(or_(Student.id == identifier, Student.user_id == identifier))
            .options(
                selectinload(Student.user),
                selectinload(Student.institution),
                selectinload(Student.department),
            )
        )
        res = await self.db.execute(stmt)
        return res.scalars().first()

    async def list_students_with_details(self, limit: int = 50, offset: int = 0) -> List[Student]:
        stmt = (
            select(Student)
            .options(
                selectinload(Student.user),
                selectinload(Student.institution),
                selectinload(Student.department),
                selectinload(Student.competencies).selectinload(StudentCompetency.competency),
            )
            .offset(offset)
            .limit(limit)
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def resolve_student_id(self, identifier: str) -> Optional[str]:
        """Resolve either student_id or user_id to canonical student_id."""
        stmt = select(Student.id).where(or_(Student.id == identifier, Student.user_id == identifier))
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_student_competencies(
        self,
        student_id: str,
        search: Optional[str] = None,
        domain_code: Optional[str] = None,
        category: Optional[str] = None,
        offset: int = 0,
        limit: int = 20
    ) -> Tuple[List[StudentCompetency], int]:
        """Paginated retrieval of student competencies with canonical taxonomy metadata."""
        from app.infrastructure.database.models import Domain, Category, SkillCompetency, Skill

        base_query = (
            select(StudentCompetency)
            .join(Competency, StudentCompetency.competency_id == Competency.id)
            .outerjoin(Domain, Competency.domain_id == Domain.id)
            .outerjoin(Category, Competency.category_id == Category.id)
            .where(
                and_(
                    StudentCompetency.student_id == student_id,
                    Competency.status == "ACTIVE"
                )
            )
        )

        if domain_code:
            base_query = base_query.where(Domain.code == domain_code.upper())
        if category:
            base_query = base_query.where(
                or_(
                    Category.slug == category.lower(),
                    Category.code == category.upper(),
                    Competency.category.ilike(f"%{category}%")
                )
            )
        if search:
            pattern = f"%{search}%"
            base_query = base_query.where(
                or_(
                    Competency.name.ilike(pattern),
                    Competency.code.ilike(pattern),
                    Competency.slug.ilike(pattern)
                )
            )

        count_stmt = select(func.count()).select_from(base_query.subquery())
        total = await self.db.scalar(count_stmt) or 0

        stmt = (
            base_query
            .options(
                selectinload(StudentCompetency.competency).selectinload(Competency.domain_rel),
                selectinload(StudentCompetency.competency).selectinload(Competency.category_rel),
                selectinload(StudentCompetency.competency)
                .selectinload(Competency.skill_mappings)
                .selectinload(SkillCompetency.skill)
            )
            .order_by(StudentCompetency.score.desc(), Competency.name)
            .offset(offset)
            .limit(limit)
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all()), total

    async def get_student_competency_by_id_or_slug(
        self,
        student_id: str,
        competency_id_or_slug: str
    ) -> Optional[StudentCompetency]:
        """Deep lookup of a single student competency with full taxonomy and graph edges."""
        from app.infrastructure.database.models import CompetencyRelationship, SkillCompetency

        stmt = (
            select(StudentCompetency)
            .join(Competency, StudentCompetency.competency_id == Competency.id)
            .where(
                and_(
                    StudentCompetency.student_id == student_id,
                    or_(
                        Competency.id == competency_id_or_slug,
                        Competency.slug == competency_id_or_slug.lower(),
                        Competency.code == competency_id_or_slug.upper()
                    )
                )
            )
            .options(
                selectinload(StudentCompetency.competency).selectinload(Competency.domain_rel),
                selectinload(StudentCompetency.competency).selectinload(Competency.category_rel),
                selectinload(StudentCompetency.competency)
                .selectinload(Competency.skill_mappings)
                .selectinload(SkillCompetency.skill),
                selectinload(StudentCompetency.competency)
                .selectinload(Competency.outgoing_relationships)
                .selectinload(CompetencyRelationship.target_competency),
                selectinload(StudentCompetency.competency)
                .selectinload(Competency.incoming_relationships)
                .selectinload(CompetencyRelationship.source_competency)
            )
        )
        res = await self.db.execute(stmt)
        return res.scalars().first()

    async def upsert_student_competency(
        self,
        student_id: str,
        competency_id: str,
        proficiency_level: str,
        score: float,
        confidence_score: float = 0.85,
        is_verified: bool = False
    ) -> Tuple[StudentCompetency, bool]:
        """Idempotent upsert of student competency respecting unique constraint."""
        stmt = (
            select(StudentCompetency)
            .where(
                and_(
                    StudentCompetency.student_id == student_id,
                    StudentCompetency.competency_id == competency_id
                )
            )
        )
        res = await self.db.execute(stmt)
        sc = res.scalars().first()
        is_new = False

        if sc:
            sc.proficiency_level = proficiency_level
            sc.score = score
            sc.confidence_score = confidence_score
            if is_verified:
                sc.is_verified = True
            sc.updated_at = func.now()
        else:
            from datetime import datetime, timezone
            sc = StudentCompetency(
                student_id=student_id,
                competency_id=competency_id,
                proficiency_level=proficiency_level,
                score=score,
                confidence_score=confidence_score,
                is_verified=is_verified,
                verified_at=datetime.now(timezone.utc) if is_verified else None
            )
            self.db.add(sc)
            is_new = True

        await self.db.flush()
        return sc, is_new

    async def get_student_demonstrated_skills(self, student_id: str) -> List[Dict[str, Any]]:
        """Extract demonstrated skills from student projects and certifications."""
        stmt = (
            select(Project)
            .where(Project.student_id == student_id)
        )
        res = await self.db.execute(stmt)
        projects = res.scalars().all()

        skills = []
        for p in projects:
            for s in (p.demonstrated_skills or []):
                skills.append({
                    "skill": s,
                    "source": "VERIFIED_EVIDENCE" if p.is_verified else "SELF_REPORTED",
                    "project_title": p.title
                })
        return skills

