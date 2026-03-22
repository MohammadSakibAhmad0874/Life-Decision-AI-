"""
Upgraded Simulation route — supports domain parameter for chart data.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.simulation_service import simulate_future, list_career_paths

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])


class SimulationRequest(BaseModel):
    career_path: str
    domain: str = "Tech"


@router.post("/")
def run_simulation(req: SimulationRequest):
    """Returns 5-year simulation with salary chart data for the given career path."""
    try:
        result = simulate_future(req.career_path, req.domain)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/paths")
def get_career_paths():
    """Lists all available career paths for simulation."""
    return {"status": "success", "paths": list_career_paths()}
