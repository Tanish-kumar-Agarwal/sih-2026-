from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.infrastructure.database.models import Evidence, EvidenceVerification, Student
from .base import BaseRepository

class EvidenceRepository(BaseRepository[Evidence]):
    def __init__(self, db: AsyncSession):
        super().__init__(Evidence, db)

    async def list_pending_verifications(self, limit: int = 50) -> List[Evidence]:
        stmt = (
            select(Evidence)
            .where(Evidence.verification_status == "PENDING")
            .options(
                selectinload(Evidence.student).selectinload(Student.user),
                selectinload(Evidence.verifications),
            )
            .limit(limit)
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def list_by_student_id(self, student_id: str) -> List[Evidence]:
        stmt = (
            select(Evidence)
            .where(Evidence.student_id == student_id)
            .options(selectinload(Evidence.verifications))
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())
