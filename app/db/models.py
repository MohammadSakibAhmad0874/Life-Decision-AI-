"""
SQLAlchemy database setup and all models for Life Decision AI v4.0.
Creates: users, usage_logs, decisions tables.
"""
from datetime import datetime, date
from sqlalchemy import (
    create_engine, Column, Integer, String, DateTime, Date, Text, Float
)
from sqlalchemy.orm import declarative_base, sessionmaker

import os as _os
_DB_PATH = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))), "life_decision_ai.db")
DATABASE_URL = f"sqlite:///{_DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # required for SQLite + FastAPI
)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ─── Models ────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(120), nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    plan_type     = Column(String(20), default="free")  # "free" | "premium"
    created_at    = Column(DateTime, default=datetime.utcnow)


class UsageLog(Base):
    __tablename__ = "usage_logs"

    id      = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    date    = Column(Date, default=date.today)
    count   = Column(Integer, default=0)


class Decision(Base):
    __tablename__ = "decisions"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, index=True, nullable=False)
    inputs_json = Column(Text, nullable=False)
    result_json = Column(Text, nullable=False)
    score       = Column(Float, default=0.0)
    career      = Column(String(120), default="")
    created_at  = Column(DateTime, default=datetime.utcnow)


# ─── Helpers ────────────────────────────────────────────────────────────────

def init_db():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine, checkfirst=True)


def get_db():
    """FastAPI dependency that yields a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
