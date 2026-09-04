from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.config.settings import settings
from app.infrastructure.database.session import engine, get_db
from app.infrastructure.neo4j.graph_client import graph_client
from app.observability.logger import logger

# Import API Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.context import router as context_router
from app.api.v1.students import router as students_router
from app.api.v1.industry import router as industry_router
from app.api.v1.opportunities import router as opportunities_router
from app.api.v1.competencies import router as competencies_router
from app.api.v1.skills import router as skills_router
from app.api.v1.roles import router as roles_router
from app.api.v1.assessments import router as assessments_router
from app.api.v1.evidence import router as evidence_router
from app.api.v1.matching import router as matching_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.github import router as github_router
from app.api.v1.evidence_mapping import router as evidence_mapping_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("SkillSetu backend starting up...")
    
    # 1. Verify PostgreSQL 16 transactional ground truth connection (Schema managed strictly by Alembic)
    try:
        async with engine.connect() as conn:
            res = await conn.execute(text("SELECT version();"))
            db_version = res.scalar()
            logger.info(f"PostgreSQL ground truth connection verified: {db_version}")
    except Exception as e:
        logger.error(f"FATAL: PostgreSQL connection failed: {e}")
        raise e

    # 2. Connect to Neo4j graph cluster
    await graph_client.connect()

    yield

    logger.info("SkillSetu backend shutting down...")
    await graph_client.close()
    await engine.dispose()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="SkillSetu AI-Powered Industry-Academia Competency Intelligence Platform",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Health & Metadata
@app.get("/", tags=["System"])
@app.get("/health", tags=["System"])
async def root():
    return {
        "status": "ONLINE",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "PostgreSQL 16 (Authoritative Ground Truth)",
        "neo4j_connected": graph_client._is_connected,
        "docs_url": "/docs"
    }

@app.get("/api/v1/health", tags=["System"])
async def v1_health(db: AsyncSession = Depends(get_db)):
    db_ok = False
    try:
        res = await db.execute(text("SELECT 1;"))
        db_ok = (res.scalar() == 1)
    except Exception:
        db_ok = False

    return {
        "status": "ONLINE" if db_ok else "DEGRADED",
        "database_connected": db_ok,
        "database_engine": "PostgreSQL 16 + SQLAlchemy 2.0 (asyncpg)",
        "neo4j_connected": graph_client._is_connected,
        "active_environment": settings.ENVIRONMENT
    }

# Register V1 Routers
api_v1_routers = [
    context_router,
    auth_router,
    students_router,
    industry_router,
    opportunities_router,
    competencies_router,
    skills_router,
    roles_router,
    assessments_router,
    evidence_router,
    matching_router,
    recommendations_router,
    analytics_router,
    github_router,
    evidence_mapping_router
]

for r in api_v1_routers:
    app.include_router(r, prefix="/api/v1")
