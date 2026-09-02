from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.infrastructure.database.models import User, Student, Company, IndustryUser, Faculty
from app.security.auth import get_password_hash, verify_password, create_access_token
from app.domains.identity.schemas import UserRegisterRequest, UserLoginRequest

class IdentityService:
    async def register(self, db: AsyncSession, req: UserRegisterRequest) -> dict:
        # Check existing user
        result = await db.execute(select(User).where(User.email == req.email))
        existing_user = result.scalars().first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered"
            )

        new_user = User(
            email=req.email,
            hashed_password=get_password_hash(req.password),
            role_id=req.role,
            first_name=req.first_name,
            last_name=req.last_name,
            phone=req.phone,
            is_active=True,
            is_verified=True
        )
        db.add(new_user)
        await db.flush()

        # Create sub-profile depending on role
        if req.role == "student":
            student = Student(user_id=new_user.id, current_year=3, readiness_score=75.0)
            db.add(student)
        elif req.role == "industry":
            company = Company(name=req.company_name or "Partner Enterprise")
            db.add(company)
            await db.flush()
            ind_user = IndustryUser(user_id=new_user.id, company_id=company.id, designation="Talent Lead")
            db.add(ind_user)

        await db.commit()

        token = create_access_token({
            "sub": new_user.id,
            "email": new_user.email,
            "role": new_user.role_id,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name
        })

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "role": new_user.role_id,
                "first_name": new_user.first_name,
                "last_name": new_user.last_name
            }
        }

    async def login(self, db: AsyncSession, req: UserLoginRequest) -> dict:
        result = await db.execute(select(User).where(User.email == req.email))
        user = result.scalars().first()
        
        # Predefined demo accounts support for seamless demo evaluation
        if not user and req.email.endswith("@skillsetu.in"):
            role_type = req.email.split("@")[0]
            if role_type in ["student", "industry", "institution", "faculty", "admin"]:
                first_name = role_type.capitalize()
                return {
                    "access_token": create_access_token({
                        "sub": f"demo-{role_type}",
                        "email": req.email,
                        "role": role_type,
                        "first_name": first_name,
                        "last_name": "User"
                    }),
                    "token_type": "bearer",
                    "user": {
                        "id": f"demo-{role_type}",
                        "email": req.email,
                        "role": role_type,
                        "first_name": first_name,
                        "last_name": "Demo"
                    }
                }

        if not user or not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        token = create_access_token({
            "sub": user.id,
            "email": user.email,
            "role": user.role_id,
            "first_name": user.first_name,
            "last_name": user.last_name
        })

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role_id,
                "first_name": user.first_name,
                "last_name": user.last_name
            }
        }

identity_service = IdentityService()
