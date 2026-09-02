from typing import List
from app.ai.schemas.ai_schemas import MatchExplanationRequest, MatchExplanationResponse
from app.ai.gateway.llm_gateway import llm_gateway
from app.ai.prompts.templates import MATCH_EXPLANATION_PROMPT

class MatchExplainer:
    async def explain_match(self, req: MatchExplanationRequest) -> MatchExplanationResponse:
        matched_set = set(k.lower() for k in req.student_competencies)
        strengths = [s for s in req.required_competencies if s.lower() in matched_set]
        missing = [s for s in req.required_competencies if s.lower() not in matched_set]
        
        summary = (
            f"{req.student_name} demonstrates a {req.match_score:.1f}% fit for {req.opportunity_title} at {req.company_name}. "
            f"Strong verified competencies in {', '.join(strengths[:3]) if strengths else 'core fundamentals'}."
        )

        readiness = "High Suitability - Recommended for Direct Interview" if req.match_score >= 80 else "Moderate Fit - Minor Skill Remediation Recommended"

        recommended_steps = []
        for i, m in enumerate(missing[:3], 1):
            recommended_steps.append(f"Step {i}: Complete micro-credential challenge & portfolio task for {m}")
        if not recommended_steps:
            recommended_steps = ["Prepare architectural project walk-through for upcoming interview."]

        return MatchExplanationResponse(
            summary=summary,
            strengths=strengths,
            missing_critical_skills=missing,
            readiness_assessment=readiness,
            recommended_learning_steps=recommended_steps
        )

match_explainer = MatchExplainer()
