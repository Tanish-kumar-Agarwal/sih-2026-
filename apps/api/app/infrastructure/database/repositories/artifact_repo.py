from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.infrastructure.database.models import EvidenceArtifact, EvidenceExtraction, Evidence
from .base import BaseRepository

class ArtifactRepository(BaseRepository[EvidenceArtifact]):
    def __init__(self, db: AsyncSession):
        super().__init__(EvidenceArtifact, db)

    async def get_detail(self, artifact_id: str) -> Optional[EvidenceArtifact]:
        stmt = (
            select(EvidenceArtifact)
            .where(EvidenceArtifact.id == artifact_id)
            .options(
                selectinload(EvidenceArtifact.extractions),
                selectinload(EvidenceArtifact.evidence).selectinload(Evidence.student)
            )
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def list_by_evidence_id(self, evidence_id: str) -> List[EvidenceArtifact]:
        stmt = (
            select(EvidenceArtifact)
            .where(EvidenceArtifact.evidence_id == evidence_id)
            .options(selectinload(EvidenceArtifact.extractions))
            .order_by(EvidenceArtifact.created_at.asc())
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def find_by_checksum_and_student(
        self,
        student_id: str,
        sha256_checksum: str
    ) -> Optional[EvidenceArtifact]:
        """Finds any existing stored artifact with identical checksum for this student."""
        stmt = (
            select(EvidenceArtifact)
            .join(Evidence, EvidenceArtifact.evidence_id == Evidence.id)
            .where(
                Evidence.student_id == student_id,
                EvidenceArtifact.sha256_checksum == sha256_checksum,
                EvidenceArtifact.retention_state == "ACTIVE"
            )
            .options(
                selectinload(EvidenceArtifact.extractions),
                selectinload(EvidenceArtifact.evidence)
            )
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()
