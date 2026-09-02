import logging
from app.domains.matching.service import matchmaking_engine

logger = logging.getLogger("skillsetu.workers.matching")

async def recalculate_student_matches_task(student_profile: dict):
    logger.info(f"Triggering background multi-hop graph match calculation for student: {student_profile.get('id')}")
    matches = await matchmaking_engine.compute_matches_for_student(student_profile)
    logger.info(f"Calculated {len(matches)} match results")
    return matches
