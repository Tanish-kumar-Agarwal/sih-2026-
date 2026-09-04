from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone
import hashlib
import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.infrastructure.database.models import (
    Evidence,
    EvidenceVerification,
    EvidenceProvenance,
    EvidenceClaim,
    EvidenceCompetency,
    EvidenceSkill,
    EvidenceArtifact,
    EvidenceExtraction,
    Competency,
    Skill,
    Student,
    utc_now
)
from app.infrastructure.database.repositories.evidence_repo import EvidenceRepository
from app.infrastructure.database.repositories.student_repo import StudentRepository
from app.infrastructure.database.repositories.artifact_repo import ArtifactRepository
from app.infrastructure.storage.uploader import storage_service
from app.domains.evidence.extraction.resolver import extractor_resolver
from app.domains.evidence.constants import (
    EvidenceType,
    EvidenceSourceType,
    ProcessingStatus,
    VerificationStatus,
    EvidenceStrength,
    ClaimType,
    is_valid_verification_transition
)
from app.domains.evidence.schemas import (
    EvidenceCreateDTO,
    EvidenceSummaryDTO,
    EvidenceDetailDTO,
    EvidenceProvenanceDTO,
    EvidenceClaimDTO,
    EvidenceCompetencyMappingDTO,
    EvidenceSkillMappingDTO,
    EvidenceVerificationDTO,
    EvidenceVerifyResponseDTO,
    EvidenceArtifactDTO,
    EvidenceExtractionDTO
)

