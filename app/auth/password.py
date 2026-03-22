"""
Password hashing using bcrypt directly (avoids passlib Python 3.13 bug).
"""
import bcrypt


def hash_password(plain: str) -> str:
    """Hash a password using bcrypt and return the hash string."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if plain matches the hashed password."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
