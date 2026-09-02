from typing import List, Dict, Any

class CompetencyService:
    def __init__(self):
        self._taxonomy = [
            {"id": "comp-1", "code": "COMP-PYTHON", "name": "Python Engineering", "category": "Core Technical", "difficulty": "Intermediate"},
            {"id": "comp-2", "code": "COMP-FASTAPI", "name": "FastAPI Backend Architecture", "category": "Core Technical", "difficulty": "Intermediate"},
            {"id": "comp-3", "code": "COMP-REACT", "name": "React & Next.js Ecosystem", "category": "Core Technical", "difficulty": "Advanced"},
            {"id": "comp-4", "code": "COMP-NEO4J", "name": "Neo4j Graph DB & Cypher", "category": "Architectural", "difficulty": "Advanced"},
            {"id": "comp-5", "code": "COMP-DOCKER", "name": "Docker & Cloud Deployments", "category": "DevOps", "difficulty": "Intermediate"},
            {"id": "comp-6", "code": "COMP-ML", "name": "Applied ML & Neural Architectures", "category": "Applied Domain", "difficulty": "Advanced"},
            {"id": "comp-7", "code": "COMP-POSTGRES", "name": "PostgreSQL Architecture", "category": "Architectural", "difficulty": "Intermediate"}
        ]

    async def list_competencies(self) -> List[Dict[str, Any]]:
        return self._taxonomy

    async def add_competency(self, data: dict) -> Dict[str, Any]:
        item = {
            "id": f"comp-{len(self._taxonomy) + 1}",
            "code": data.get("code", "COMP-CUSTOM"),
            "name": data.get("name"),
            "category": data.get("category", "Core Technical"),
            "difficulty": data.get("difficulty", "Intermediate")
        }
        self._taxonomy.append(item)
        return item

competency_service = CompetencyService()
