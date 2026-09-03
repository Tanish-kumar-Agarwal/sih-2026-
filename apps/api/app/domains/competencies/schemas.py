from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel, ConfigDict
from app.domains.competencies.taxonomy_constants import ProficiencyLevel, RequirementType, CompetencyRelationType, TaxonomyStatus

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    limit: int
    offset: int

class DomainDTO(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str] = None
    status: str = "ACTIVE"

    model_config = ConfigDict(from_attributes=True)

class CategoryDTO(BaseModel):
    id: str
    domain_id: str
    domain_code: Optional[str] = None
    code: str
    name: str
    slug: str
    description: Optional[str] = None
    status: str = "ACTIVE"

    model_config = ConfigDict(from_attributes=True)

class SkillDTO(BaseModel):
    id: str
    domain_id: Optional[str] = None
    name: str
    slug: str
    description: Optional[str] = None
    status: str = "ACTIVE"
    is_primary: bool = True
    relevance_weight: float = 1.0

    model_config = ConfigDict(from_attributes=True)

class CompetencyRelationshipDTO(BaseModel):
    id: str
    target_competency_id: str
    target_competency_name: str
    target_competency_code: str
    relationship_type: str
    weight: float = 1.0

class CompetencySummaryDTO(BaseModel):
    id: str
    code: str
    name: str
    slug: Optional[str] = None
    domain_id: Optional[str] = None
    domain_code: Optional[str] = None
    category_id: Optional[str] = None
    category: Optional[str] = None
    difficulty_level: str = "Intermediate"
    description: Optional[str] = None
    status: str = "ACTIVE"
    skills_count: int = 0
    created_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CompetencyDetailDTO(CompetencySummaryDTO):
    skills: List[SkillDTO] = []
    prerequisites: List[CompetencyRelationshipDTO] = []
    complements: List[CompetencyRelationshipDTO] = []
    source_type: str = "SYSTEM"
    source_reference: Optional[str] = None

class RoleRequirementDTO(BaseModel):
    id: str
    competency_id: str
    competency_code: str
    competency_name: str
    competency_category: Optional[str] = None
    required_proficiency: str
    requirement_type: str
    weight: float = 1.0
    notes: Optional[str] = None

class RoleCatalogDTO(BaseModel):
    id: str
    title: str
    slug: Optional[str] = None
    code: str
    domain: str
    domain_id: Optional[str] = None
    description: Optional[str] = None
    status: str = "ACTIVE"
    requirements: List[RoleRequirementDTO] = []

    model_config = ConfigDict(from_attributes=True)

# ------------------------------------------------------------------------------
# Normalization, Alias Resolution & Proficiency Aggregation Contracts
# ------------------------------------------------------------------------------

class SkillResolutionRequest(BaseModel):
    skill: str

class SkillResolutionBatchRequest(BaseModel):
    skills: List[str]

class ResolvedSkillDTO(BaseModel):
    id: str
    name: str
    slug: str
    domain_id: Optional[str] = None
    domain_code: Optional[str] = None
    status: str = "ACTIVE"

class SkillResolutionCandidateDTO(BaseModel):
    id: str
    name: str
    slug: str

class SkillResolutionItemDTO(BaseModel):
    input: str
    normalized_input: str
    status: str  # RESOLVED, UNRESOLVED, AMBIGUOUS
    match_type: str  # CANONICAL_EXACT, CANONICAL_SLUG, CANONICAL_NORMALIZED, ALIAS_EXACT, ALIAS_NORMALIZED, UNRESOLVED
    skill: Optional[ResolvedSkillDTO] = None
    candidates: Optional[List[SkillResolutionCandidateDTO]] = None

class SkillResolutionBatchResponseDTO(BaseModel):
    items: List[SkillResolutionItemDTO]
    total: int
    resolved_count: int
    unresolved_count: int
    ambiguous_count: int

class SkillProficiencyInputDTO(BaseModel):
    skill: str
    score: Optional[float] = None
    proficiency_level: Optional[str] = None
    source: Optional[str] = "SELF_REPORTED"

class CompetencyAggregationRequestDTO(BaseModel):
    skills: List[SkillProficiencyInputDTO]

class ContributingSkillDTO(BaseModel):
    skill_id: str
    skill_name: str
    skill_slug: str
    score: float
    level: str
    relevance_weight: float
    is_primary: bool
    source: str

class AggregatedCompetencyDTO(BaseModel):
    competency_id: str
    competency_name: str
    competency_code: str
    competency_slug: Optional[str] = None
    category: Optional[str] = None
    difficulty_level: str
    aggregated_score: float
    proficiency_level: str
    proficiency_numeric: int
    primary_skills_covered: int
    total_skills_contributing: int
    dominant_source: str
    contributing_skills: List[ContributingSkillDTO]

class CompetencyAggregationResponseDTO(BaseModel):
    competencies: List[AggregatedCompetencyDTO]
    unresolved_skills: List[str]
    total_skills_evaluated: int

# ------------------------------------------------------------------------------
# Student Competency & Graph Contracts (Step 3)
# ------------------------------------------------------------------------------

class StudentCompetencySummaryDTO(BaseModel):
    id: str
    competency_id: str
    competency_name: str
    competency_code: str
    competency_slug: Optional[str] = None
    category: Optional[str] = None
    domain_code: Optional[str] = None
    difficulty_level: str
    proficiency_level: str
    proficiency_numeric: int
    score: float
    confidence_score: float
    is_verified: bool
    verified_at: Optional[str] = None
    supporting_skills_count: int = 0
    updated_at: Optional[str] = None

class StudentCompetencyDetailDTO(StudentCompetencySummaryDTO):
    description: Optional[str] = None
    supporting_skills: List[SkillDTO] = []
    prerequisites: List[CompetencyRelationshipDTO] = []
    complements: List[CompetencyRelationshipDTO] = []
    demonstrated_in_projects: List[str] = []

class StudentCompetenciesPaginatedDTO(BaseModel):
    items: List[StudentCompetencySummaryDTO]
    total: int
    page: int
    page_size: int
    total_pages: int

class StudentCompetencyDeriveRequestDTO(BaseModel):
    skills: Optional[List[SkillProficiencyInputDTO]] = None
    include_projects: bool = True

class StudentCompetencyDeriveResponseDTO(BaseModel):
    student_id: str
    derived_count: int
    updated_count: int
    total_competencies: int
    competencies: List[StudentCompetencySummaryDTO]
    unresolved_skills: List[str] = []

class CompetencyGraphNodeDTO(BaseModel):
    id: str
    label: str
    name: str
    type: str  # "domain", "competency", "skill"
    category: Optional[str] = None
    proficiency: Optional[str] = None
    score: Optional[float] = None
    is_verified: Optional[bool] = None

class CompetencyGraphEdgeDTO(BaseModel):
    id: str
    source: str
    target: str
    relationship: str  # "BELONGS_TO", "HAS_SKILL", "PREREQUISITE_FOR", "COMPLEMENTS"
    weight: float = 1.0

class CompetencyGraphResponseDTO(BaseModel):
    nodes: List[CompetencyGraphNodeDTO]
    edges: List[CompetencyGraphEdgeDTO]
    total_nodes: int
    total_edges: int


