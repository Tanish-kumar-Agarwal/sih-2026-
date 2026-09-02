import logging
from app.domains.analytics.service import analytics_service

logger = logging.getLogger("skillsetu.workers.analytics")

async def aggregate_ecosystem_analytics_task():
    logger.info("Recomputing macro institutional readiness & skill gap heatmaps")
    data = await analytics_service.get_macro_trends()
    return data
