from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.infrastructure.database.models import Opportunity, Company

class OpportunityDTO(BaseModel):
    id: str
    company_name: str
    company_logo: Optional[str] = None
    title: str
    type: str = "INTERNSHIP"
    stipend_or_salary: str
    location: str
    work_mode: str = "REMOTE"
    openings: int = 2
    status: str = "ACTIVE"
    deadline: str
    description: str
    required_competencies: List[Dict[str, Any]]

class OpportunityService:
    def __init__(self):
        self._mock_opportunities = [
            {
                "id": "opp-sih-001",
                "company_name": "NextGen AI Labs",
                "company_logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
                "title": "Full Stack AI Platform Engineer",
                "type": "INTERNSHIP",
                "stipend_or_salary": "₹45,000 / month",
                "location": "Bengaluru (Hybrid)",
                "work_mode": "HYBRID",
                "openings": 3,
                "status": "ACTIVE",
                "deadline": "2026-10-15",
                "description": "We are seeking a talented full-stack engineer with expertise in FastAPI, React/Next.js, and knowledge graph representations to build real-time AI portals.",
                "required_competencies": [
                    {"name": "FastAPI", "importance": "MANDATORY", "weight": 1.0},
                    {"name": "React & Next.js", "importance": "MANDATORY", "weight": 0.95},
                    {"name": "Neo4j Graph DB", "importance": "PREFERRED", "weight": 0.8},
                    {"name": "Docker & DevOps", "importance": "BONUS", "weight": 0.6}
                ]
            },
            {
                "id": "opp-sih-002",
                "company_name": "Cognitive Cloud",
                "company_logo": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=60",
                "title": "Knowledge Graph & LLM Research Intern",
                "type": "INTERNSHIP",
                "stipend_or_salary": "₹55,000 / month",
                "location": "Remote",
                "work_mode": "REMOTE",
                "openings": 2,
                "status": "ACTIVE",
                "deadline": "2026-10-30",
                "description": "Build multi-hop graph retrieval augmented generation (GraphRAG) pipelines combining Neo4j and generative AI agents.",
                "required_competencies": [
                    {"name": "Python", "importance": "MANDATORY", "weight": 1.0},
                    {"name": "Neo4j Graph DB", "importance": "MANDATORY", "weight": 0.95},
                    {"name": "Applied ML & Neural Architectures", "importance": "MANDATORY", "weight": 0.90}
                ]
            },
            {
                "id": "opp-sih-003",
                "company_name": "CyberDefense Networks",
                "company_logo": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=60",
                "title": "DevOps & Cloud Security Specialist",
                "type": "FULL_TIME",
                "stipend_or_salary": "₹14,00,000 / year",
                "location": "Hyderabad (Onsite)",
                "work_mode": "ONSITE",
                "openings": 1,
                "status": "ACTIVE",
                "deadline": "2026-11-05",
                "description": "Orchestrate zero-trust Kubernetes architectures and automated security scanning pipelines.",
                "required_competencies": [
                    {"name": "Docker & DevOps", "importance": "MANDATORY", "weight": 1.0},
                    {"name": "Python", "importance": "PREFERRED", "weight": 0.8},
                    {"name": "Kubernetes", "importance": "MANDATORY", "weight": 0.95}
                ]
            }
        ]

    async def list_opportunities(self, db: AsyncSession) -> List[dict]:
        return self._mock_opportunities

    async def create_opportunity(self, db: AsyncSession, data: dict) -> dict:
        new_opp = {
            "id": f"opp-custom-{len(self._mock_opportunities) + 1}",
            "company_name": data.get("company_name", "Enterprise Partner"),
            "company_logo": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=60",
            "title": data.get("title"),
            "type": data.get("type", "INTERNSHIP"),
            "stipend_or_salary": data.get("stipend_or_salary", "Competitive"),
            "location": data.get("location", "Remote"),
            "work_mode": data.get("work_mode", "REMOTE"),
            "openings": data.get("openings", 1),
            "status": "ACTIVE",
            "deadline": data.get("deadline", "2026-12-31"),
            "description": data.get("description", ""),
            "required_competencies": data.get("required_competencies", [])
        }
        self._mock_opportunities.insert(0, new_opp)
        return new_opp

opportunity_service = OpportunityService()
