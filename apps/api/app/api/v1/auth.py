from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.session import get_db
from app.domains.identity.schemas import UserRegisterRequest, UserLoginRequest
from app.domains.identity.service import identity_service
from app.security.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & Identity"])

@router.post("/register")
async def register_user(req: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    return await identity_service.register(db, req)

@router.post("/login")
async def login_user(req: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    return await identity_service.login(db, req)

@router.get("/me")
async def get_my_session(current_user: dict = Depends(get_current_user)):
    return current_user
