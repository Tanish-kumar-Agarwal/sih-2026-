from typing import Dict, Any, List

class InstitutionService:
    async def get_readiness_matrix(self, institution_id: str) -> Dict[str, Any]:
        return {
            "institution_id": institution_id,
            "institution_name": "Indian Institute of Technology, Delhi",
            "overall_cohort_readiness": 84.6,
            "active_students": 1420,
            "verified_competencies_count": 5890,
            "placed_percentage": 78.2,
            "top_in_demand_gaps": [
                {
                    "competency_name": "Distributed Knowledge Graphs (Neo4j)",
                    "industry_demand_score": 92,
                    "student_mastery_score": 54,
                    "gap_score": 38
                },
                {
                    "competency_name": "LLM Orchestration & Evaluation (RAG)",
                    "industry_demand_score": 95,
                    "student_mastery_score": 62,
                    "gap_score": 33
                },
                {
                    "competency_name": "Kubernetes & Cloud Native DevOps",
                    "industry_demand_score": 88,
                    "student_mastery_score": 60,
                    "gap_score": 28
                },
                {
                    "competency_name": "High-Throughput Async Systems (FastAPI/Go)",
                    "industry_demand_score": 90,
                    "student_mastery_score": 75,
                    "gap_score": 15
                }
            ],
            "department_breakdown": [
                {"dept_name": "Computer Science & Engineering", "readiness_score": 91.2, "verified_rate": 89.0},
                {"dept_name": "Information Technology", "readiness_score": 86.4, "verified_rate": 82.5},
                {"dept_name": "Electronics & Electrical", "readiness_score": 79.8, "verified_rate": 74.0},
                {"dept_name": "Artificial Intelligence & Data Science", "readiness_score": 88.5, "verified_rate": 85.0}
            ]
        }

institution_service = InstitutionService()
