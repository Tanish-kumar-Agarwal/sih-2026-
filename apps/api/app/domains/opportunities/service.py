from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.models import Opportunity, Company
from app.infrastructure.database.repositories.opportunity_repo import OpportunityRepository

class OpportunityService:
    async def list_opportunities(self, db: AsyncSession, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        repo = OpportunityRepository(db)
        opps = await repo.list_active_opportunities(limit=limit, offset=offset)
        
        results = []
        for opp in opps:
            company = opp.company
            results.append({
                "id": opp.id,
                "company_id": opp.company_id,
                "company_name": company.name if company else "Enterprise Partner",
                "company_logo": company.logo_url if company else None,
                "title": opp.title,
                "type": opp.type,
                "stipend_or_salary": opp.stipend_or_salary or "Competitive",
                "location": opp.location or "Remote",
                "work_mode": opp.work_mode,
                "openings": opp.openings,
                "status": opp.status,
                "deadline": opp.deadline.isoformat() if opp.deadline else None,
                "description": opp.description or "",
                "required_competencies": opp.required_competencies or [],
                "created_at": opp.created_at.isoformat() if opp.created_at else None
            })
        return results

    async def get_opportunity(self, db: AsyncSession, opportunity_id: str) -> Dict[str, Any]:
        repo = OpportunityRepository(db)
        opp = await repo.get_with_company(opportunity_id)
        if not opp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Opportunity '{opportunity_id}' not found"
            )
        company = opp.company
        return {
            "id": opp.id,
            "company_id": opp.company_id,
            "company_name": company.name if company else "Enterprise Partner",
            "company_logo": company.logo_url if company else None,
            "title": opp.title,
            "type": opp.type,
            "stipend_or_salary": opp.stipend_or_salary,
            "location": opp.location,
            "work_mode": opp.work_mode,
            "openings": opp.openings,
            "status": opp.status,
            "deadline": opp.deadline.isoformat() if opp.deadline else None,
            "description": opp.description,
            "required_competencies": opp.required_competencies or []
        }

    async def create_opportunity(self, db: AsyncSession, data: dict) -> Dict[str, Any]:
        company_id = data.get("company_id")
        if not company_id:
            # Check or create default partner company
            company = Company(name=data.get("company_name", "Enterprise Partner"))
            db.add(company)
            await db.flush()
            company_id = company.id

        opp = Opportunity(
            company_id=company_id,
            title=data["title"],
            type=data.get("type", "INTERNSHIP"),
            stipend_or_salary=data.get("stipend_or_salary", "Competitive"),
            location=data.get("location", "Remote"),
            work_mode=data.get("work_mode", "REMOTE"),
            openings=data.get("openings", 1),
            status="ACTIVE",
            description=data.get("description", ""),
            required_competencies=data.get("required_competencies", [])
        )
        db.add(opp)
        await db.commit()
        await db.refresh(opp)

        return {
            "id": opp.id,
            "company_id": opp.company_id,
            "title": opp.title,
            "status": opp.status,
            "created_at": opp.created_at.isoformat() if opp.created_at else None
        }

opportunity_service = OpportunityService()
