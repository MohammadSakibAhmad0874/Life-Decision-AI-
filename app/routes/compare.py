"""
Career Comparison Route — compare two career paths side-by-side.
POST /api/compare
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.utils.currency import usd_to_inr, format_inr

router = APIRouter(prefix="/api", tags=["Compare"])

# Career data registry
_CAREER_REGISTRY = {
    "AI / ML Engineer":             {"domain": "Tech",       "salary_usd": 95000, "job_demand": 9.5, "difficulty": 8, "growth_rate": 0.15, "satisfaction": 85},
    "Data Scientist":               {"domain": "Tech",       "salary_usd": 90000, "job_demand": 9.0, "difficulty": 7, "growth_rate": 0.14, "satisfaction": 82},
    "Full-Stack Developer":         {"domain": "Tech",       "salary_usd": 80000, "job_demand": 8.5, "difficulty": 7, "growth_rate": 0.12, "satisfaction": 78},
    "Cybersecurity Analyst":        {"domain": "Tech",       "salary_usd": 85000, "job_demand": 8.5, "difficulty": 7, "growth_rate": 0.13, "satisfaction": 80},
    "Product Manager":              {"domain": "Business",   "salary_usd": 85000, "job_demand": 8.0, "difficulty": 7, "growth_rate": 0.11, "satisfaction": 83},
    "Business Analyst":             {"domain": "Business",   "salary_usd": 70000, "job_demand": 7.5, "difficulty": 6, "growth_rate": 0.09, "satisfaction": 75},
    "Entrepreneur / Founder":       {"domain": "Business",   "salary_usd": 55000, "job_demand": 7.0, "difficulty": 9, "growth_rate": 0.20, "satisfaction": 88},
    "Marketing Strategist":         {"domain": "Business",   "salary_usd": 62000, "job_demand": 7.0, "difficulty": 6, "growth_rate": 0.09, "satisfaction": 72},
    "UX / Product Designer":        {"domain": "Creative",   "salary_usd": 72000, "job_demand": 7.5, "difficulty": 6, "growth_rate": 0.10, "satisfaction": 84},
    "Content Creator / Writer":     {"domain": "Creative",   "salary_usd": 45000, "job_demand": 6.5, "difficulty": 5, "growth_rate": 0.08, "satisfaction": 80},
    "Research Scientist":           {"domain": "Science",    "salary_usd": 80000, "job_demand": 8.0, "difficulty": 8, "growth_rate": 0.10, "satisfaction": 79},
    "Biomedical Engineer":          {"domain": "Science",    "salary_usd": 75000, "job_demand": 7.5, "difficulty": 8, "growth_rate": 0.11, "satisfaction": 77},
    "Healthcare Professional":      {"domain": "Healthcare", "salary_usd": 78000, "job_demand": 9.0, "difficulty": 8, "growth_rate": 0.10, "satisfaction": 82},
    "Pharmacist / Medical Tech":    {"domain": "Healthcare", "salary_usd": 68000, "job_demand": 8.0, "difficulty": 7, "growth_rate": 0.09, "satisfaction": 76},
    "Software Engineer":            {"domain": "Tech",       "salary_usd": 82000, "job_demand": 9.0, "difficulty": 7, "growth_rate": 0.12, "satisfaction": 80},
    "Data Analyst":                 {"domain": "Tech",       "salary_usd": 65000, "job_demand": 8.5, "difficulty": 6, "growth_rate": 0.11, "satisfaction": 77},
    "Cloud Architect":              {"domain": "Tech",       "salary_usd": 110000,"job_demand": 9.5, "difficulty": 9, "growth_rate": 0.16, "satisfaction": 85},
    "Finance Analyst":              {"domain": "Business",   "salary_usd": 68000, "job_demand": 7.5, "difficulty": 6, "growth_rate": 0.08, "satisfaction": 73},
}


def _get_career_data(name: str) -> dict | None:
    """Exact or partial match."""
    if name in _CAREER_REGISTRY:
        return {**_CAREER_REGISTRY[name], "name": name}
    for key, val in _CAREER_REGISTRY.items():
        if key.lower() in name.lower() or name.lower() in key.lower():
            return {**val, "name": key}
    return None


def _build_career_profile(career_name: str, skill: float, interest: float,
                           risk: float) -> dict:
    data = _get_career_data(career_name)
    if not data:
        # Generic fallback
        data = {"domain": "General", "salary_usd": 50000, "job_demand": 7.0,
                "difficulty": 5, "growth_rate": 0.08, "satisfaction": 70, "name": career_name}

    salary_inr = usd_to_inr(data["salary_usd"])
    salary_5yr  = usd_to_inr(int(data["salary_usd"] * (1 + data["growth_rate"]) ** 5))

    # Simple success probability heuristic
    demand_factor = data["job_demand"] / 10.0
    skill_factor  = skill / 10.0
    diff_penalty  = (10 - data["difficulty"]) / 10.0
    success_prob  = round((skill_factor * 0.4 + interest / 10 * 0.3 + demand_factor * 0.2 + diff_penalty * 0.1) * 100, 1)

    return {
        "name":         data["name"],
        "domain":       data["domain"],
        "salary_inr":   salary_inr,
        "salary_inr_fmt": format_inr(salary_inr),
        "salary_5yr_inr": salary_5yr,
        "salary_5yr_fmt": format_inr(salary_5yr),
        "job_demand":   data["job_demand"],
        "difficulty":   data["difficulty"],
        "growth_pct":   round(data["growth_rate"] * 100, 1),
        "satisfaction": data["satisfaction"],
        "success_prob": min(99.0, success_prob),
    }


class CompareRequest(BaseModel):
    career_a: str
    career_b: str
    skill:    float = Field(5.0, ge=0, le=10)
    interest: float = Field(5.0, ge=0, le=10)
    risk:     float = Field(5.0, ge=0, le=10)
    domain:   str   = "Tech"


@router.post("/compare")
def compare_careers(req: CompareRequest):
    try:
        a = _build_career_profile(req.career_a, req.skill, req.interest, req.risk)
        b = _build_career_profile(req.career_b, req.skill, req.interest, req.risk)

        # Determine winner per category
        winner = {
            "salary":       a["name"] if a["salary_inr"] >= b["salary_inr"] else b["name"],
            "growth":       a["name"] if a["growth_pct"] >= b["growth_pct"]  else b["name"],
            "success":      a["name"] if a["success_prob"] >= b["success_prob"] else b["name"],
            "demand":       a["name"] if a["job_demand"] >= b["job_demand"]   else b["name"],
            "satisfaction": a["name"] if a["satisfaction"] >= b["satisfaction"] else b["name"],
        }

        return {"status": "success", "career_a": a, "career_b": b,
                "winner": winner, "career_list": list(_CAREER_REGISTRY.keys())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/careers")
def list_careers():
    """Return the list of known careers for dropdowns."""
    return {"careers": list(_CAREER_REGISTRY.keys())}
