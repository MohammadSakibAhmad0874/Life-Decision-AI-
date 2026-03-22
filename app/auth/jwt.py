"""
JWT token utilities for Life Decision AI v4.0
"""
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt

SECRET_KEY = os.getenv("SECRET_KEY", "life-decision-ai-super-secret-key-2024")
ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 7


def create_access_token(data: dict) -> str:
    """Create a JWT token that expires in TOKEN_EXPIRE_DAYS days."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """Decode and validate a JWT token. Returns payload or None."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
