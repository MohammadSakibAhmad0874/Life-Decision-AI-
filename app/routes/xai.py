"""
XAI Route — expose model feature importance.
GET  /api/explain
POST /api/explain/prediction  (per-prediction explanation)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.utils.xai import get_feature_importance, explain_prediction

router = APIRouter(prefix="/api", tags=["XAI"])


class ExplainRequest(BaseModel):
    skill:         float = Field(5.0, ge=0, le=10)
    interest:      float = Field(5.0, ge=0, le=10)
    risk:          float = Field(5.0, ge=0, le=10)
    domain:        str   = "Tech"
    overall_score: float = 0.5


@router.get("/explain")
def explain_model():
    """Returns global feature importance of the trained model."""
    try:
        return {"status": "success", "data": get_feature_importance()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/explain/prediction")
def explain_single(req: ExplainRequest):
    """Returns per-prediction drivers for a specific profile."""
    try:
        explanation = explain_prediction(
            req.skill, req.interest, req.risk, req.domain, req.overall_score
        )
        return {"status": "success", "data": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
