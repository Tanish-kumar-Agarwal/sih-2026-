from enum import Enum
from typing import Dict, Any

class ProficiencyLevel(str, Enum):
    FOUNDATIONAL = "FOUNDATIONAL"
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    EXPERT = "EXPERT"

# Normalized numeric scale (1 to 5) and baseline percentage score equivalents
PROFICIENCY_NUMERIC_MAP: Dict[ProficiencyLevel, int] = {
    ProficiencyLevel.FOUNDATIONAL: 1,
    ProficiencyLevel.BEGINNER: 2,
    ProficiencyLevel.INTERMEDIATE: 3,
    ProficiencyLevel.ADVANCED: 4,
    ProficiencyLevel.EXPERT: 5,
}

PROFICIENCY_SCORE_THRESHOLDS: Dict[ProficiencyLevel, float] = {
    ProficiencyLevel.FOUNDATIONAL: 40.0,
    ProficiencyLevel.BEGINNER: 60.0,
    ProficiencyLevel.INTERMEDIATE: 75.0,
    ProficiencyLevel.ADVANCED: 85.0,
    ProficiencyLevel.EXPERT: 95.0,
}

def score_to_proficiency(score: float) -> ProficiencyLevel:
    """Derive canonical proficiency level from score (0 - 100)."""
    if score >= 90.0:
        return ProficiencyLevel.EXPERT
    elif score >= 80.0:
        return ProficiencyLevel.ADVANCED
    elif score >= 65.0:
        return ProficiencyLevel.INTERMEDIATE
    elif score >= 50.0:
        return ProficiencyLevel.BEGINNER
    return ProficiencyLevel.FOUNDATIONAL

class RequirementType(str, Enum):
    MUST_HAVE = "MUST_HAVE"
    SHOULD_HAVE = "SHOULD_HAVE"
    OPTIONAL = "OPTIONAL"

class CompetencyRelationType(str, Enum):
    PREREQUISITE_FOR = "PREREQUISITE_FOR"
    SPECIALIZATION_OF = "SPECIALIZATION_OF"
    COMPLEMENTS = "COMPLEMENTS"
    DERIVED_FROM = "DERIVED_FROM"

class TaxonomyStatus(str, Enum):
    ACTIVE = "ACTIVE"
    DEPRECATED = "DEPRECATED"
    DRAFT = "DRAFT"

class TaxonomySourceType(str, Enum):
    SYSTEM = "SYSTEM"
    NCVET = "NCVET"
    AYUSH_MINISTRY = "AYUSH_MINISTRY"
    INDUSTRY_STANDARD = "INDUSTRY_STANDARD"
    MANUAL_CURATED = "MANUAL_CURATED"
