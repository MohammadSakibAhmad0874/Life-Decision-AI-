"""
Auth routes: /api/signup  and  /api/login
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.auth.jwt import create_access_token
from app.services.user_service import create_user, authenticate_user

router = APIRouter(prefix="/api", tags=["Auth"])


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/signup")
def signup(req: SignupRequest):
    """Register a new user and return a JWT token."""
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    user = create_user(name=req.name, email=req.email, password=req.password)
    if user is None:
        raise HTTPException(status_code=400, detail="Email already registered.")

    token = create_access_token({"sub": str(user.id)})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "plan_type": user.plan_type,
        },
    }


@router.post("/login")
def login(req: LoginRequest):
    """Verify credentials, return JWT token."""
    user = authenticate_user(email=req.email, password=req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    token = create_access_token({"sub": str(user.id)})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "plan_type": user.plan_type,
        },
    }
