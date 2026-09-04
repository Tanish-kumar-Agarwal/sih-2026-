from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.domains.evidence.constants import (
    EvidenceType,
    EvidenceSourceType,
    ProcessingStatus,
    VerificationStatus,
    EvidenceStrength,
    ClaimType
)

class EvidenceProvenanceDTO(BaseModel):
    id: str
    evidence_id: str
    source_type: str
    source_url: Optional[str] = None
    source_reference: Optional[str] = None
    collection_method: str
    extraction_method: Optional[str] = None
    analysis_method: Optional[str] = None
    algorithm_version: str
    observed_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class EvidenceClaimDTO(BaseModel):
    id: str
    evidence_id: str
    claim_type: str
    observed_fact: str
    claim_statement: str
    confidence: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class EvidenceCompetencyMappingDTO(BaseModel):
    id: str
    evidence_id: str
    competency_id: str
    competency_code: Optional[str] = None
    competency_name: Optional[str] = None
    claim_id: Optional[str] = None
    mapping_source: str
    confidence: float
    weight: float
    created_at: datetime

    class Config:
        from_attributes = True

class EvidenceSkillMappingDTO(BaseModel):
    id: str
    evidence_id: str
    skill_id: str
    skill_name: Optional[str] = None
    claim_id: Optional[str] = None
    relevance_score: float
    created_at: datetime

    class Config:
        from_attributes = True

class EvidenceVerificationDTO(BaseModel):
    id: str
    evidence_id: str
    verifier_id: Optional[str] = None
    verifier_name: Optional[str] = None
    verifier_role: str
    status: str
    remarks: Optional[str] = None
    attestation_digest: Optional[str] = None
    verified_at: datetime

    class Config:
        from_attributes = True

class EvidenceCreateDTO(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    evidence_type: EvidenceType = EvidenceType.PROJECT
    source_type: EvidenceSourceType = EvidenceSourceType.REPOSITORY
    source_uri: Optional[str] = None
    source_reference: Optional[str] = None
    domain_code: str = "GENERAL"
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    sha256_hash: Optional[str] = None
    evidence_strength: EvidenceStrength = EvidenceStrength.STRONG
    observed_facts: Optional[List[str]] = None
    claims: Optional[List[str]] = None
    competency_ids: Optional[List[str]] = None
    skill_ids: Optional[List[str]] = None

class EvidenceSummaryDTO(BaseModel):
    id: str
    student_id: str
    student_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    evidence_type: str
    source_type: str
    source_uri: Optional[str] = None
    source_reference: Optional[str] = None
    processing_status: str
    verification_status: str
    evidence_strength: str
    trust_score: float
    confidence_score: float
    domain_code: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EvidenceExtractionDTO(BaseModel):
    id: str
    artifact_id: str
    extractor_name: str
    extractor_version: str
    extraction_status: str
    raw_text: Optional[str] = None
    page_count: int
    extracted_metadata: Optional[dict] = None
    observed_facts: Optional[List[str]] = None
    error_message: Optional[str] = None
    extracted_at: datetime

    class Config:
        from_attributes = True

class EvidenceArtifactDTO(BaseModel):
    id: str
    evidence_id: str
    original_filename: str
    normalized_filename: str
    mime_type: str
    detected_content_type: Optional[str] = None
    file_size: int
    sha256_checksum: str
    storage_provider: str
    storage_key: str
    retention_state: str
    created_at: datetime
    extractions: List[EvidenceExtractionDTO] = []

    class Config:
        from_attributes = True

class EvidenceDetailDTO(EvidenceSummaryDTO):
    provenance: Optional[EvidenceProvenanceDTO] = None
    claims: List[EvidenceClaimDTO] = []
    competency_mappings: List[EvidenceCompetencyMappingDTO] = []
    skill_mappings: List[EvidenceSkillMappingDTO] = []
    verifications: List[EvidenceVerificationDTO] = []
    artifacts: List[EvidenceArtifactDTO] = []

    class Config:
        from_attributes = True

class EvidenceVerifyRequestDTO(BaseModel):
    evidence_id: str
    status: VerificationStatus
    remarks: Optional[str] = None
    verifier_id: Optional[str] = None
    verifier_role: str = "faculty"

class EvidenceVerifyResponseDTO(BaseModel):
    id: str
    verification_status: str
    trust_score: float
    remarks: Optional[str] = None
    attestation_digest: Optional[str] = None
    verified_at: datetime
