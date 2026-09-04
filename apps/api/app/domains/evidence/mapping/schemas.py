from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.domains.evidence.mapping.enums import MappingStatus, MappingMethod, EvidenceStrength

class EvidenceCompetencyMappingResponse(BaseModel):
    id: str
    evidence_id: str
    competency_id: str
    competency_name: str
    competency_slug: str
    competency_category: Optional[str] = None
    skill_id: Optional[str] = None
    skill_name: Optional[str] = None
    claim_id: Optional[str] = None
    mapping_status: MappingStatus
    mapping_method: MappingMethod
    confidence: float
    confidence_reason: Optional[str] = None
    evidence_strength: EvidenceStrength
    source_location: Optional[str] = None
    algorithm_version: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    review_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MappingVerifyRequest(BaseModel):
    status: MappingStatus = Field(description="CONFIRMED, REJECTED, or CANDIDATE")
    review_reason: str = Field(min_length=3, description="Auditable justification for the decision")

class MappingVerifyResponse(BaseModel):
    success: bool
    mapping_id: str
    evidence_id: str
    competency_id: str
    new_status: MappingStatus
    reviewed_by: str
    reviewed_at: datetime
    review_reason: str

class CompetencyEvidenceItemDTO(BaseModel):
    mapping_id: str
    evidence_id: str
    evidence_title: str
    evidence_type: str
    source_type: str
    uri: Optional[str] = None
    verification_status: str
    mapping_status: MappingStatus
    mapping_method: MappingMethod
    confidence: float
    confidence_reason: Optional[str] = None
    evidence_strength: EvidenceStrength
    source_location: Optional[str] = None
    skill_name: Optional[str] = None
    created_at: datetime

class CompetencyEvidenceProfileResponse(BaseModel):
    competency_id: str
    competency_name: str
    competency_slug: str
    competency_category: Optional[str] = None
    mapped_evidence_count: int
    verified_evidence_count: int
    strongest_evidence: Optional[EvidenceStrength] = None
    max_mapping_confidence: float
    evidence_items: List[CompetencyEvidenceItemDTO]

class EvidenceMappingTriggerResponse(BaseModel):
    success: bool
    evidence_id: str
    discovered_facts_count: int
    created_mappings_count: int
    mappings: List[EvidenceCompetencyMappingResponse]
