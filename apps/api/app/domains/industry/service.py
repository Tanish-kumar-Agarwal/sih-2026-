from typing import List, Dict, Any

class IndustryService:
    async def discover_talent(self, filter_query: Dict[str, Any]) -> List[Dict[str, Any]]:
        # Candidate pool with verified graph metrics
        return [
            {
                "id": "stu-aarav-sharma",
                "name": "Aarav Sharma",
                "institution": "IIT Delhi",
                "department": "Computer Science",
                "graduation_year": 2027,
                "readiness_score": 89.4,
                "verified_competencies": ["Python (Adv)", "FastAPI (Int)", "React (Adv)", "Docker (Int)"],
                "featured_project": "SkillSetu AI Graph Engine",
                "match_score_for_active_req": 92.5,
                "verification_status": "FACULTY_VERIFIED"
            },
            {
                "id": "stu-ananya-verma",
                "name": "Ananya Verma",
                "institution": "IIT Bombay",
                "department": "Artificial Intelligence",
                "graduation_year": 2026,
                "readiness_score": 93.1,
                "verified_competencies": ["PyTorch (Adv)", "Graph Neural Nets (Int)", "Python (Adv)", "LLMOps (Int)"],
                "featured_project": "GraphRAG Medical Diagnoser",
                "match_score_for_active_req": 96.0,
                "verification_status": "FACULTY_VERIFIED"
            },
            {
                "id": "stu-rohit-gupta",
                "name": "Rohit Gupta",
                "institution": "BITS Pilani",
                "department": "Information Systems",
                "graduation_year": 2027,
                "readiness_score": 84.0,
                "verified_competencies": ["Go (Int)", "PostgreSQL (Adv)", "Redis (Adv)", "Kubernetes (Int)"],
                "featured_project": "High-Throughput Financial Orderbook",
                "match_score_for_active_req": 81.2,
                "verification_status": "FACULTY_VERIFIED"
            }
        ]

industry_service = IndustryService()
