"""
Roadmap Route — generate personalized learning roadmap.
POST /api/roadmap
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.roadmap_service import generate_roadmap

router = APIRouter(prefix="/api", tags=["Roadmap"])


class RoadmapRequest(BaseModel):
    skill:       float = Field(5.0, ge=0, le=10)
    domain:      str   = "Tech"
    career_path: str   = ""


@router.post("/roadmap")
def get_roadmap(req: RoadmapRequest):
    try:
        roadmap = generate_roadmap(req.skill, req.domain, req.career_path)
        return {"status": "success", "data": roadmap}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
