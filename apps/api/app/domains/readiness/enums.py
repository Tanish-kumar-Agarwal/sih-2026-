from enum import Enum

class CompetencyState(str, Enum):
    """
    Canonical status of a student's competency evaluation.
    Answers: What is the current status of this competency evaluation?
    NOTE: CompetencyState != ReadinessState.
    """
    NOT_ASSESSED = "NOT_ASSESSED"
    DEVELOPING = "DEVELOPING"
    EMERGING = "EMERGING"
    ESTABLISHED = "ESTABLISHED"

class ReadinessState(str, Enum):
    """
    Canonical status of a student's preparedness against a target requirement.
    Answers: How prepared is this student for Target X (Role, Opportunity, Blueprint)?
    NOTE: Readiness requires a target context.
    """
    NOT_ASSESSED = "NOT_ASSESSED"
    DEVELOPING = "DEVELOPING"
    EMERGING = "EMERGING"
    NEAR_READY = "NEAR_READY"
    READY = "READY"

class TargetContextType(str, Enum):
    """
    Type of target for readiness evaluation.
    """
    ROLE = "ROLE"
    OPPORTUNITY = "OPPORTUNITY"
    BLUEPRINT = "BLUEPRINT"

class EvidenceStrengthLevel(str, Enum):
    """
    Categorical strength/weight of supporting evidence for a competency.
    NOTE: Evidence strength != Proficiency != Confidence.
    """
    NONE = "NONE"
    WEAK = "WEAK"
    MODERATE = "MODERATE"
    STRONG = "STRONG"
    VERY_STRONG = "VERY_STRONG"
