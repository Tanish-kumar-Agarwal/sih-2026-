from typing import Optional
from pydantic import BaseModel, EmailStr

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    institution_code: Optional[str] = None
    company_name: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
