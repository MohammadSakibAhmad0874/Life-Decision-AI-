"""
FastAPI auth dependencies: get_current_user, require_premium.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.auth.jwt import decode_access_token
from app.services.user_service import get_user_by_id

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    """Decode JWT and return user dict. Raises 401 if missing/invalid."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please login.",
        )
    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )
    user = get_user_by_id(int(payload["sub"]))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )
    return user


def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    """Like get_current_user but returns None instead of raising 401."""
    if not credentials:
        return None
    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        return None
    return get_user_by_id(int(payload["sub"]))


def require_premium(user=Depends(get_current_user)):
    """Raise 403 if user is on free plan."""
    if user.get("plan_type") != "premium":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This feature requires a Premium plan. Upgrade to unlock.",
        )
    return user
