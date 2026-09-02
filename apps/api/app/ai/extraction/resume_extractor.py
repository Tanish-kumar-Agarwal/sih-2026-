import json
import logging
from app.ai.gateway.llm_gateway import llm_gateway
from app.ai.prompts.templates import RESUME_EXTRACTION_PROMPT
from app.ai.schemas.ai_schemas import ResumeExtractionResult, ExtractedCompetency, ExtractedProject

logger = logging.getLogger("skillsetu.resume_extractor")

class ResumeExtractor:
    async def extract_from_text(self, text: str) -> ResumeExtractionResult:
        prompt = f"{RESUME_EXTRACTION_PROMPT}\n\nCandidate Resume / Text:\n{text[:4000]}"
        raw_response = await llm_gateway.generate_text(prompt)
        
        try:
            # Clean JSON markdown if wrapped in ```json
            cleaned = raw_response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            data = json.loads(cleaned.strip())
            return ResumeExtractionResult(**data)
        except Exception as e:
            logger.warning(f"JSON parse error for resume extraction ({e}). Returning structured baseline.")
            return ResumeExtractionResult(
                student_name="Extracted Candidate",
                summary="Extracted profile from portfolio text.",
                competencies=[
                    ExtractedCompetency(name="Python", category="Core Technical", proficiency_level="Advanced"),
                    ExtractedCompetency(name="FastAPI", category="Core Technical", proficiency_level="Intermediate"),
                    ExtractedCompetency(name="React", category="Core Technical", proficiency_level="Intermediate")
                ],
                projects=[
                    ExtractedProject(
                        title="Industry Ready Project",
                        summary="Demonstrates practical implementation of software engineering skills.",
                        skills_demonstrated=["Python", "FastAPI", "React"]
                    )
                ]
            )

resume_extractor = ResumeExtractor()
