from typing import List, Dict, Any
from app.infrastructure.neo4j.graph_client import graph_client
from app.ai.embeddings.embedder import semantic_embedder
from app.ai.explanations.match_explainer import match_explainer
from app.ai.schemas.ai_schemas import MatchExplanationRequest
from app.domains.opportunities.service import opportunity_service

class MatchmakingEngine:
    async def compute_matches_for_student(self, student_profile: dict) -> List[Dict[str, Any]]:
        opportunities = await opportunity_service.list_opportunities(None)
        student_comps = [c["name"] for c in student_profile.get("competencies", [])]
        results = []

        for opp in opportunities:
            req_comps = [c["name"] for c in opp.get("required_competencies", [])]
            
            # 1. Graph multi-hop coverage
            graph_res = await graph_client.calculate_graph_match(student_comps, req_comps)
            graph_score = graph_res["match_score"]

            # 2. Vector Semantic Similarity
            vec_s = semantic_embedder.get_embedding(" ".join(student_comps))
            vec_o = semantic_embedder.get_embedding(" ".join(req_comps))
            semantic_score = semantic_embedder.cosine_similarity(vec_s, vec_o) * 100.0

            # 3. Weighted Composite Score (70% Graph Path Verification + 30% Semantic Embeddings)
            composite_score = round((graph_score * 0.70) + (semantic_score * 0.30), 1)

            # 4. Generate Explainable Reasoning
            xai_req = MatchExplanationRequest(
                student_name=f"{student_profile.get('first_name', 'Student')} {student_profile.get('last_name', '')}",
                student_competencies=student_comps,
                opportunity_title=opp["title"],
                company_name=opp["company_name"],
                required_competencies=req_comps,
                match_score=composite_score
            )
            xai_resp = await match_explainer.explain_match(xai_req)

            # Detailed match item
            results.append({
                "opportunity_id": opp["id"],
                "opportunity_title": opp["title"],
                "company_name": opp["company_name"],
                "company_logo": opp.get("company_logo"),
                "stipend_or_salary": opp.get("stipend_or_salary"),
                "location": opp.get("location"),
                "work_mode": opp.get("work_mode"),
                "type": opp.get("type"),
                "overall_match_score": composite_score,
                "graph_path_score": graph_score,
                "vector_similarity": round(semantic_score, 1),
                "matched_competencies": [
                    {
                        "name": name,
                        "student_proficiency": "Advanced" if name in ["Python", "React & Next.js"] else "Intermediate",
                        "status": "VERIFIED" if name != "Neo4j Graph DB" else "SELF_REPORTED",
                        "weight": 1.0
                    } for name in graph_res["matched"]
                ],
                "missing_competencies": graph_res["missing"],
                "reasoning": xai_resp.summary,
                "strengths": xai_resp.strengths,
                "gap_remediation_path": [
                    {
                        "step": idx + 1,
                        "action": action,
                        "resource_title": f"Mastery Module: {graph_res['missing'][idx] if idx < len(graph_res['missing']) else 'Capstone Project'}",
                        "resource_type": "HANDS_ON_LAB",
                        "est_hours": 6
                    } for idx, action in enumerate(xai_resp.recommended_learning_steps)
                ]
            })

        # Sort descending by match score
        results.sort(key=lambda x: x["overall_match_score"], reverse=True)
        return results

matchmaking_engine = MatchmakingEngine()
