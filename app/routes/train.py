"""
Train Model route — triggers dataset generation + ML training.
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["Training"])


class TrainRequest(BaseModel):
    rebuild_data: bool = False  # if True, regenerates the dataset


@router.post("/train-model")
def train_model(req: TrainRequest = TrainRequest()):
    """
    Generates the career dataset (if not exists) and trains Logistic Regression + Decision Tree.
    Returns accuracy metrics for both models.
    """
    try:
        from app.ml.train_model import train
        metrics = train(force_rebuild=req.rebuild_data)
        return {"status": "success", "data": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@router.get("/train-model/status")
def model_status():
    """Returns whether a trained model exists."""
    from app.ml.train_model import is_trained
    return {"trained": is_trained()}
