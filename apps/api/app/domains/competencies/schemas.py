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
