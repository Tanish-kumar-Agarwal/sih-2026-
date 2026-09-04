from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from dataclasses import dataclass, field
import math

from app.domains.readiness.enums import ReadinessState, CompetencyState
from app.domains.competencies.taxonomy_constants import (
    ProficiencyLevel,
    RequirementType,
    PROFICIENCY_NUMERIC_MAP,
)

# Canonical benchmark scores required to satisfy each proficiency tier
PROFICIENCY_TARGET_BENCHMARKS: Dict[str, float] = {
    "FOUNDATIONAL": 40.0,
    "BEGINNER": 55.0,
    "INTERMEDIATE": 70.0,
    "ADVANCED": 82.0,
    "EXPERT": 92.0,
}

CRITICALITY_WEIGHT_MULTIPLIERS: Dict[str, float] = {
    "MUST_HAVE": 1.5,
    "SHOULD_HAVE": 1.0,
    "OPTIONAL": 0.5,
}

@dataclass
class TargetRequirementInput:
    competency_id: str
    competency_name: str
    required_proficiency: str  # FOUNDATIONAL, BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    requirement_type: str      # MUST_HAVE, SHOULD_HAVE, OPTIONAL
    weight: float = 1.0
    notes: Optional[str] = None

@dataclass
class StudentCompetencyInput:
    competency_id: str
    proficiency_level: str
    proficiency_score: float   # 0.0 - 100.0
    confidence: float          # 0.0 - 1.0
    evidence_count: int = 0
    verified_evidence_count: int = 0
    state: str = "NOT_ASSESSED"

@dataclass
class RequirementEvaluationResult:
    competency_id: str
    competency_name: str
    requirement_type: str
    required_proficiency: str
    required_score: float
    student_proficiency: Optional[str]
    student_score: float
    student_confidence: float
    coverage_status: str       # MISSING, INSUFFICIENT, PARTIAL, MEETS, EXCEEDS
    level_gap: int
    score_gap: float
    is_satisfied: bool
    is_critical_blocker: bool
    blocker_reason: Optional[str] = None

@dataclass
class ReadinessEvaluationResult:
    target_id: str
    target_type: str
    target_title: str
    readiness_state: ReadinessState
    readiness_score: float
    confidence: float
    missing_competencies_count: int
    satisfied_competencies_count: int
    total_required_count: int
    strengths: List[Dict[str, Any]]
    gaps: List[Dict[str, Any]]
    critical_blockers: List[Dict[str, Any]]
    requirements: List[RequirementEvaluationResult]
    summary: str
    algorithm_version: str
    taxonomy_version: str
    provenance: Dict[str, Any]

