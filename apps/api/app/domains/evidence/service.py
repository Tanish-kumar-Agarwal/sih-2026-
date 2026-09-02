from typing import List, Dict, Any

class EvidenceService:
    def __init__(self):
        self._evidence_queue = [
            {
                "id": "evi-001",
                "student_id": "stu-aarav-sharma",
                "student_name": "Aarav Sharma",
                "competency_name": "FastAPI Backend Architecture",
                "entity_type": "PROJECT",
                "title": "SkillSetu Backend API Gateway",
                "repo_url": "https://github.com/aarav/skillsetu-api",
                "verification_status": "VERIFIED",
                "verified_by": "Dr. Ramesh Chandra (Professor, CSE)",
                "trust_score": 0.95
            },
            {
                "id": "evi-002",
                "student_id": "stu-aarav-sharma",
                "student_name": "Aarav Sharma",
                "competency_name": "Neo4j Graph Databases",
                "entity_type": "PROJECT",
                "title": "Multi-hop Graph Matcher",
                "repo_url": "https://github.com/aarav/graph-matcher",
                "verification_status": "PENDING",
                "verified_by": None,
                "trust_score": 0.70
            }
        ]

    async def list_pending(self) -> List[Dict[str, Any]]:
        return [e for e in self._evidence_queue if e["verification_status"] == "PENDING"]

    async def verify_evidence(self, evidence_id: str, status: str, remarks: str) -> Dict[str, Any]:
        for item in self._evidence_queue:
            if item["id"] == evidence_id:
                item["verification_status"] = status
                item["remarks"] = remarks
                return item
        return {"status": "SUCCESS", "message": "Updated"}

evidence_service = EvidenceService()
