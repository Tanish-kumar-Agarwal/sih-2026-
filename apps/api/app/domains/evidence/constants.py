from enum import Enum
from typing import Dict, Set

class EvidenceType(str, Enum):
    PROJECT = "PROJECT"
    INTERNSHIP = "INTERNSHIP"
    CERTIFICATION = "CERTIFICATION"
    COURSE = "COURSE"
    PUBLICATION = "PUBLICATION"
    COMPETITION = "COMPETITION"
    ASSESSMENT = "ASSESSMENT"
    PORTFOLIO = "PORTFOLIO"
    WORK_SAMPLE = "WORK_SAMPLE"
    EXPERIENCE = "EXPERIENCE"
    OTHER = "OTHER"

class EvidenceSourceType(str, Enum):
    DOCUMENT = "DOCUMENT"
    URL = "URL"
    REPOSITORY = "REPOSITORY"
    ASSESSMENT = "ASSESSMENT"
    EXPERIENCE = "EXPERIENCE"
    INSTITUTION = "INSTITUTION"
    EMPLOYER = "EMPLOYER"
    SYSTEM = "SYSTEM"

class ProcessingStatus(str, Enum):
    UPLOADED = "UPLOADED"
    STORED = "STORED"
    PROCESSING = "PROCESSING"
    EXTRACTED = "EXTRACTED"
    ANALYZED = "ANALYZED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class VerificationStatus(str, Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"

class EvidenceStrength(str, Enum):
    WEAK = "WEAK"
    MODERATE = "MODERATE"
    STRONG = "STRONG"
    VERY_STRONG = "VERY_STRONG"

class ClaimType(str, Enum):
    SKILL_DEMONSTRATION = "SKILL_DEMONSTRATION"
    CONTRIBUTION_ACTIVITY = "CONTRIBUTION_ACTIVITY"
    ROLE_EXPERIENCE = "ROLE_EXPERIENCE"
    COMPETENCY_INDICATOR = "COMPETENCY_INDICATOR"
    FACT_OBSERVATION = "FACT_OBSERVATION"

# Formal Verification State Machine Legal Transitions
VERIFICATION_TRANSITIONS: Dict[str, Set[str]] = {
    VerificationStatus.PENDING.value: {
        VerificationStatus.VERIFIED.value,
        VerificationStatus.REJECTED.value
    },
    VerificationStatus.VERIFIED.value: {
        VerificationStatus.EXPIRED.value,
        VerificationStatus.REVOKED.value
    },
    VerificationStatus.REJECTED.value: {
        VerificationStatus.PENDING.value  # allowed to resubmit
    },
    VerificationStatus.EXPIRED.value: {
        VerificationStatus.PENDING.value  # renew
    },
    VerificationStatus.REVOKED.value: set()  # Terminal state
}

def is_valid_verification_transition(current_status: str, next_status: str) -> bool:
    """Validates legal state machine transitions for evidence verification."""
    allowed = VERIFICATION_TRANSITIONS.get(current_status, set())
    return next_status in allowed
