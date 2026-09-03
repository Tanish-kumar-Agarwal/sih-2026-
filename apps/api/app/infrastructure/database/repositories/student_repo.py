from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
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
