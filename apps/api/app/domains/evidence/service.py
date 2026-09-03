from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.models import Evidence, EvidenceVerification, Student
from app.infrastructure.database.repositories.evidence_repo import EvidenceRepository

class EvidenceService:
    async def list_pending(self, db: AsyncSession) -> List[Dict[str, Any]]:
        repo = EvidenceRepository(db)
        items = await repo.list_pending_verifications()
        
        results = []
        for e in items:
            student = e.student
            user = student.user if student else None
            results.append({
                "id": e.id,
                "student_id": e.student_id,
                "student_name": f"{user.first_name} {user.last_name}" if user else "Unknown Student",
                "entity_type": e.entity_type,
                "entity_id": e.entity_id,
                "title": e.title,
                "uri": e.uri,
                "sha256_hash": e.sha256_hash,
                "trust_score": e.trust_score,
                "verification_status": e.verification_status,
                "created_at": e.created_at.isoformat() if e.created_at else None
            })
        return results

    async def verify_evidence(
        self,
        db: AsyncSession,
        evidence_id: str,
        verification_status: str,
        remarks: Optional[str] = None,
        verifier_id: Optional[str] = None,
        verifier_role: str = "faculty"
    ) -> Dict[str, Any]:
        repo = EvidenceRepository(db)
        evidence = await repo.get_by_id(evidence_id)
        if not evidence:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Evidence '{evidence_id}' not found"
            )

        evidence.verification_status = verification_status
        if verification_status == "VERIFIED":
            evidence.trust_score = 0.95

        # Create audit verification ledger entry
        verification = EvidenceVerification(
            evidence_id=evidence.id,
            verifier_id=verifier_id,
            verifier_role=verifier_role,
            status="APPROVED" if verification_status == "VERIFIED" else "REJECTED",
            remarks=remarks,
            attestation_digest=f"attest_{evidence.sha256_hash[:16] if evidence.sha256_hash else 'sig'}_{int(datetime.now(timezone.utc).timestamp())}"
        )
        db.add(verification)
        await db.commit()
        await db.refresh(evidence)

        return {
            "id": evidence.id,
            "verification_status": evidence.verification_status,
            "trust_score": evidence.trust_score,
            "remarks": remarks,
            "attestation_digest": verification.attestation_digest,
            "verified_at": verification.verified_at.isoformat()
        }

evidence_service = EvidenceService()
