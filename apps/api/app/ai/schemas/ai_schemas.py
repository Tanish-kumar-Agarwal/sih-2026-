from typing import List, Optional, Dict
from pydantic import BaseModel

class ExtractedCompetency(BaseModel):
    name: str
    category: str = "Core Technical"
    proficiency_level: str = "Intermediate"
    confidence_score: float = 0.8
    evidence_quote: Optional[str] = None

class ExtractedProject(BaseModel):
    title: str
    summary: str
    skills_demonstrated: List[str]
    confidence: float = 0.85

class ResumeExtractionResult(BaseModel):
    student_name: Optional[str] = None
    email: Optional[str] = None
    education: List[Dict[str, str]] = []
    competencies: List[ExtractedCompetency] = []
    projects: List[ExtractedProject] = []
    summary: str = ""

class MatchExplanationRequest(BaseModel):
    student_name: str
    student_competencies: List[str]
    opportunity_title: str
    company_name: str
    required_competencies: List[str]
    match_score: float

class MatchExplanationResponse(BaseModel):
    summary: str
    strengths: List[str]
    missing_critical_skills: List[str]
    readiness_assessment: str
    recommended_learning_steps: List[str]
