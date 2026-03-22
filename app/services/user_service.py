"""
User service — create, fetch, update users via SQLAlchemy.
"""
from datetime import date
from app.db.models import SessionLocal, User, UsageLog
from app.auth.password import hash_password, verify_password

FREE_DAILY_LIMIT = 3


def get_db():
    return SessionLocal()


def create_user(name: str, email: str, password: str) -> User | None:
    """Create a new user. Returns None if email already taken."""
    db = get_db()
    try:
        if db.query(User).filter(User.email == email).first():
            return None
        user = User(name=name, email=email, password_hash=hash_password(password))
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


def get_user_by_email(email: str) -> User | None:
    db = get_db()
    try:
        return db.query(User).filter(User.email == email).first()
    finally:
        db.close()


def get_user_by_id(user_id: int) -> dict | None:
    db = get_db()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "plan_type": user.plan_type,
            "created_at": str(user.created_at),
        }
    finally:
        db.close()


def authenticate_user(email: str, password: str) -> User | None:
    """Return user if credentials match, else None."""
    user = get_user_by_email(email)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


def upgrade_to_premium(user_id: int) -> bool:
    db = get_db()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        user.plan_type = "premium"
        db.commit()
        return True
    finally:
        db.close()


# ─── Usage Tracking ──────────────────────────────────────────────────────────

def get_today_usage(user_id: int) -> int:
    db = get_db()
    try:
        log = db.query(UsageLog).filter(
            UsageLog.user_id == user_id,
            UsageLog.date == date.today()
        ).first()
        return log.count if log else 0
    finally:
        db.close()


def increment_usage(user_id: int) -> int:
    db = get_db()
    try:
        log = db.query(UsageLog).filter(
            UsageLog.user_id == user_id,
            UsageLog.date == date.today()
        ).first()
        if log:
            log.count += 1
        else:
            log = UsageLog(user_id=user_id, count=1)
            db.add(log)
        db.commit()
        return log.count
    finally:
        db.close()


def check_usage_limit(user: dict) -> dict:
    """
    Returns {"allowed": bool, "used": int, "limit": int | None}.
    Premium users are always allowed.
    """
    if user.get("plan_type") == "premium":
        return {"allowed": True, "used": get_today_usage(user["id"]), "limit": None}
    used = get_today_usage(user["id"])
    return {
        "allowed": used < FREE_DAILY_LIMIT,
        "used": used,
        "limit": FREE_DAILY_LIMIT,
    }
