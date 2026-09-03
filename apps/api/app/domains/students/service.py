from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.repositories.student_repo import StudentRepository
from app.infrastructure.neo4j.graph_client import graph_client

class StudentService:
    async def get_profile(self, db: AsyncSession, identifier: str) -> Dict[str, Any]:
        repo = StudentRepository(db)
        
        # Check by user_id first, then student_id
        student = await repo.get_by_user_id(identifier)
        if not student:
            student = await repo.get_by_student_id(identifier)
            
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile not found for identifier '{identifier}'"
            )

        user = student.user
        institution = student.institution
        department = student.department

        competencies_list = []
        for sc in student.competencies:
            comp = sc.competency
            competencies_list.append({
                "id": comp.id if comp else sc.competency_id,
                "name": comp.name if comp else "Unknown Competency",
                "code": comp.code if comp else "",
                "category": comp.category if comp else "Core Technical",
                "proficiency": sc.proficiency_level,
                "score": sc.score,
                "confidence_score": sc.confidence_score,
                "is_verified": sc.is_verified,
                "verified_at": sc.verified_at.isoformat() if sc.verified_at else None
            })

        projects_list = []
        for p in student.projects:
            projects_list.append({
                "id": p.id,
                "title": p.title,
                "summary": p.summary,
                "repo_url": p.repo_url,
                "live_url": p.live_url,
                "is_verified": p.is_verified,
                "demonstrated_skills": p.demonstrated_skills or []
            })

        return {
            "id": student.id,
            "user_id": student.user_id,
            "first_name": user.first_name if user else "",
            "last_name": user.last_name if user else "",
            "email": user.email if user else "",
            "phone": user.phone if user else None,
            "avatar_url": user.avatar_url if user else None,
            "institution_id": student.institution_id,
            "institution_name": institution.name if institution else "Affiliated Institution",
            "department_id": student.department_id,
            "department_name": department.name if department else "Engineering & Technology",
            "enrollment_number": student.enrollment_number,
            "current_year": student.current_year,
            "graduation_year": student.graduation_year,
            "cgpa": student.cgpa,
            "bio": student.bio,
            "github_url": student.github_url,
            "linkedin_url": student.linkedin_url,
            "portfolio_url": student.portfolio_url,
            "resume_url": student.resume_url,
            "readiness_score": student.readiness_score,
            "competencies": competencies_list,
            "projects": projects_list,
            "created_at": student.created_at.isoformat() if student.created_at else None
        }

    async def get_graph(self, student_id: str) -> dict:
        return await graph_client.get_student_graph(student_id)

student_service = StudentService()
