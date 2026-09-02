import pytest
from app.ai.embeddings.embedder import semantic_embedder
from app.infrastructure.neo4j.graph_client import graph_client

@pytest.mark.asyncio
async def test_semantic_embedder():
    v1 = semantic_embedder.get_embedding("Python FastAPI Backend")
    v2 = semantic_embedder.get_embedding("Python FastAPI Web API")
    sim = semantic_embedder.cosine_similarity(v1, v2)
    assert sim > 0.6

@pytest.mark.asyncio
async def test_graph_matching_calculation():
    student_skills = ["Python", "FastAPI", "React & Next.js"]
    required_skills = ["FastAPI", "React & Next.js", "Docker"]
    res = await graph_client.calculate_graph_match(student_skills, required_skills)
    assert "FastAPI" in res["matched"]
    assert "Docker" in res["missing"]
    assert res["match_score"] > 60.0
