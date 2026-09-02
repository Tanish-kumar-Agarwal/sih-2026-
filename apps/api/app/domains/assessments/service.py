from typing import List, Dict, Any

class AssessmentService:
    async def get_adaptive_assessment(self, competency_code: str) -> Dict[str, Any]:
        return {
            "assessment_id": "asm-fastapi-01",
            "competency_code": competency_code,
            "title": "FastAPI & Async Python Architectural Challenge",
            "duration_minutes": 25,
            "passing_score": 75,
            "questions": [
                {
                    "id": "q1",
                    "text": "How does FastAPI manage asynchronous dependency injection with async context managers?",
                    "options": [
                        "Via standard yield expressions inside async dependency functions",
                        "By forcing global singleton locks",
                        "Using multithreaded daemon threads exclusively",
                        "FastAPI does not support async context injection"
                    ],
                    "correct_index": 0
                },
                {
                    "id": "q2",
                    "text": "In a Neo4j + PostgreSQL hybrid architecture, why is PostgreSQL designated as the ground truth source?",
                    "options": [
                        "Neo4j cannot store strings",
                        "ACID guarantees, deterministic entity storage and transactional integrity",
                        "PostgreSQL has faster graph traversal than Neo4j",
                        "Relational databases are required by law"
                    ],
                    "correct_index": 1
                }
            ]
        }

assessment_service = AssessmentService()
