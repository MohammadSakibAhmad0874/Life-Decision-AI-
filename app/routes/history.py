"""
Decision history routes — per-user storage and retrieval.
/api/save-decision  POST
/api/history        GET
"""
import json
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Any

from app.auth.dependencies import get_current_user
from app.db.models import SessionLocal, Decision

router = APIRouter(prefix="/api", tags=["History"])


class SaveDecisionRequest(BaseModel):
    inputs: dict
    result: dict
    score: float = 0.0
    career: str = ""


@router.post("/save-decision")
def save_decision(req: SaveDecisionRequest, user=Depends(get_current_user)):
    """Save a decision result for the current user."""
    db = SessionLocal()
    try:
        decision = Decision(
            user_id=user["id"],
            inputs_json=json.dumps(req.inputs),
            result_json=json.dumps(req.result),
            score=req.score,
            career=req.career,
        )
        db.add(decision)
        db.commit()
        db.refresh(decision)
        return {"message": "Decision saved.", "id": decision.id}
    finally:
        db.close()


@router.get("/history")
def get_history(limit: int = 10, user=Depends(get_current_user)):
    """Return last N decisions for the current user."""
    db = SessionLocal()
    try:
        decisions = (
            db.query(Decision)
            .filter(Decision.user_id == user["id"])
            .order_by(Decision.created_at.desc())
            .limit(limit)
            .all()
        )
        result = []
        for d in decisions:
            result.append({
                "id": d.id,
                "career": d.career,
                "score": d.score,
                "inputs": json.loads(d.inputs_json),
                "result": json.loads(d.result_json),
                "created_at": str(d.created_at),
            })
        return {"decisions": result, "total": len(result)}
    finally:
        db.close()
