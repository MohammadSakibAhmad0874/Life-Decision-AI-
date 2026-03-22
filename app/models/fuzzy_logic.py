"""
Upgraded Fuzzy Logic Decision Engine — domain-aware + salary-weighted rules.
"""

from typing import Tuple

DOMAIN_SALARY_BOOST = {
    "Tech":       0.15,
    "Business":   0.08,
    "Creative":   -0.05,
    "Science":    0.10,
    "Healthcare": 0.12,
}

DOMAIN_DEMAND_BOOST = {
    "Tech":       0.20,
    "Business":   0.05,
    "Creative":   -0.10,
    "Science":    0.08,
    "Healthcare": 0.18,
}


def _membership(value: float, low: float, high: float) -> float:
    """Linear membership function returning 0–1."""
    if value <= low:
        return 0.0
    if value >= high:
        return 1.0
    return (value - low) / (high - low)


def _fuzzify(skill: float, interest: float, risk: float):
    return {
        "skill_low":    _membership(10 - skill, 5, 10),
        "skill_med":    1 - abs(_membership(skill, 3, 7) - 0.5) * 2,
        "skill_high":   _membership(skill, 5, 10),
        "interest_low": _membership(10 - interest, 5, 10),
        "interest_med": 1 - abs(_membership(interest, 3, 7) - 0.5) * 2,
        "interest_high":_membership(interest, 5, 10),
        "risk_low":     _membership(10 - risk, 5, 10),
        "risk_med":     1 - abs(_membership(risk, 3, 7) - 0.5) * 2,
        "risk_high":    _membership(risk, 5, 10),
    }


def apply_fuzzy_rules(skill: float, interest: float, risk: float,
                      domain: str = "Tech") -> Tuple[str, str, float]:
    f = _fuzzify(skill, interest, risk)

    domain_s_boost = DOMAIN_SALARY_BOOST.get(domain, 0.0)
    domain_d_boost = DOMAIN_DEMAND_BOOST.get(domain, 0.0)

    # Rule activations (min for AND)
    rules = {
        "Elite Path":              min(f["skill_high"], f["interest_high"], f["risk_low"]),
        "Entrepreneurship":        min(f["skill_high"], f["interest_high"], f["risk_high"]),
        "Creative Professional":   min(f["skill_med"],  f["interest_high"], f["risk_med"]),
        "Technical Specialist":    min(f["skill_high"], f["interest_med"],  f["risk_low"]),
        "Balanced Growth":         min(f["skill_med"],  f["interest_med"],  f["risk_med"]),
        "Skill Development Needed":min(f["skill_low"],  f["interest_med"],  f["risk_low"]),
        "Career Pivot Advised":    min(f["skill_low"],  f["interest_high"], f["risk_med"]),
        "Risk Reassessment":       min(f["skill_low"],  f["interest_low"],  f["risk_high"]),
    }

    best_path = max(rules, key=rules.get)
    raw_confidence = rules[best_path]

    # Domain-weighted confidence boost
    confidence = round(min(1.0, raw_confidence + domain_s_boost * 0.3 + domain_d_boost * 0.2), 3)

    advice_map = {
        "Elite Path":              f"You have top-tier skills and passion in {domain} with low risk — pursue flagship roles now.",
        "Entrepreneurship":        f"High skills + high interest + risk appetite in {domain} — you're wired to build something.",
        "Creative Professional":   f"Channel your passion into creative or people-focused {domain} roles.",
        "Technical Specialist":    f"Go deep in {domain}, specialize, become the go-to expert.",
        "Balanced Growth":         f"Consistent effort in {domain} will yield steady, sustainable success.",
        "Skill Development Needed":f"Invest 6–12 months upskilling in {domain} before making major moves.",
        "Career Pivot Advised":    f"Your passion points elsewhere in {domain} — consider a strategic pivot.",
        "Risk Reassessment":       f"Revisit goals; reduce exposure before committing to {domain} roles.",
    }

    return best_path, advice_map[best_path], confidence