class EvidenceService:
    def _map_to_detail_dto(self, e: Evidence) -> EvidenceDetailDTO:
        student = e.student
        user = student.user if student else None
        student_name = f"{user.first_name} {user.last_name}" if user else "Student"

        prov_dto = None
        if e.provenance:
            prov_dto = EvidenceProvenanceDTO.model_validate(e.provenance)

        claims_dto = [EvidenceClaimDTO.model_validate(c) for c in (e.claims or [])]

        comp_dto = []
        for cm in (e.competency_mappings or []):
            comp_dto.append(EvidenceCompetencyMappingDTO(
                id=cm.id,
                evidence_id=cm.evidence_id,
                competency_id=cm.competency_id,
                competency_code=cm.competency.code if cm.competency else None,
                competency_name=cm.competency.name if cm.competency else None,
                claim_id=cm.claim_id,
                mapping_source=cm.mapping_source,
                confidence=cm.confidence,
                weight=cm.weight,
                created_at=cm.created_at
            ))

        skill_dto = []
        for sm in (e.skill_mappings or []):
            skill_dto.append(EvidenceSkillMappingDTO(
                id=sm.id,
                evidence_id=sm.evidence_id,
                skill_id=sm.skill_id,
                skill_name=sm.skill.name if sm.skill else None,
                claim_id=sm.claim_id,
                relevance_score=sm.relevance_score,
                created_at=sm.created_at
            ))

        verif_dto = []
        for v in (e.verifications or []):
            verifier = v.verifier
            v_name = f"{verifier.first_name} {verifier.last_name}" if verifier else v.verifier_role.capitalize()
            verif_dto.append(EvidenceVerificationDTO(
                id=v.id,
                evidence_id=v.evidence_id,
                verifier_id=v.verifier_id,
                verifier_name=v_name,
                verifier_role=v.verifier_role,
                status=v.status,
                remarks=v.remarks,
                attestation_digest=v.attestation_digest,
                verified_at=v.verified_at
            ))

        artifacts_dto = []
        for a in (e.artifacts or []):
            ext_dto = [EvidenceExtractionDTO.model_validate(x) for x in (a.extractions or [])]
            artifacts_dto.append(EvidenceArtifactDTO(
                id=a.id,
                evidence_id=a.evidence_id,
                original_filename=a.original_filename,
                normalized_filename=a.normalized_filename,
                mime_type=a.mime_type,
                detected_content_type=a.detected_content_type,
                file_size=a.file_size,
                sha256_checksum=a.sha256_checksum,
                storage_provider=a.storage_provider,
                storage_key=a.storage_key,
                retention_state=a.retention_state,
                created_at=a.created_at,
                extractions=ext_dto
            ))

        return EvidenceDetailDTO(
            id=e.id,
            student_id=e.student_id,
            student_name=student_name,
            title=e.title,
            description=e.description,
            evidence_type=e.evidence_type,
            source_type=e.source_type,
            source_uri=e.uri,
            source_reference=e.source_reference,
            processing_status=e.processing_status,
            verification_status=e.verification_status,
            evidence_strength=e.evidence_strength,
            trust_score=e.trust_score,
            confidence_score=e.confidence_score,
            domain_code=e.domain_code,
            created_at=e.created_at,
            updated_at=e.updated_at,
            verified_at=e.verified_at,
            provenance=prov_dto,
            claims=claims_dto,
            competency_mappings=comp_dto,
            skill_mappings=skill_dto,
            verifications=verif_dto,
            artifacts=artifacts_dto
        )

    async def create_evidence(
        self,
        db: AsyncSession,
        student_id: str,
        data: EvidenceCreateDTO
    ) -> EvidenceDetailDTO:
        student_repo = StudentRepository(db)
        student = await student_repo.get_by_id_or_user_id(student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student '{student_id}' not found"
            )

        sha256 = data.sha256_hash
        if not sha256:
            digest_src = f"{student.id}:{data.title}:{data.source_uri or ''}:{datetime.now(timezone.utc).timestamp()}"
            sha256 = hashlib.sha256(digest_src.encode()).hexdigest()

        evidence = Evidence(
            student_id=student.id,
            title=data.title,
            description=data.description,
            evidence_type=data.evidence_type.value,
            source_type=data.source_type.value,
            uri=data.source_uri,
            source_reference=data.source_reference,
            sha256_hash=sha256,
            trust_score=0.5,
            confidence_score=1.0,
            evidence_strength=data.evidence_strength.value,
            processing_status=ProcessingStatus.COMPLETED.value,
            verification_status=VerificationStatus.PENDING.value,
            domain_code=data.domain_code,
            entity_type=data.entity_type,
            entity_id=data.entity_id
        )
        db.add(evidence)
        await db.flush()

        provenance = EvidenceProvenance(
            evidence_id=evidence.id,
            source_type=data.source_type.value,
            source_url=data.source_uri,
            source_reference=data.source_reference or f"{data.source_type.value}:{data.title}",
            collection_method="USER_UPLOAD" if data.source_type == EvidenceSourceType.DOCUMENT else "SYSTEM_SYNC",
            extraction_method="METADATA_PARSER",
            analysis_method="DETERMINISTIC_EXTRACTION",
            algorithm_version="v1.0.0",
            observed_at=utc_now()
        )
        db.add(provenance)

        first_claim_id = None
        if data.observed_facts or data.claims:
            facts = data.observed_facts or [f"Observed artifact '{data.title}' submitted by student."]
            claims_statements = data.claims or [f"Artifact provides verified evidence of {data.title} participation."]
            
            for fact, claim_stmt in zip(facts, claims_statements):
                claim = EvidenceClaim(
                    evidence_id=evidence.id,
                    claim_type=ClaimType.SKILL_DEMONSTRATION.value,
                    observed_fact=fact,
                    claim_statement=claim_stmt,
                    confidence=1.0,
                    status="ACTIVE"
                )
                db.add(claim)
                await db.flush()
                if first_claim_id is None:
                    first_claim_id = claim.id

        if data.competency_ids:
            for comp_id in data.competency_ids:
                c_res = await db.execute(select(Competency).where(Competency.id == comp_id))
                comp = c_res.scalar_one_or_none()
                if comp:
                    comp_map = EvidenceCompetency(
                        evidence_id=evidence.id,
                        competency_id=comp.id,
                        claim_id=first_claim_id,
                        mapping_source="DIRECT_ASSERTION",
                        confidence=1.0,
                        weight=1.0
                    )
                    db.add(comp_map)

        if data.skill_ids:
            for s_id in data.skill_ids:
                s_res = await db.execute(select(Skill).where(Skill.id == s_id))
                sk = s_res.scalar_one_or_none()
                if sk:
                    sk_map = EvidenceSkill(
                        evidence_id=evidence.id,
                        skill_id=sk.id,
                        claim_id=first_claim_id,
                        relevance_score=1.0
                    )
                    db.add(sk_map)

        await db.commit()

        repo = EvidenceRepository(db)
        saved = await repo.get_detail(evidence.id)
        return self._map_to_detail_dto(saved)

    async def ingest_file_evidence(
        self,
        db: AsyncSession,
        student_id: str,
        filename: str,
        content: bytes,
        declared_mime: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        evidence_type: str = "DOCUMENT",
        evidence_strength: str = "STRONG",
        domain_code: str = "GENERAL"
    ) -> EvidenceDetailDTO:
        """
        Production file ingestion pipeline:
        1. Validates student ownership
        2. Validates & stores binary in object storage
        3. Persists Evidence & EvidenceArtifact
        4. Extracts content via format-specific extractor
        5. Persists EvidenceExtraction & Observed Facts
        6. Preserves atomic integrity with compensating rollback on failure
        """
        student_repo = StudentRepository(db)
        student = await student_repo.get_by_id_or_user_id(student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile '{student_id}' not found"
            )

        evidence_id = str(uuid.uuid4())
        artifact_id = str(uuid.uuid4())

        # Step A: Validate & store physical file content
        stored_key, norm_filename, checksum, file_size, detected_mime = await storage_service.save_artifact(
            student_id=student.id,
            evidence_id=evidence_id,
            artifact_id=artifact_id,
            filename=filename,
            content=content,
            declared_mime=declared_mime
        )

        display_title = title or norm_filename

        try:
            # Step B: Create Evidence Domain Record
            evidence = Evidence(
                id=evidence_id,
                student_id=student.id,
                title=display_title,
                description=description or f"Uploaded document '{norm_filename}'",
                evidence_type=evidence_type,
                source_type=EvidenceSourceType.DOCUMENT.value,
                uri=stored_key,
                source_reference=norm_filename,
                sha256_hash=checksum,
                trust_score=0.5,
                confidence_score=1.0,
                evidence_strength=evidence_strength,
                processing_status=ProcessingStatus.STORED.value,
                verification_status=VerificationStatus.PENDING.value,
                domain_code=domain_code
            )
            db.add(evidence)

            # Step C: Create Provenance Record
            provenance = EvidenceProvenance(
                evidence_id=evidence.id,
                source_type=EvidenceSourceType.DOCUMENT.value,
                source_url=stored_key,
                source_reference=norm_filename,
                collection_method="USER_UPLOAD",
                extraction_method="DOCUMENT_PARSER",
                analysis_method="DETERMINISTIC_EXTRACTION",
                algorithm_version="v1.0.0",
                observed_at=utc_now()
            )
            db.add(provenance)

            # Step D: Create Physical Artifact Record
            artifact = EvidenceArtifact(
                id=artifact_id,
                evidence_id=evidence.id,
                original_filename=filename,
                normalized_filename=norm_filename,
                mime_type=detected_mime,
                detected_content_type=detected_mime,
                file_size=file_size,
                sha256_checksum=checksum,
                storage_provider="LOCAL",
                storage_key=stored_key,
                retention_state="ACTIVE"
            )
            db.add(artifact)
            await db.flush()

            # Step E: Resolve Extractor & Extract Content
            extractor = extractor_resolver.resolve(detected_mime, norm_filename)
            extraction_res = None
            if extractor:
                evidence.processing_status = ProcessingStatus.PROCESSING.value
                extraction_res = extractor.extract(content, norm_filename)

                extraction = EvidenceExtraction(
                    artifact_id=artifact.id,
                    extractor_name=extraction_res.extractor_name,
                    extractor_version=extraction_res.extractor_version,
                    extraction_status=extraction_res.status,
                    raw_text=extraction_res.raw_text,
                    page_count=extraction_res.page_count,
                    extracted_metadata=extraction_res.extracted_metadata,
                    observed_facts=extraction_res.observed_facts,
                    error_message=extraction_res.error_message,
                    extracted_at=utc_now()
                )
                db.add(extraction)

                # Persist technical observed facts as EvidenceClaims
                if extraction_res.observed_facts:
                    for fact in extraction_res.observed_facts:
                        claim = EvidenceClaim(
                            evidence_id=evidence.id,
                            claim_type=ClaimType.FACT_OBSERVATION.value,
                            observed_fact=fact,
                            claim_statement=f"Observed in document '{norm_filename}' by {extraction_res.extractor_name}.",
                            confidence=1.0,
                            status="ACTIVE"
                        )
                        db.add(claim)

                # Provenance update
                provenance.extraction_method = extraction_res.extractor_name
                provenance.algorithm_version = extraction_res.extractor_version

                if extraction_res.status in ("COMPLETED", "EMPTY"):
                    evidence.processing_status = ProcessingStatus.COMPLETED.value
                else:
                    evidence.processing_status = ProcessingStatus.FAILED.value
            else:
                evidence.processing_status = ProcessingStatus.COMPLETED.value

            await db.commit()

            repo = EvidenceRepository(db)
            saved = await repo.get_detail(evidence.id)
            return self._map_to_detail_dto(saved)

        except Exception as ex:
            await db.rollback()
            # Compensating deletion on object storage failure
            await storage_service.delete_artifact(stored_key)
            if isinstance(ex, HTTPException):
                raise ex
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Evidence ingestion failed: {str(ex)}"
            )

    async def get_artifact_file(
        self,
        db: AsyncSession,
        evidence_id: str,
        artifact_id: str,
        requesting_student_id: Optional[str] = None
    ) -> Tuple[bytes, str, str]:
        """Validates ownership and retrieves binary artifact content for download."""
        repo = ArtifactRepository(db)
        artifact = await repo.get_detail(artifact_id)
        if not artifact or artifact.evidence_id != evidence_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Artifact '{artifact_id}' not found for evidence '{evidence_id}'"
            )

        # Cross-student isolation check
        if requesting_student_id:
            student_repo = StudentRepository(db)
            student = await student_repo.get_by_id_or_user_id(requesting_student_id)
            if not student or artifact.evidence.student_id != student.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: cannot retrieve another student's evidence artifact"
                )

        content = await storage_service.get_artifact_content(artifact.storage_key)
        return content, artifact.mime_type, artifact.normalized_filename

    async def get_evidence_detail(self, db: AsyncSession, evidence_id: str) -> EvidenceDetailDTO:
        repo = EvidenceRepository(db)
        evidence = await repo.get_detail(evidence_id)
        if not evidence:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Evidence item '{evidence_id}' not found"
            )
        return self._map_to_detail_dto(evidence)

    async def list_pending(self, db: AsyncSession) -> List[EvidenceSummaryDTO]:
        repo = EvidenceRepository(db)
        items = await repo.list_pending_verifications()
        results = []
        for e in items:
            student = e.student
            user = student.user if student else None
            student_name = f"{user.first_name} {user.last_name}" if user else "Student"
            results.append(EvidenceSummaryDTO(
                id=e.id,
                student_id=e.student_id,
                student_name=student_name,
                title=e.title,
                description=e.description,
                evidence_type=e.evidence_type,
                source_type=e.source_type,
                source_uri=e.uri,
                source_reference=e.source_reference,
                processing_status=e.processing_status,
                verification_status=e.verification_status,
                evidence_strength=e.evidence_strength,
                trust_score=e.trust_score,
                confidence_score=e.confidence_score,
                domain_code=e.domain_code,
                created_at=e.created_at,
                updated_at=e.updated_at,
                verified_at=e.verified_at
            ))
        return results

    async def list_student_evidence(self, db: AsyncSession, student_id_or_user_id: str) -> List[EvidenceDetailDTO]:
        student_repo = StudentRepository(db)
        student = await student_repo.get_by_id_or_user_id(student_id_or_user_id)
        if not student:
            return []

        repo = EvidenceRepository(db)
        items = await repo.list_by_student_id(student.id)
        return [self._map_to_detail_dto(e) for e in items]

    async def verify_evidence(
        self,
        db: AsyncSession,
        evidence_id: str,
        verification_status: str,
        remarks: Optional[str] = None,
        verifier_id: Optional[str] = None,
        verifier_role: str = "faculty"
    ) -> EvidenceVerifyResponseDTO:
        repo = EvidenceRepository(db)
        evidence = await repo.get_detail(evidence_id)
        if not evidence:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Evidence item '{evidence_id}' not found"
            )

        current_status = evidence.verification_status or VerificationStatus.PENDING.value
        if not is_valid_verification_transition(current_status, verification_status):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Illegal verification state transition from '{current_status}' to '{verification_status}'"
            )

        evidence.verification_status = verification_status
        now = utc_now()
        evidence.updated_at = now

        if verification_status == VerificationStatus.VERIFIED.value:
            evidence.trust_score = 0.95
            evidence.verified_at = now
        elif verification_status == VerificationStatus.REJECTED.value:
            evidence.trust_score = 0.1

        attestation = f"attest_{evidence.sha256_hash[:16] if evidence.sha256_hash else 'sig'}_{int(now.timestamp())}"
        verification = EvidenceVerification(
            evidence_id=evidence.id,
            verifier_id=verifier_id,
            verifier_role=verifier_role,
            status="APPROVED" if verification_status == VerificationStatus.VERIFIED.value else verification_status,
            remarks=remarks,
            attestation_digest=attestation,
            verified_at=now
        )
        db.add(verification)
        await db.commit()
        await db.refresh(evidence)

        return EvidenceVerifyResponseDTO(
            id=evidence.id,
            verification_status=evidence.verification_status,
            trust_score=evidence.trust_score,
            remarks=remarks,
            attestation_digest=attestation,
            verified_at=now
        )

evidence_service = EvidenceService()
