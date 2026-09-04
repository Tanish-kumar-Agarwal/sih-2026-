import math
import hashlib
from typing import List, Dict, Any, Optional, Tuple, Set
from datetime import datetime, timezone
from dataclasses import dataclass

from app.domains.evidence.mapping.enums import MappingStatus, MappingMethod, EvidenceStrength
from app.domains.readiness.enums import CompetencyState, EvidenceStrengthLevel
from app.domains.competencies.taxonomy_constants import ProficiencyLevel, score_to_proficiency

# Canonical base score equivalents for qualitative Evidence Strength
STRENGTH_BASE_SCORES: Dict[str, float] = {
    "WEAK": 45.0,
    "MODERATE": 65.0,
    "STRONG": 82.0,
    "VERY_STRONG": 95.0,
}

# Verification multipliers
VERIFICATION_FACTORS: Dict[str, float] = {
    "VERIFIED": 1.0,
    "PENDING": 0.5,
    "REJECTED": 0.0,
    "EXPIRED": 0.0,
    "REVOKED": 0.0,
}

# Mapping status eligibility and factor
MAPPING_STATUS_FACTORS: Dict[str, float] = {
    "CONFIRMED": 1.0,
    "PROPOSED": 0.8,
    "CANDIDATE": 0.6,
    "REJECTED": 0.0,
    "SUPERSEDED": 0.0,
}

@dataclass
class EvidenceInputItem:
    mapping_id: str
    evidence_id: str
    evidence_type: str
    source_type: str
    source_uri: Optional[str]
    sha256_checksum: Optional[str]
    mapping_status: str
    mapping_method: str
    mapping_confidence: float
    evidence_strength: str
    verification_status: str
    created_at: datetime
    student_commits_count: Optional[int] = None
    contribution_ratio: Optional[float] = None

@dataclass
class AssessmentInputItem:
    assessment_id: str
    score: float  # 0 - 100
    passed: bool
    integrity_score: float  # 0.0 - 1.0
    completed_at: datetime

@dataclass
class ExperienceInputItem:
    experience_id: str
    experience_type: str  # INTERNSHIP, PROJECT
    title: str
    is_verified: bool
    duration_months: float

@dataclass
class AggregationResult:
    proficiency_score: float
    proficiency_level: ProficiencyLevel
    confidence: float
    state: CompetencyState
    evidence_count: int
    verified_evidence_count: int
    evidence_strength: Optional[EvidenceStrengthLevel]
    assessment_signal: Optional[float]
    experience_signal: Optional[float]
    is_verified: bool
    algorithm_version: str
    taxonomy_version: str
    provenance: Dict[str, Any]