class ReadinessEngine:
    """
    Production-grade deterministic Readiness, Gap Analysis & Explainability Engine.
    Evaluates student competencies against canonical target requirements.
    Strictly enforces Mandatory Gating, evidence-aware confidence, and explainability.
    """
    ALGORITHM_VERSION = "v1.2.0"
    TAXONOMY_VERSION = "v1.0.0"

    @classmethod
    def evaluate(
        cls,
        target_id: str,
        target_type: str,
        target_title: str,
        requirements: List[TargetRequirementInput],
        student_states: Dict[str, StudentCompetencyInput],
        reference_time: Optional[datetime] = None
    ) -> ReadinessEvaluationResult:
        now = reference_time or datetime.now(timezone.utc)
        total_required = len(requirements)

        # Handle target with zero requirements
        if total_required == 0:
            return ReadinessEvaluationResult(
                target_id=target_id,
                target_type=target_type,
                target_title=target_title,
                readiness_state=ReadinessState.NOT_ASSESSED,
                readiness_score=0.0,
                confidence=0.0,
                missing_competencies_count=0,
                satisfied_competencies_count=0,
                total_required_count=0,
                strengths=[],
                gaps=[],
                critical_blockers=[],
                requirements=[],
                summary=f"No competency requirements defined for target '{target_title}'.",
                algorithm_version=cls.ALGORITHM_VERSION,
                taxonomy_version=cls.TAXONOMY_VERSION,
                provenance={
                    "status": "NO_REQUIREMENTS",
                    "reason": "Target context has no requirements configured.",
                    "evaluated_at": now.isoformat(),
                }
            )

        evaluated_reqs: List[RequirementEvaluationResult] = []
        strengths: List[Dict[str, Any]] = []
        gaps: List[Dict[str, Any]] = []
        critical_blockers: List[Dict[str, Any]] = []

        total_weight = 0.0
        weighted_fulfillment_sum = 0.0
        weighted_confidence_sum = 0.0

        missing_count = 0
        satisfied_count = 0
        mandatory_count = 0
        mandatory_satisfied_count = 0
        assessed_competencies_count = 0

        for req in requirements:
            comp_id = req.competency_id
            st_input = student_states.get(comp_id)

            req_prof_str = req.required_proficiency.upper()
            req_type_str = req.requirement_type.upper()
            is_mandatory = (req_type_str == "MUST_HAVE")
            if is_mandatory:
                mandatory_count += 1

            # Required benchmarks
            req_score_target = PROFICIENCY_TARGET_BENCHMARKS.get(req_prof_str, 70.0)
            try:
                req_level_num = PROFICIENCY_NUMERIC_MAP.get(ProficiencyLevel(req_prof_str), 3)
            except (ValueError, KeyError):
                req_level_num = 3

            # Student actuals
            if st_input and st_input.state != "NOT_ASSESSED" and st_input.proficiency_score > 0.0:
                assessed_competencies_count += 1
                st_score = max(0.0, min(100.0, st_input.proficiency_score))
                st_conf = max(0.0, min(1.0, st_input.confidence))
                st_prof_str = st_input.proficiency_level.upper()
                try:
                    st_level_num = PROFICIENCY_NUMERIC_MAP.get(ProficiencyLevel(st_prof_str), 1)
                except (ValueError, KeyError):
                    st_level_num = 1
                has_data = True
            else:
                st_score = 0.0
                st_conf = 0.0
                st_prof_str = "FOUNDATIONAL"
                st_level_num = 0
                has_data = False
                missing_count += 1

            # Gap analysis
            score_gap = round(max(0.0, req_score_target - st_score), 2)
            level_gap = max(0, req_level_num - st_level_num)

            # Coverage status determination
            if not has_data:
                coverage_status = "MISSING"
                is_satisfied = False
            elif score_gap == 0.0 and st_level_num >= req_level_num:
                if st_level_num > req_level_num:
                    coverage_status = "EXCEEDS"
                else:
                    coverage_status = "MEETS"
                is_satisfied = True
                satisfied_count += 1
                if is_mandatory:
                    mandatory_satisfied_count += 1
            elif score_gap <= 10.0 and level_gap <= 1:
                coverage_status = "PARTIAL"
                is_satisfied = False
            else:
                coverage_status = "INSUFFICIENT"
                is_satisfied = False

            # Critical blocker detection
            is_blocker = False
            blocker_reason = None
            if is_mandatory and not is_satisfied:
                is_blocker = True
                if coverage_status == "MISSING":
                    blocker_reason = f"Mandatory competency '{req.competency_name}' has no demonstrated evidence or assessment."
                elif level_gap >= 2:
                    blocker_reason = f"Severe proficiency gap: required {req_prof_str} but current level is {st_prof_str} ({score_gap:.1f} pt deficit)."
                elif score_gap > 5.0:
                    blocker_reason = f"Proficiency deficit of {score_gap:.1f} pts below required {req_prof_str} benchmark ({req_score_target:.0f})."
                else:
                    blocker_reason = f"Mandatory competency is not fully satisfied (requires {req_prof_str})."

                critical_blockers.append({
                    "competency_id": comp_id,
                    "competency_name": req.competency_name,
                    "required_proficiency": req_prof_str,
                    "student_proficiency": st_prof_str if has_data else None,
                    "score_gap": score_gap,
                    "level_gap": level_gap,
                    "reason": blocker_reason,
                    "severity": "CRITICAL",
                })

            # Strength / Gap categorization
            if is_satisfied and has_data:
                strengths.append({
                    "competency_id": comp_id,
                    "competency_name": req.competency_name,
                    "student_proficiency": st_prof_str,
                    "required_proficiency": req_prof_str,
                    "student_score": st_score,
                    "confidence": st_conf,
                    "coverage_status": coverage_status,
                })
            else:
                gaps.append({
                    "competency_id": comp_id,
                    "competency_name": req.competency_name,
                    "required_proficiency": req_prof_str,
                    "student_proficiency": st_prof_str if has_data else "NONE",
                    "requirement_type": req_type_str,
                    "score_gap": score_gap,
                    "level_gap": level_gap,
                    "is_mandatory": is_mandatory,
                    "coverage_status": coverage_status,
                })

            # Weight calculations
            crit_multiplier = CRITICALITY_WEIGHT_MULTIPLIERS.get(req_type_str, 1.0)
            effective_weight = max(0.1, req.weight * crit_multiplier)
            total_weight += effective_weight

            # Satisfaction ratio for score contribution (0.0 to 1.0)
            if req_score_target > 0:
                fulfillment_ratio = min(1.0, st_score / req_score_target)
            else:
                fulfillment_ratio = 1.0

            weighted_fulfillment_sum += effective_weight * fulfillment_ratio

            # Confidence contribution scaled by evidence factor
            ev_factor = 1.0
            if st_input:
                if st_input.verified_evidence_count > 0:
                    ev_factor = 1.0
                elif st_input.evidence_count > 0:
                    ev_factor = 0.85
                else:
                    ev_factor = 0.50
            else:
                ev_factor = 0.0

            weighted_confidence_sum += effective_weight * (st_conf * ev_factor)

            evaluated_reqs.append(
                RequirementEvaluationResult(
                    competency_id=comp_id,
                    competency_name=req.competency_name,
                    requirement_type=req_type_str,
                    required_proficiency=req_prof_str,
                    required_score=req_score_target,
                    student_proficiency=st_prof_str if has_data else None,
                    student_score=st_score,
                    student_confidence=st_conf,
                    coverage_status=coverage_status,
                    level_gap=level_gap,
                    score_gap=score_gap,
                    is_satisfied=is_satisfied,
                    is_critical_blocker=is_blocker,
                    blocker_reason=blocker_reason,
                )
            )

        # Baseline Raw Score (0 - 100)
        if total_weight > 0:
            raw_readiness_score = (weighted_fulfillment_sum / total_weight) * 100.0
            overall_confidence = weighted_confidence_sum / total_weight
        else:
            raw_readiness_score = 0.0
            overall_confidence = 0.0

        # All unassessed check
        if assessed_competencies_count == 0:
            return ReadinessEvaluationResult(
                target_id=target_id,
                target_type=target_type,
                target_title=target_title,
                readiness_state=ReadinessState.NOT_ASSESSED,
                readiness_score=0.0,
                confidence=0.0,
                missing_competencies_count=total_required,
                satisfied_competencies_count=0,
                total_required_count=total_required,
                strengths=[],
                gaps=gaps,
                critical_blockers=critical_blockers,
                requirements=evaluated_reqs,
                summary=f"Student has not yet completed evaluations for requirements of '{target_title}'.",
                algorithm_version=cls.ALGORITHM_VERSION,
                taxonomy_version=cls.TAXONOMY_VERSION,
                provenance={
                    "status": "NOT_ASSESSED",
                    "reason": "Zero evaluated competency data matching target requirements.",
                    "evaluated_at": now.isoformat(),
                }
            )

        # MANDATORY GATING RULE (Core Business Invariant!)
        # Mandatory blockers cap readiness score and restrict state
        blocker_count = len(critical_blockers)
        final_readiness_score = raw_readiness_score

        if blocker_count >= 2:
            # Severe gating: capped at 49.0, state must be DEVELOPING
            final_readiness_score = min(49.0, raw_readiness_score)
            readiness_state = ReadinessState.DEVELOPING
        elif blocker_count == 1:
            # Single blocker gating: capped at 68.0, cannot be READY or NEAR_READY
            final_readiness_score = min(68.0, raw_readiness_score)
            readiness_state = ReadinessState.EMERGING
        else:
            # Zero critical blockers! Standard state threshold policy
            if final_readiness_score >= 80.0 and mandatory_satisfied_count == mandatory_count and overall_confidence >= 0.50:
                readiness_state = ReadinessState.READY
            elif final_readiness_score >= 68.0:
                readiness_state = ReadinessState.NEAR_READY
            elif final_readiness_score >= 45.0:
                readiness_state = ReadinessState.EMERGING
            else:
                readiness_state = ReadinessState.DEVELOPING

        final_readiness_score = round(max(0.0, min(100.0, final_readiness_score)), 2)
        final_confidence = round(max(0.0, min(1.0, overall_confidence)), 2)

        # Natural Explainability Narrative Generation
        if readiness_state == ReadinessState.READY:
            summary = (
                f"Candidate satisfies all {mandatory_count} mandatory competency requirements "
                f"for '{target_title}' with a readiness score of {final_readiness_score:.1f}% "
                f"and strong supporting evidence confidence ({int(final_confidence * 100)}%)."
            )
        elif readiness_state == ReadinessState.NEAR_READY:
            summary = (
                f"Candidate is nearly ready for '{target_title}' ({final_readiness_score:.1f}%). "
                f"All mandatory competencies are covered, with minor preferred improvements remaining."
            )
        elif readiness_state == ReadinessState.EMERGING:
            if blocker_count > 0:
                summary = (
                    f"Candidate demonstrates emerging capability ({final_readiness_score:.1f}%), "
                    f"but is blocked by {blocker_count} critical mandatory requirement: "
                    f"{critical_blockers[0]['competency_name']}."
                )
            else:
                summary = (
                    f"Candidate demonstrates emerging capability ({final_readiness_score:.1f}%) "
                    f"across {satisfied_count} of {total_required} requirements for '{target_title}'."
                )
        else:
            summary = (
                f"Significant developmental gaps remain for '{target_title}' ({final_readiness_score:.1f}%). "
                f"{blocker_count} mandatory blockers must be resolved through evidence or assessment."
            )

        provenance_payload = {
            "algorithm_version": cls.ALGORITHM_VERSION,
            "taxonomy_version": cls.TAXONOMY_VERSION,
            "evaluated_at": now.isoformat(),
            "target_id": target_id,
            "target_title": target_title,
            "mandatory_count": mandatory_count,
            "mandatory_satisfied_count": mandatory_satisfied_count,
            "critical_blockers_count": blocker_count,
            "raw_score_before_gating": round(raw_readiness_score, 2),
            "final_score": final_readiness_score,
            "confidence": final_confidence,
            "summary": summary,
            "strengths": strengths,
            "gaps": gaps,
            "critical_blockers": critical_blockers,
            "requirements": [
                {
                    "competency_id": r.competency_id,
                    "competency_name": r.competency_name,
                    "requirement_type": r.requirement_type,
                    "required_proficiency": r.required_proficiency,
                    "student_proficiency": r.student_proficiency,
                    "student_score": r.student_score,
                    "score_gap": r.score_gap,
                    "coverage_status": r.coverage_status,
                    "is_satisfied": r.is_satisfied,
                    "is_critical_blocker": r.is_critical_blocker,
                    "blocker_reason": r.blocker_reason
                }
                for r in evaluated_reqs
            ]
        }

        return ReadinessEvaluationResult(
            target_id=target_id,
            target_type=target_type,
            target_title=target_title,
            readiness_state=readiness_state,
            readiness_score=final_readiness_score,
            confidence=final_confidence,
            missing_competencies_count=missing_count,
            satisfied_competencies_count=satisfied_count,
            total_required_count=total_required,
            strengths=strengths,
            gaps=gaps,
            critical_blockers=critical_blockers,
            requirements=evaluated_reqs,
            summary=summary,
            algorithm_version=cls.ALGORITHM_VERSION,
            taxonomy_version=cls.TAXONOMY_VERSION,
            provenance=provenance_payload,
        )
