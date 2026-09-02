import logging
import asyncio
from app.ai.extraction.resume_extractor import resume_extractor

logger = logging.getLogger("skillsetu.workers.resume")

async def process_resume_task(resume_text: str, student_id: str):
    logger.info(f"Processing resume background parsing for student: {student_id}")
    result = await resume_extractor.extract_from_text(resume_text)
    logger.info(f"Successfully extracted {len(result.competencies)} competencies for {student_id}")
    return result.dict()
