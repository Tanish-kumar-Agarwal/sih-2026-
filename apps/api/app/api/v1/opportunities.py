from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.session import get_db
from app.domains.opportunities.service import opportunity_service

router = APIRouter(prefix="/opportunities", tags=["Opportunities & Blueprints"])

@router.get("")
async def list_opportunities(db: AsyncSession = Depends(get_db)):
    return await opportunity_service.list_opportunities(db)

@router.post("")
async def create_opportunity(data: dict, db: AsyncSession = Depends(get_db)):
    return await opportunity_service.create_opportunity(db, data)
