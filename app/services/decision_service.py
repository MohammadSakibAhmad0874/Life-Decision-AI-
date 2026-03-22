"""
Upgraded Decision Service — uses trained joblib ML model, domain input, saves to SQLite.
"""

from app.models.fuzzy_logic import apply_fuzzy_rules
from app.models.genetic_algo import run_genetic_algorithm
from app.db.database import save_decision

# Lazy import ML to avoid startup errors if model not yet trained
def _ml_predict(skill, interest, risk, domain):
    try:
        from app.ml.train_model import predict_profile
        return predict_profile(skill, interest, risk, domain)
    except Exception:
        # Fallback: simple rule-based probability
        prob = min(0.99, max(0.01, (skill * 0.4 + interest * 0.3 + (10 - risk) * 0.3) / 10))
        return {
            "prediction": 1 if prob > 0.5 else 0,
            "probability": round(prob, 4),
            "label": "Likely to Succeed" if prob > 0.5 else "Needs Improvement",
            "career_path": "General Professional",
        }


def make_decision(skill: float, interest: float, risk: float,
                  domain: str = "Tech", interests_text: str = "") -> dict:
    """
    Aggregates Fuzzy Logic + ML (trained model) + Genetic Algorithm.
    Saves result to SQLite. Returns unified decision payload.
    """
    # --- Fuzzy Logic (domain-aware) ---
    fuzzy_path, fuzzy_advice, fuzzy_confidence = apply_fuzzy_rules(skill, interest, risk, domain)

    # --- ML Model (joblib or fallback) ---
    ml_result = _ml_predict(skill, interest, risk, domain)

    # --- Genetic Algorithm (domain-filtered, top-3 careers) ---
    ga_result = run_genetic_algorithm(skill, interest, risk, domain)

    # --- Decision Fusion ---
    ga_norm = min(1.0, ga_result["fitness_score"] * 4)
    overall_score = round(
        fuzzy_confidence * 0.30 + ml_result["probability"] * 0.50 + ga_norm * 0.20, 3
    )

    # Suggested path: prefer ML career if model is trained, else fuzzy path
    from app.ml.train_model import is_trained
    if is_trained():
        suggested_path = ml_result.get("career_path", fuzzy_path)
    else:
        suggested_path = fuzzy_path

    # Risk label
    if risk <= 3:
        risk_label = "Low Risk"
    elif risk <= 6:
        risk_label = "Moderate Risk"
    else:
        risk_label = "High Risk"

    result = {
        "suggested_path": suggested_path,
        "fuzzy_path": fuzzy_path,
        "advice": fuzzy_advice,
        "domain": domain,
        "risk_label": risk_label,
        "overall_score": overall_score,
        "fuzzy": {
            "path": fuzzy_path,
            "confidence": fuzzy_confidence,
        },
        "ml": ml_result,
        "genetic_algorithm": ga_result,
    }

    # Persist to SQLite
    try:
        save_decision(skill, interest, risk, domain, result)
    except Exception:
        pass  # non-critical

    return result
