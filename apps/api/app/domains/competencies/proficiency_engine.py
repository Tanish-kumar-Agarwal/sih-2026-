from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.repositories.competency_repo import CompetencyRepository
from app.domains.competencies.resolver import SkillResolutionEngine
from app.domains.competencies.taxonomy_constants import (
    ProficiencyLevel, ProficiencySource, SOURCE_PRECEDENCE,
    PROFICIENCY_NUMERIC_MAP, PROFICIENCY_SCORE_THRESHOLDS,
    score_to_proficiency, ResolutionStatus
)

class CompetencyProficiencyAggregator:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = CompetencyRepository(db)
        self.resolver = SkillResolutionEngine(db)

    async def aggregate_skills_to_competencies(
        self,
        skill_inputs: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Deterministic aggregation of resolved skill signals into canonical competency ratings.
        
        Formula:
            weighted_score = sum(skill_score * relevance_weight) / sum(relevance_weight)
            canonical_level = score_to_proficiency(weighted_score)
            
        Precedence:
            Highest trust source among contributing skills defines dominant provenance.
        """
        if not skill_inputs:
            return {
                "competencies": [],
                "unresolved_skills": [],
                "total_skills_evaluated": 0
            }

        # 1. Resolve raw skill inputs to canonical skills
        raw_skill_names = [s["skill"] for s in skill_inputs if s.get("skill")]
        resolution_result = await self.resolver.resolve_batch(raw_skill_names)

        resolved_lookup: Dict[str, Any] = {}
        unresolved_skills: List[str] = []

        for item in resolution_result["items"]:
            orig = item["input"]
            if item["status"] == ResolutionStatus.RESOLVED.value and item["skill"]:
                resolved_lookup[orig] = item["skill"]
            else:
                unresolved_skills.append(orig)

        # 2. Attach resolution metadata to inputs
        valid_resolved_inputs = []
        canonical_skill_ids = []

        for inp in skill_inputs:
            raw_val = inp.get("skill")
            if raw_val in resolved_lookup:
                c_skill = resolved_lookup[raw_val]
                
                # Derive numeric score
                raw_score = inp.get("score")
                raw_level = inp.get("proficiency_level")
                
                if raw_score is not None:
                    score_val = float(raw_score)
                    level_val = score_to_proficiency(score_val)
                elif raw_level:
                    try:
                        level_val = ProficiencyLevel(raw_level.upper())
                        score_val = PROFICIENCY_SCORE_THRESHOLDS[level_val]
                    except ValueError:
                        level_val = ProficiencyLevel.INTERMEDIATE
                        score_val = 75.0
                else:
                    level_val = ProficiencyLevel.INTERMEDIATE
                    score_val = 75.0

                # Validate source provenance
                raw_source = inp.get("source", "SELF_REPORTED")
                try:
                    source_val = ProficiencySource(raw_source.upper())
                except ValueError:
                    source_val = ProficiencySource.SELF_REPORTED

                valid_resolved_inputs.append({
                    "canonical_skill_id": c_skill["id"],
                    "canonical_skill_name": c_skill["name"],
                    "canonical_skill_slug": c_skill["slug"],
                    "score": score_val,
                    "level": level_val,
                    "source": source_val
                })
                canonical_skill_ids.append(c_skill["id"])

        if not valid_resolved_inputs:
            return {
                "competencies": [],
                "unresolved_skills": unresolved_skills,
                "total_skills_evaluated": len(skill_inputs)
            }

        # 3. Batch fetch skill-to-competency mappings
        mappings = await self.repo.get_skills_competency_mappings_batch(canonical_skill_ids)

        # 4. Group skills by competency
        comp_groups: Dict[str, Dict[str, Any]] = {}
        for m in mappings:
            c = m.competency
            if not c or c.status != "ACTIVE":
                continue

            if c.id not in comp_groups:
                comp_groups[c.id] = {
                    "competency_id": c.id,
                    "competency_name": c.name,
                    "competency_code": c.code,
                    "competency_slug": c.slug,
                    "category": c.category,
                    "difficulty_level": c.difficulty_level,
                    "contributing_skills": []
                }

            # Find matching skill inputs
            for s_inp in valid_resolved_inputs:
                if s_inp["canonical_skill_id"] == m.skill_id:
                    comp_groups[c.id]["contributing_skills"].append({
                        "skill_id": s_inp["canonical_skill_id"],
                        "skill_name": s_inp["canonical_skill_name"],
                        "skill_slug": s_inp["canonical_skill_slug"],
                        "score": s_inp["score"],
                        "level": s_inp["level"].value,
                        "relevance_weight": m.relevance_weight or 1.0,
                        "is_primary": m.is_primary,
                        "source": s_inp["source"].value
                    })

        # 5. Compute deterministic aggregated metrics for each competency
        aggregated_competencies = []
        for c_id, data in comp_groups.items():
            skills = data["contributing_skills"]
            if not skills:
                continue

            total_weight = sum(s["relevance_weight"] for s in skills)
            weighted_score_sum = sum(s["score"] * s["relevance_weight"] for s in skills)
            
            final_score = round(weighted_score_sum / total_weight, 2) if total_weight > 0 else 0.0
            final_level = score_to_proficiency(final_score)

            # Dominant source by precedence
            best_source = max(
                skills,
                key=lambda s: SOURCE_PRECEDENCE.get(ProficiencySource(s["source"]), 0)
            )["source"]

            primary_count = sum(1 for s in skills if s["is_primary"])

            aggregated_competencies.append({
                "competency_id": data["competency_id"],
                "competency_name": data["competency_name"],
                "competency_code": data["competency_code"],
                "competency_slug": data["competency_slug"],
                "category": data["category"],
                "difficulty_level": data["difficulty_level"],
                "aggregated_score": final_score,
                "proficiency_level": final_level.value,
                "proficiency_numeric": PROFICIENCY_NUMERIC_MAP[final_level],
                "primary_skills_covered": primary_count,
                "total_skills_contributing": len(skills),
                "dominant_source": best_source,
                "contributing_skills": skills
            })

        # Sort descending by score
        aggregated_competencies.sort(key=lambda c: c["aggregated_score"], reverse=True)

        return {
            "competencies": aggregated_competencies,
            "unresolved_skills": unresolved_skills,
            "total_skills_evaluated": len(skill_inputs)
        }
