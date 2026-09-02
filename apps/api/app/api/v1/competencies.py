from fastapi import APIRouter
from app.domains.competencies.service import competency_service

router = APIRouter(prefix="/competencies", tags=["Competency Taxonomy & Ontology"])

@router.get("")
async def list_competencies():
    return await competency_service.list_competencies()

@router.post("")
async def add_competency(data: dict):
    return await competency_service.add_competency(data)
