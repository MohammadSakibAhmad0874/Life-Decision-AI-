"""
Upgraded Mentor API route — accepts optional user context for profile-aware responses.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.mentor_service import get_mentor_response

router = APIRouter(prefix="/api/mentor", tags=["Mentor"])


class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None  # suggested_path, overall_score, domain


@router.post("/chat")
def chat(req: ChatRequest):
    """Receives user message + optional profile context, returns mentor response."""
    try:
        if not req.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty.")
        result = get_mentor_response(req.message, req.context)
        return {"status": "success", "data": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
