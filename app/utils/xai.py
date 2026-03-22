"""
Explainable AI (XAI) utilities — extract feature importance from trained model.
Feature order matches train_model.py: [skill_level, interest_level, risk_tolerance,
                                       domain_enc, expected_salary, job_demand]
"""

from __future__ import annotations
import os

FEATURE_NAMES = [
    "skill_level",
    "interest_level",
    "risk_tolerance",
    "domain_enc",
    "expected_salary",
    "job_demand",
]

# Human-readable labels for the user-facing features
FEATURE_LABELS = {
    "skill_level":     "Skill Level",
    "interest_level":  "Interest Level",
    "risk_tolerance":  "Risk Tolerance",
    "domain_enc":      "Career Domain",
    "expected_salary": "Expected Salary",
    "job_demand":      "Job Market Demand",
}


def _get_importances_from_model(model) -> dict[str, float]:
    """Extract importances from a Decision Tree or LogisticRegression model."""
    try:
        # Decision Tree / Random Forest
        importances = list(model.feature_importances_)
        total = sum(importances) or 1.0
        return {FEATURE_NAMES[i]: round(imp / total, 4) for i, imp in enumerate(importances)}
    except AttributeError:
        pass
    try:
        # Logistic Regression — use absolute coefficient magnitudes
        coefs = list(abs(model.coef_[0]))
        total = sum(coefs) or 1.0
        return {FEATURE_NAMES[i]: round(c / total, 4) for i, c in enumerate(coefs)}
    except Exception:
        return {}


def get_feature_importance() -> dict:
    """
    Returns feature importance for user-facing features (skill, interest, risk).
    Falls back to heuristic weights if model not trained.
    """
    try:
        from app.ml.train_model import _load_artifacts, _model
        _load_artifacts()
        from app.ml import train_model as tm
        if tm._model is None:
            raise ValueError("Model not loaded")
        importances = _get_importances_from_model(tm._model)
    except Exception:
        # Heuristic fallback
        importances = {
            "skill_level":     0.40,
            "interest_level":  0.30,
            "risk_tolerance":  0.10,
            "domain_enc":      0.10,
            "expected_salary": 0.05,
            "job_demand":      0.05,
        }

    # Build user-facing breakdown (only 3 primary sliders shown in UI)
    skill_imp    = importances.get("skill_level",    0.40)
    interest_imp = importances.get("interest_level", 0.30)
    risk_imp     = importances.get("risk_tolerance", 0.10)
    domain_imp   = importances.get("domain_enc",     0.10)
    salary_imp   = importances.get("expected_salary",0.05)
    demand_imp   = importances.get("job_demand",     0.05)

    return {
        "feature_importances": {
            name: {
                "importance": importances.get(name, 0.0),
                "label": FEATURE_LABELS.get(name, name),
                "percentage": round(importances.get(name, 0.0) * 100, 1),
            }
            for name in FEATURE_NAMES
        },
        "top_factors": sorted(
            [
                {"feature": FEATURE_LABELS[n], "importance": importances.get(n, 0.0),
                 "percentage": round(importances.get(n, 0.0) * 100, 1)}
                for n in FEATURE_NAMES
            ],
            key=lambda x: x["importance"],
            reverse=True,
        )[:3],
        "user_facing": {
            "skill_impact":    round(skill_imp    * 100, 1),
            "interest_impact": round(interest_imp * 100, 1),
            "risk_impact":     round(risk_imp     * 100, 1),
            "domain_impact":   round(domain_imp   * 100, 1),
            "salary_impact":   round(salary_imp   * 100, 1),
            "demand_impact":   round(demand_imp   * 100, 1),
        },
        "source": "model" if "importances" in dir() else "heuristic",
    }


def explain_prediction(skill: float, interest: float, risk: float,
                        domain: str, overall_score: float) -> dict:
    """
    Returns a human-readable explanation of what drove a specific prediction.
    """
    fi = get_feature_importance()
    ui = fi["user_facing"]

    contributions = [
        ("Your Skill Level",    skill    / 10.0, ui["skill_impact"]),
        ("Your Interest Level", interest / 10.0, ui["interest_impact"]),
        ("Your Risk Appetite",  risk     / 10.0, ui["risk_impact"]),
    ]

    drivers = []
    for label, user_val, weight_pct in contributions:
        contribution = round(user_val * weight_pct / 100, 3)
        drivers.append({
            "factor":       label,
            "user_value":   round(user_val * 10, 1),  # 0–10
            "weight_pct":   weight_pct,
            "contribution": contribution,
            "positive":     user_val >= 0.5,
        })

    return {
        "overall_score":     overall_score,
        "drivers":           drivers,
        "feature_weights":   ui,
        "summary":           _build_summary(drivers, domain),
    }


def _build_summary(drivers: list, domain: str) -> str:
    top = max(drivers, key=lambda d: d["weight_pct"])
    bottom = min(drivers, key=lambda d: d["weight_pct"])
    pos_drivers = [d for d in drivers if d["positive"]]
    neg_drivers = [d for d in drivers if not d["positive"]]
    parts = []
    if pos_drivers:
        parts.append(f"Strongest driver: {top['factor']} ({top['weight_pct']}% weight)")
    if neg_drivers:
        parts.append(f"Needs improvement: {', '.join(d['factor'] for d in neg_drivers)}")
    parts.append(f"Domain: {domain}")
    return ". ".join(parts) + "."
