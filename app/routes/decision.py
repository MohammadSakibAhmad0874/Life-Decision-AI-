"""
Upgraded Decision API — domain support + history endpoint.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.decision_service import make_decision
from app.db.database import get_history

router = APIRouter(prefix="/api/decision", tags=["Decision"])

DOMAINS = ["Tech", "Business", "Creative", "Science", "Healthcare"]


class DecisionRequest(BaseModel):
    skill: float = Field(..., ge=0, le=10, description="Skill level 0–10")
    interest: float = Field(..., ge=0, le=10, description="Interest score 0–10")
    risk: float = Field(..., ge=0, le=10, description="Risk tolerance 0–10")
    domain: str = Field("Tech", description="Career domain")
    interests_text: str = Field("", description="Optional free-text interests")


@router.post("/")
def get_decision(req: DecisionRequest):
    """
    Primary decision endpoint — fuses Fuzzy Logic + ML + Genetic Algorithm.
    """
    try:
        domain = req.domain if req.domain in DOMAINS else "Tech"
        result = make_decision(req.skill, req.interest, req.risk, domain, req.interests_text)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
def decision_history(limit: int = 20):
    """Returns the last N decisions from the SQLite database."""
    try:
        history = get_history(limit=limit)
        return {"status": "success", "data": history, "count": len(history)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
