import logging
from app.ai.embeddings.embedder import semantic_embedder

logger = logging.getLogger("skillsetu.workers.embedding")

async def generate_competency_embeddings_task(competency_names: list):
    logger.info(f"Generating semantic vector embeddings for {len(competency_names)} competencies")
    results = {}
    for name in competency_names:
        results[name] = semantic_embedder.get_embedding(name)
    return results
