"""
Upgraded Simulation Service — INR salary values, 1/3/5 year projections.
All salary values are in Indian Rupees (1 USD = 83 INR).
"""

from typing import List
from app.utils.currency import usd_to_inr, format_inr

# Base salaries are listed in USD, auto-converted to INR
_BASE_SALARIES_USD = {
    "Elite Path":               75000,
    "Entrepreneurship":         55000,
    "Creative Professional":    45000,
    "Technical Specialist":     80000,
    "Balanced Growth":          55000,
    "Skill Development Needed": 38000,
    "Career Pivot Advised":     45000,
    "Risk Reassessment":        40000,
    # ML career paths
    "AI/ML Engineer / Senior Developer":             90000,
    "Junior Developer / IT Support Analyst":         45000,
    "Senior Business Analyst / Product Manager":     85000,
    "Sales Associate / Admin Executive":             40000,
    "Senior UX Designer / Creative Director":        72000,
    "Freelance Artist / Content Producer":           42000,
    "Research Scientist / Senior Data Analyst":      80000,
    "Lab Technician / Research Assistant":           48000,
    "Healthcare Specialist / Clinical Lead":         78000,
    "Healthcare Assistant / Allied Health Technician":42000,
    # GA top career paths
    "AI / ML Engineer":         95000,
    "Full-Stack Developer":     80000,
    "Data Scientist":           90000,
    "Cybersecurity Analyst":    85000,
    "Product Manager":          85000,
    "Business Analyst":         70000,
    "Entrepreneur / Founder":   55000,
    "Marketing Strategist":     62000,
    "UX / Product Designer":    72000,
    "Content Creator / Writer": 45000,
    "Research Scientist":       80000,
    "Biomedical Engineer":      75000,
    "Healthcare Professional":  78000,
    "Pharmacist / Medical Tech":68000,
    "Freelance Specialist":     55000,
    "General Professional":     55000,
    "Career Specialist":        50000,
}

_GROWTH_RATES = {
    "Tech":       [0.10, 0.12, 0.14, 0.15, 0.16],
    "Business":   [0.07, 0.08, 0.09, 0.10, 0.11],
    "Creative":   [0.05, 0.07, 0.08, 0.09, 0.10],
    "Science":    [0.08, 0.09, 0.10, 0.11, 0.12],
    "Healthcare": [0.08, 0.09, 0.10, 0.11, 0.12],
}

_SIMULATION_META = {
    "Elite Path":               {"income_growth": "High (60–120%)", "satisfaction": "Very High", "difficulty": 7},
    "Entrepreneurship":         {"income_growth": "Variable (−50% to +500%)", "satisfaction": "High", "difficulty": 9},
    "Creative Professional":    {"income_growth": "Moderate (30–70%)", "satisfaction": "High", "difficulty": 6},
    "Technical Specialist":     {"income_growth": "High (50–100%)", "satisfaction": "High", "difficulty": 7},
    "Balanced Growth":          {"income_growth": "Moderate (25–55%)", "satisfaction": "Moderate–High", "difficulty": 5},
    "Skill Development Needed": {"income_growth": "Moderate after upskilling (40–80%)", "satisfaction": "Moderate", "difficulty": 6},
    "Career Pivot Advised":     {"income_growth": "Initially drops, then 50–90%", "satisfaction": "High (after pivot)", "difficulty": 7},
    "Risk Reassessment":        {"income_growth": "Low-Moderate (15–35%)", "satisfaction": "Improving", "difficulty": 4},
}

_MILESTONES = {
    "Elite Path":               ["Month 3: Land flagship project", "Year 1: Advanced certification", "Year 2: Mentor juniors", "Year 4: Speak at industry event"],
    "Entrepreneurship":         ["Month 6: Launch MVP", "Year 1: 100 paying customers", "Year 2: Break-even", "Year 4: Series A or profitability"],
    "Creative Professional":    ["Month 6: Strong portfolio (10 pieces)", "Year 1: First big brand client", "Year 3: Award or feature", "Year 5: Creative director"],
    "Technical Specialist":     ["Month 6: Open-source contribution", "Year 1: Side project shipped", "Year 3: Industry certification", "Year 5: Book or course"],
    "Balanced Growth":          ["Month 6: Online specialization", "Year 1: Promotion or raise", "Year 3: Adjacent skills", "Year 5: Team leadership"],
    "Skill Development Needed": ["Month 3: Enroll in program", "Month 9: First freelance project", "Year 2: Full-time role", "Year 4: Senior contributor"],
    "Career Pivot Advised":     ["Month 6: Shadow new field", "Year 1: Portfolio pivot", "Year 2: Full-time pivot", "Year 4: Leadership position"],
    "Risk Reassessment":        ["Month 3: Emergency fund", "Month 9: One growth opportunity", "Year 2: Low-risk move", "Year 5: Re-evaluate risk"],
}


def _get_base_inr(career_path: str) -> int:
    """Resolve a career path to a base INR salary."""
    usd = _BASE_SALARIES_USD.get(career_path)
    if usd is None:
        for key, val in _BASE_SALARIES_USD.items():
            if key.lower() in career_path.lower() or career_path.lower() in key.lower():
                usd = val
                break
    if usd is None:
        usd = 50000
    return usd_to_inr(usd)


def _get_salary_chart(career_path: str, domain: str = "Tech") -> List[dict]:
    """Returns 5-year salary chart data with INR values for Recharts."""
    base_inr = _get_base_inr(career_path)
    rates = _GROWTH_RATES.get(domain, _GROWTH_RATES["Tech"])
    chart = [{"year": "Now", "salary": base_inr, "salary_fmt": format_inr(base_inr)}]
    salary = base_inr
    for idx, rate in enumerate(rates):
        salary = int(salary * (1 + rate))
        chart.append({
            "year": f"Year {idx + 1}",
            "salary": salary,
            "salary_fmt": format_inr(salary),
        })
    return chart


def simulate_future(career_path: str, domain: str = "Tech") -> dict:
    meta = _SIMULATION_META.get(career_path, _SIMULATION_META["Balanced Growth"])
    milestones = _MILESTONES.get(career_path, _MILESTONES["Balanced Growth"])
    salary_chart = _get_salary_chart(career_path, domain)

    # 1 / 3 / 5 year projections
    year_1 = salary_chart[1]["salary"] if len(salary_chart) > 1 else salary_chart[0]["salary"]
    year_3 = salary_chart[3]["salary"] if len(salary_chart) > 3 else salary_chart[-1]["salary"]
    year_5 = salary_chart[5]["salary"] if len(salary_chart) > 5 else salary_chart[-1]["salary"]

    return {
        "career_path":   career_path,
        "domain":        domain,
        "salary_chart":  salary_chart,
        "peak_salary":   salary_chart[-1]["salary"],
        "peak_salary_fmt": format_inr(salary_chart[-1]["salary"]),
        "year_1_salary": year_1,
        "year_1_fmt":    format_inr(year_1),
        "year_3_salary": year_3,
        "year_3_fmt":    format_inr(year_3),
        "year_5_salary": year_5,
        "year_5_fmt":    format_inr(year_5),
        "milestones":    milestones,
        "currency":      "INR",
        "usd_rate":      83,
        **meta,
    }


def list_career_paths() -> List[str]:
    return list(_SIMULATION_META.keys())
