from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import User, Student, Faculty, IndustryUser, Company, Institution
from app.config.settings import settings

router = APIRouter(prefix="/context", tags=["Development Persona Context"])

# In-memory active persona ID for local demo session
_active_persona_id = settings.DEFAULT_DEV_PERSONA_ID

AVAILABLE_PERSONAS = [
    {
        "id": "stu-aarav-sharma",
        "role": "student",
        "name": "Aarav Sharma",
        "title": "Student Persona · B.Tech CS 3rd Year (Software & AI)",
        "institution": "Indian Institute of Technology, Delhi",
        "avatar": "AS",
        "default_route": "/student/dashboard"
    },
    {
        "id": "stu-priya-patel",
        "role": "student",
        "name": "Priya Patel",
        "title": "Student Persona · BAMS 4th Year (AYUSH & Diagnostics)",
        "institution": "National Institute of Ayurveda, Jaipur",
        "avatar": "PP",
        "default_route": "/student/dashboard"
    },
    {
        "id": "stu-rohit-kumar",
        "role": "student",
        "name": "Rohit Kumar",
        "title": "Student Persona · B.Tech 1st Year (Blank Slate / 0 Competencies)",
        "institution": "Indian Institute of Technology, Delhi",
        "avatar": "RK",
        "default_route": "/student/dashboard"
    },
    {
        "id": "ind-nextgen-recruiter",
        "role": "industry",
        "name": "Vikram Malhotra",
        "title": "Industry Recruiter · Head of Talent",
        "institution": "NextGen AI Labs",
        "avatar": "VM",
        "default_route": "/industry/dashboard"
    },
    {
        "id": "inst-iitd-dean",
        "role": "institution",
        "name": "Prof. S. K. Gupta",
        "title": "Institution Dean & TPO Director",
        "institution": "Indian Institute of Technology, Delhi",
        "avatar": "SG",
        "default_route": "/institution/dashboard"
    },
    {
        "id": "fac-ramesh-chandra",
        "role": "faculty",
        "name": "Dr. Ramesh Chandra",
        "title": "Faculty Mentor · Associate Professor",
        "institution": "Department of CSE, IIT Delhi",
        "avatar": "RC",
        "default_route": "/faculty/dashboard"
    },
    {
        "id": "adm-super-admin",
        "role": "admin",
        "name": "Platform Admin",
        "title": "System Super Administrator",
        "institution": "SkillSetu Central Operations",
        "avatar": "SA",
        "default_route": "/admin/dashboard"
    }
]

@router.get("/personas")
async def list_development_personas() -> List[Dict[str, Any]]:
    """Lists deterministic development personas backed by PostgreSQL seed records."""
    return AVAILABLE_PERSONAS

@router.get("/current")
async def get_current_development_persona(
    x_dev_persona_id: Optional[str] = Header(None, alias="X-Dev-Persona-Id"),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Resolves and returns active persona details directly from PostgreSQL."""
    global _active_persona_id
    persona_id = x_dev_persona_id or _active_persona_id

    # Resolve persona descriptor
    descriptor = next((p for p in AVAILABLE_PERSONAS if p["id"] == persona_id), AVAILABLE_PERSONAS[0])

    # If student persona, resolve student record
    if descriptor["role"] == "student":
        stmt = select(Student).where(Student.id == persona_id)
        res = await db.execute(stmt)
        student = res.scalars().first()
        if student:
            user = await db.get(User, student.user_id)
            return {
                **descriptor,
                "user_id": student.user_id,
                "student_id": student.id,
                "email": user.email if user else "",
                "readiness_score": student.readiness_score,
                "cgpa": student.cgpa,
                "is_verified": user.is_verified if user else True
            }

    return descriptor

@router.post("/switch/{persona_id}")
async def switch_development_persona(persona_id: str) -> Dict[str, Any]:
    """Switches active development persona."""
    global _active_persona_id
    match = next((p for p in AVAILABLE_PERSONAS if p["id"] == persona_id), None)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Persona '{persona_id}' not found among seeded development personas."
        )
    _active_persona_id = persona_id
    return {
        "status": "SUCCESS",
        "active_persona_id": _active_persona_id,
        "persona": match
    }
