from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.infrastructure.database.models import (
    Evidence,
    EvidenceVerification,
    EvidenceProvenance,
    EvidenceClaim,
    EvidenceCompetency,
    EvidenceSkill,
    EvidenceArtifact,
    Competency,
    Skill,
    Student
)
from .base import BaseRepository

class EvidenceRepository(BaseRepository[Evidence]):
    def __init__(self, db: AsyncSession):
        super().__init__(Evidence, db)

    async def get_detail(self, evidence_id: str) -> Optional[Evidence]:
        stmt = (
            select(Evidence)
            .where(Evidence.id == evidence_id)
            .options(
                selectinload(Evidence.provenance),
                selectinload(Evidence.claims),
                selectinload(Evidence.competency_mappings).selectinload(EvidenceCompetency.competency),
                selectinload(Evidence.skill_mappings).selectinload(EvidenceSkill.skill),
                selectinload(Evidence.verifications).selectinload(EvidenceVerification.verifier),
                selectinload(Evidence.artifacts).selectinload(EvidenceArtifact.extractions),
                selectinload(Evidence.student).selectinload(Student.user)
            )
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def list_pending_verifications(self, limit: int = 50) -> List[Evidence]:
        stmt = (
            select(Evidence)
            .where(Evidence.verification_status == "PENDING")
            .options(
                selectinload(Evidence.student).selectinload(Student.user),
                selectinload(Evidence.verifications),
                selectinload(Evidence.provenance),
            )
            .order_by(Evidence.created_at.desc())
            .limit(limit)
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def list_by_student_id(self, student_id: str) -> List[Evidence]:
        stmt = (
            select(Evidence)
            .where(Evidence.student_id == student_id)
            .options(
                selectinload(Evidence.student).selectinload(Student.user),
                selectinload(Evidence.provenance),
                selectinload(Evidence.claims),
                selectinload(Evidence.verifications).selectinload(EvidenceVerification.verifier),
                selectinload(Evidence.competency_mappings).selectinload(EvidenceCompetency.competency),
                selectinload(Evidence.skill_mappings).selectinload(EvidenceSkill.skill),
                selectinload(Evidence.artifacts).selectinload(EvidenceArtifact.extractions)
            )
            .order_by(Evidence.created_at.desc())
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())
