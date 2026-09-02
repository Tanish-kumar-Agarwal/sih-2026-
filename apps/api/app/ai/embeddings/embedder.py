import math
from typing import List

class SemanticEmbedder:
    """Calculates semantic vector embeddings and cosine similarity between skills"""
    def __init__(self):
        pass

    def get_embedding(self, text: str) -> List[float]:
        # Fast deterministic hash-based 64-dim embedding vector representation
        words = text.lower().split()
        vector = [0.0] * 64
        for word in words:
            h = hash(word)
            for i in range(64):
                vector[i] += ((h >> (i % 32)) & 1) * 0.1
        # Normalize
        norm = math.sqrt(sum(x * x for x in vector)) or 1.0
        return [round(x / norm, 4) for x in vector]

    def cosine_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.5
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a)) or 1.0
        norm_b = math.sqrt(sum(b * b for b in vec_b)) or 1.0
        return max(0.0, min(1.0, dot / (norm_a * norm_b)))

semantic_embedder = SemanticEmbedder()
