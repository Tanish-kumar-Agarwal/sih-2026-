from fastapi import APIRouter
from app.domains.industry.service import industry_service

router = APIRouter(prefix="/industry", tags=["Industry & Talent Discovery"])

@router.get("/talent")
async def discover_talent():
    return await industry_service.discover_talent({})
