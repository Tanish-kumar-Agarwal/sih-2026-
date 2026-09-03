from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.infrastructure.database.models import Opportunity, Company
from .base import BaseRepository

class OpportunityRepository(BaseRepository[Opportunity]):
    def __init__(self, db: AsyncSession):
        super().__init__(Opportunity, db)

    async def list_active_opportunities(self, limit: int = 50, offset: int = 0) -> List[Opportunity]:
        stmt = (
            select(Opportunity)
            .where(Opportunity.status == "ACTIVE")
            .options(selectinload(Opportunity.company))
            .offset(offset)
            .limit(limit)
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_with_company(self, opportunity_id: str) -> Optional[Opportunity]:
        stmt = (
            select(Opportunity)
            .where(Opportunity.id == opportunity_id)
            .options(selectinload(Opportunity.company))
        )
        res = await self.db.execute(stmt)
        return res.scalars().first()