class ProficiencyAggregationEngine:
    """
    Production-grade deterministic evidence & proficiency aggregation engine.
    Computes canonical proficiency, confidence, and state without score theatre.
    """
    ALGORITHM_VERSION = "v1.1.0"
    TAXONOMY_VERSION = "v1.0.0"

    @classmethod
    def aggregate(
        cls,
        evidence_items: List[EvidenceInputItem],
        assessment_items: Optional[List[AssessmentInputItem]] = None,
        experience_items: Optional[List[ExperienceInputItem]] = None,
        reference_time: Optional[datetime] = None
    ) -> AggregationResult:
        now = reference_time or datetime.now(timezone.utc)
        assessment_items = assessment_items or []
        experience_items = experience_items or []

        # 1. Eligibility Filtering
        eligible_evidence: List[EvidenceInputItem] = []
        for e in evidence_items:
            m_factor = MAPPING_STATUS_FACTORS.get(e.mapping_status.upper(), 0.0)
            v_factor = VERIFICATION_FACTORS.get(e.verification_status.upper(), 0.0)
            # Both mapping and verification must have non-zero factors to contribute
            if m_factor > 0.0 and v_factor > 0.0:
                eligible_evidence.append(e)

        # Count total and verified eligible evidence
        total_evidence_count = len(eligible_evidence)
        verified_evidence_count = sum(
            1 for e in eligible_evidence 
            if e.verification_status.upper() == "VERIFIED" or e.mapping_status.upper() == "CONFIRMED"
        )

        # Handle zero eligible evidence and zero assessments
        if not eligible_evidence and not assessment_items and not experience_items:
            return AggregationResult(
                proficiency_score=0.0,
                proficiency_level=ProficiencyLevel.FOUNDATIONAL,
                confidence=0.0,
                state=CompetencyState.NOT_ASSESSED,
                evidence_count=0,
                verified_evidence_count=0,
                evidence_strength=None,
                assessment_signal=None,
                experience_signal=None,
                is_verified=False,
                algorithm_version=cls.ALGORITHM_VERSION,
                taxonomy_version=cls.TAXONOMY_VERSION,
                provenance={
                    "status": "NOT_ASSESSED",
                    "reason": "No eligible evidence, assessments, or experience records found.",
                    "total_raw_evidence_inspected": len(evidence_items)
                }
            )

        # 2. Deduplication & Source Independence Clustering
        # Cluster by artifact checksum or source URI to prevent double counting
        source_clusters: Dict[str, List[EvidenceInputItem]] = {}
        for e in eligible_evidence:
            cluster_key = e.sha256_checksum or e.source_uri or e.evidence_id
            source_clusters.setdefault(cluster_key, []).append(e)

        unique_sources_count = len(source_clusters)

        # 3. Evidence Score Aggregation
        cluster_contributions: List[Dict[str, Any]] = []
        strongest_level = None
        strength_order = ["NONE", "WEAK", "MODERATE", "STRONG", "VERY_STRONG"]

        for cluster_key, items in source_clusters.items():
            # In each cluster of identical/correlated artifacts, take the highest quality mapping
            best_item = max(
                items,
                key=lambda x: (
                    STRENGTH_BASE_SCORES.get(x.evidence_strength.upper(), 50.0) *
                    x.mapping_confidence *
                    VERIFICATION_FACTORS.get(x.verification_status.upper(), 0.5)
                )
            )

            # Strength level tracking
            curr_str = best_item.evidence_strength.upper()
            if curr_str in strength_order:
                if strongest_level is None or strength_order.index(curr_str) > strength_order.index(strongest_level):
                    strongest_level = curr_str

            base_score = STRENGTH_BASE_SCORES.get(curr_str, 50.0)
            m_factor = MAPPING_STATUS_FACTORS.get(best_item.mapping_status.upper(), 0.7)
            v_factor = VERIFICATION_FACTORS.get(best_item.verification_status.upper(), 0.5)
            mapping_conf = max(0.1, min(1.0, best_item.mapping_confidence))

            # Freshness / Recency decay (half-life of 24 months, floor at 0.6)
            age_days = max(0, (now - best_item.created_at).days)
            age_months = age_days / 30.4375
            recency_factor = max(0.6, math.exp(-0.02 * max(0.0, age_months - 6.0)))

            # Student contribution attribution factor (e.g. for GitHub)
            attribution_factor = 1.0
            if best_item.contribution_ratio is not None:
                # If student contribution is measured, scale between 0.6 and 1.0
                attribution_factor = max(0.6, min(1.0, 0.6 + 0.4 * best_item.contribution_ratio))

            effective_weight = m_factor * v_factor * mapping_conf * recency_factor * attribution_factor
            cluster_contributions.append({
                "cluster_key": cluster_key,
                "evidence_id": best_item.evidence_id,
                "base_score": base_score,
                "weight": effective_weight,
                "is_verified": best_item.verification_status.upper() == "VERIFIED"
            })

        # Calculate weighted evidence proficiency
        evidence_score: Optional[float] = None
        if cluster_contributions:
            total_weight = sum(c["weight"] for c in cluster_contributions)
            if total_weight > 0:
                weighted_sum = sum(c["base_score"] * c["weight"] for c in cluster_contributions)
                # Diminishing returns slight bonus for independent multi-source verification (+1.5 per extra source up to +6)
                diversity_bonus = min(6.0, max(0.0, (unique_sources_count - 1) * 1.5))
                evidence_score = min(100.0, (weighted_sum / total_weight) + diversity_bonus)

        # 4. Assessment Signal Processing
        assessment_signal: Optional[float] = None
        if assessment_items:
            # Take latest assessment result, weighted by integrity score
            latest_assessment = max(assessment_items, key=lambda a: a.completed_at)
            integrity = max(0.5, min(1.0, latest_assessment.integrity_score))
            raw_score = max(0.0, min(100.0, latest_assessment.score))
            assessment_signal = raw_score * integrity

        # 5. Experience Signal Processing
        experience_signal: Optional[float] = None
        if experience_items:
            # Experience duration scaled logarithmically (e.g., 6 months = strong reinforcement)
            total_months = sum(e.duration_months for e in experience_items)
            verified_exp = any(e.is_verified for e in experience_items)
            # Duration score from 50 to 90
            duration_score = min(90.0, 50.0 + 15.0 * math.log1p(total_months))
            if verified_exp:
                duration_score = min(95.0, duration_score + 5.0)
            experience_signal = duration_score

        # 6. Signal Fusion / Conflict Resolution
        # Combine evidence, assessment, and experience without overwriting
        signals_to_combine = []
        signal_weights = []

        if evidence_score is not None:
            # Evidence weight scales with unique sources (e.g., 1 source = 1.0, 3 sources = 1.5)
            e_weight = 1.0 + 0.25 * min(4, unique_sources_count)
            signals_to_combine.append(evidence_score)
            signal_weights.append(e_weight)

        if assessment_signal is not None:
            # Assessment has authoritative direct testing weight
            signals_to_combine.append(assessment_signal)
            signal_weights.append(1.2)

        if experience_signal is not None:
            signals_to_combine.append(experience_signal)
            signal_weights.append(0.8)

        if signals_to_combine:
            final_score = sum(s * w for s, w in zip(signals_to_combine, signal_weights)) / sum(signal_weights)
            final_score = round(max(0.0, min(100.0, final_score)), 2)
        else:
            final_score = 0.0

        # Derive canonical proficiency level from normalized score
        proficiency_level = score_to_proficiency(final_score)

        # 7. Confidence Estimation (Separate from Proficiency!)
        # Confidence answers: How certain is the system in this estimate?
        # Inputs: source diversity, verification ratio, mapping confidence, signal agreement
        source_factor = 1.0 - math.exp(-0.8 * unique_sources_count)  # 1 src ~ 0.55, 2 ~ 0.80, 3 ~ 0.91, 4+ ~ 0.96
        verif_ratio = (verified_evidence_count / total_evidence_count) if total_evidence_count > 0 else 0.5
        verif_factor = 0.6 + 0.4 * verif_ratio

        avg_mapping_conf = 0.8
        if eligible_evidence:
            avg_mapping_conf = sum(e.mapping_confidence for e in eligible_evidence) / len(eligible_evidence)

        # Signal convergence (agreement between assessment and evidence if both present)
        convergence_factor = 1.0
        if evidence_score is not None and assessment_signal is not None:
            delta = abs(evidence_score - assessment_signal)
            if delta > 30.0:  # High conflict
                convergence_factor = 0.75
            elif delta > 15.0:
                convergence_factor = 0.88

        calculated_confidence = round(
            max(0.1, min(0.98, source_factor * verif_factor * avg_mapping_conf * convergence_factor)),
            2
        )

        # 8. Competency State Determination
        # NOT_ASSESSED, DEVELOPING, EMERGING, ESTABLISHED
        if total_evidence_count == 0 and assessment_signal is None and experience_signal is None:
            competency_state = CompetencyState.NOT_ASSESSED
        elif final_score >= 70.0 and (verified_evidence_count >= 1 or any(e.is_verified for e in experience_items)) and calculated_confidence >= 0.7:
            competency_state = CompetencyState.ESTABLISHED
        elif final_score >= 50.0 and (total_evidence_count >= 1 or experience_signal is not None):
            competency_state = CompetencyState.EMERGING
        else:
            competency_state = CompetencyState.DEVELOPING

        ev_strength_enum = None
        if strongest_level:
            try:
                ev_strength_enum = EvidenceStrengthLevel(strongest_level)
            except ValueError:
                ev_strength_enum = EvidenceStrengthLevel.MODERATE

        is_verified_state = (
            verified_evidence_count > 0 
            or (assessment_signal is not None and assessment_signal >= 70.0)
            or any(e.is_verified for e in experience_items)
        )

        provenance_metadata = {
            "algorithm_version": cls.ALGORITHM_VERSION,
            "taxonomy_version": cls.TAXONOMY_VERSION,
            "evaluated_at": now.isoformat(),
            "eligible_evidence_count": total_evidence_count,
            "verified_evidence_count": verified_evidence_count,
            "unique_sources_count": unique_sources_count,
            "evidence_score": round(evidence_score, 2) if evidence_score is not None else None,
            "assessment_signal": round(assessment_signal, 2) if assessment_signal is not None else None,
            "experience_signal": round(experience_signal, 2) if experience_signal is not None else None,
            "confidence_factors": {
                "source_factor": round(source_factor, 2),
                "verif_factor": round(verif_factor, 2),
                "avg_mapping_conf": round(avg_mapping_conf, 2),
                "convergence_factor": round(convergence_factor, 2)
            }
        }

        return AggregationResult(
            proficiency_score=final_score,
            proficiency_level=proficiency_level,
            confidence=calculated_confidence,
            state=competency_state,
            evidence_count=total_evidence_count,
            verified_evidence_count=verified_evidence_count,
            evidence_strength=ev_strength_enum,
            assessment_signal=round(assessment_signal, 2) if assessment_signal is not None else None,
            experience_signal=round(experience_signal, 2) if experience_signal is not None else None,
            is_verified=is_verified_state,
            algorithm_version=cls.ALGORITHM_VERSION,
            taxonomy_version=cls.TAXONOMY_VERSION,
            provenance=provenance_metadata
        )
