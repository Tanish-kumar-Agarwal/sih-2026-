from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from app.domains.readiness.enums import CompetencyState, ReadinessState, TargetContextType, EvidenceStrengthLevel
from app.domains.competencies.taxonomy_constants import ProficiencyLevel

class CompetencyReference(BaseModel):
    id: str
    name: str
    code: str
    category: Optional[str] = None

class StudentCompetencyStateResponse(BaseModel):
    id: str
    student_id: str
    competency_id: str
    competency: Optional[CompetencyReference] = None
    proficiency_level: ProficiencyLevel
    proficiency_score: float = Field(..., ge=0.0, le=100.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    state: CompetencyState
    evidence_count: int = Field(default=0, ge=0)
    verified_evidence_count: int = Field(default=0, ge=0)
    evidence_strength: Optional[EvidenceStrengthLevel] = None
    assessment_signal: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    experience_signal: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    is_verified: bool = False
    algorithm_version: str
    taxonomy_version: str
    provenance: Dict[str, Any] = Field(default_factory=dict)
    last_evaluated_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StudentCompetencyStateHistoryResponse(BaseModel):
    id: str
    student_id: str
    competency_id: str
    proficiency_level: ProficiencyLevel
    proficiency_score: float
    confidence: float
    state: CompetencyState
    evidence_count: int
    verified_evidence_count: int
    evidence_strength: Optional[EvidenceStrengthLevel] = None
    assessment_signal: Optional[float] = None
    experience_signal: Optional[float] = None
    algorithm_version: str
    taxonomy_version: str
    provenance: Dict[str, Any] = Field(default_factory=dict)
    recorded_at: datetime

    class Config:
        from_attributes = True

class StudentCompetencyStateListResponse(BaseModel):
    student_id: str
    total: int
    items: List[StudentCompetencyStateResponse]

class RequirementEvaluationResponse(BaseModel):
    competency_id: str
    competency_name: str
    requirement_type: str
    required_proficiency: str
    student_proficiency: Optional[str] = None
    student_score: float = 0.0
    score_gap: float = 0.0
    coverage_status: str
    is_satisfied: bool
    is_critical_blocker: bool
    blocker_reason: Optional[str] = None

class StudentReadinessStateResponse(BaseModel):
    id: str
    student_id: str
    target_type: TargetContextType
    target_id: str
    target_title: Optional[str] = None
    readiness_state: ReadinessState
    readiness_score: float = Field(..., ge=0.0, le=100.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    missing_competencies_count: int = Field(default=0, ge=0)
    satisfied_competencies_count: int = Field(default=0, ge=0)
    total_required_count: int = Field(default=0, ge=0)
    algorithm_version: str
    summary: Optional[str] = None
    strengths: List[Dict[str, Any]] = Field(default_factory=list)
    gaps: List[Dict[str, Any]] = Field(default_factory=list)
    critical_blockers: List[Dict[str, Any]] = Field(default_factory=list)
    requirements: List[Dict[str, Any]] = Field(default_factory=list)
    provenance: Dict[str, Any] = Field(default_factory=dict)
    calculated_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StudentReadinessStateListResponse(BaseModel):
    student_id: str
    total: int
    items: List[StudentReadinessStateResponse]

