"""
/api/me — current user profile + usage stats
/api/upgrade — simulate premium upgrade
"""
from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.services.user_service import upgrade_to_premium, get_today_usage, FREE_DAILY_LIMIT

router = APIRouter(prefix="/api", tags=["User"])


@router.get("/me")
def get_me(user=Depends(get_current_user)):
    """Return current user profile + today's usage stats."""
    used = get_today_usage(user["id"])
    return {
        "user": user,
        "usage": {
            "used_today": used,
            "limit": None if user["plan_type"] == "premium" else FREE_DAILY_LIMIT,
            "is_premium": user["plan_type"] == "premium",
        },
    }


@router.post("/upgrade")
def upgrade(user=Depends(get_current_user)):
    """Simulate premium upgrade (no real payment)."""
    if user["plan_type"] == "premium":
        return {"message": "Already on Premium!", "plan_type": "premium"}

    success = upgrade_to_premium(user["id"])
    if not success:
        return {"message": "Upgrade failed.", "plan_type": "free"}

    return {
        "message": "🎉 Welcome to Premium! All features unlocked.",
        "plan_type": "premium",
    }
