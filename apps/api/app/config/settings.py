import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "SkillSetu API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    # Security (Authentication intentionally deferred in Phase 0/1)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "skillsetu_dev_secret_key_at_least_32_characters_sih2026")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "skillsetu_super_secret_jwt_key_sih26")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Deterministic Development Persona (for unauthenticated demo context)
    DEFAULT_DEV_PERSONA_ID: str = os.getenv("DEFAULT_DEV_PERSONA_ID", "stu-aarav-sharma")

    # PostgreSQL 16 Ground Truth Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://skillsetu_user:skillsetu_password@localhost:5432/skillsetu_db"
    )
    SYNC_DATABASE_URL: str = os.getenv(
        "SYNC_DATABASE_URL",
        "postgresql://skillsetu_user:skillsetu_password@localhost:5432/skillsetu_db"
    )

    # Neo4j Graph Intelligence
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "skillsetu_graph_pass")

    # Redis Cache & Tasks
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # AI & Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")

    # CORS Origins (Explicit allowed client origins)
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
