from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.infrastructure.database.session import engine, Base
from app.infrastructure.neo4j.graph_client import graph_client
from app.observability.logger import logger

# Import API Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.students import router as students_router
from app.api.v1.industry import router as industry_router
from app.api.v1.opportunities import router as opportunities_router
from app.api.v1.competencies import router as competencies_router
from app.api.v1.assessments import router as assessments_router
from app.api.v1.evidence import router as evidence_router
from app.api.v1.matching import router as matching_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.analytics import router as analytics_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("SkillSetu backend starting up...")
    try:
        # Initialize relational schema if using SQLite / development
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Relational schema verified.")
    except Exception as e:
        logger.warning(f"Database schema initialization warning: {e}")

    # Connect to Neo4j graph cluster
    await graph_client.connect()

    yield

    logger.info("SkillSetu backend shutting down...")
    await graph_client.close()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="SkillSetu AI-Powered Industry-Academia Bridging and Competency-to-Opportunity Graph Matching API",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permissive for Hackathon evaluation and local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Health Check
@app.get("/", tags=["System"])
async def root():
    return {
        "status": "ONLINE",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs_url": "/docs",
        "neo4j_connected": graph_client._is_connected
    }

# Register V1 Routers
api_v1_routers = [
    auth_router,
    students_router,
    industry_router,
    opportunities_router,
    competencies_router,
    assessments_router,
    evidence_router,
    matching_router,
    recommendations_router,
    analytics_router
]

for r in api_v1_routers:
    app.include_router(r, prefix="/api/v1")
