"""
Upgraded Genetic Algorithm Optimizer.
Fitness function: success_prob * 0.50 + salary_potential * 0.30 + job_demand * 0.20
Returns top 3 optimized career options with full details.
"""

import random
from typing import List

GENE_LABELS = ["Study Hard", "Network More", "Start Business", "Upskill", "Relocate"]

POPULATION_SIZE = 40
GENERATIONS     = 60
MUTATION_RATE   = 0.12
ELITE_SIZE      = 5   # top elites always survive

# Career options pool with salary and demand metadata
_CAREER_OPTIONS = [
    {"name": "AI / ML Engineer",         "domain": "Tech",       "salary": 95000, "demand": 9.5},
    {"name": "Full-Stack Developer",      "domain": "Tech",       "salary": 80000, "demand": 8.8},
    {"name": "Data Scientist",            "domain": "Tech",       "salary": 90000, "demand": 9.0},
    {"name": "Cybersecurity Analyst",     "domain": "Tech",       "salary": 85000, "demand": 8.5},
    {"name": "Product Manager",           "domain": "Business",   "salary": 85000, "demand": 8.0},
    {"name": "Business Analyst",          "domain": "Business",   "salary": 70000, "demand": 7.5},
    {"name": "Entrepreneur / Founder",    "domain": "Business",   "salary": 60000, "demand": 6.0},
    {"name": "Marketing Strategist",      "domain": "Business",   "salary": 62000, "demand": 7.0},
    {"name": "UX / Product Designer",     "domain": "Creative",   "salary": 72000, "demand": 7.8},
    {"name": "Content Creator / Writer",  "domain": "Creative",   "salary": 45000, "demand": 6.5},
    {"name": "Research Scientist",        "domain": "Science",    "salary": 80000, "demand": 7.5},
    {"name": "Biomedical Engineer",       "domain": "Science",    "salary": 75000, "demand": 7.8},
    {"name": "Healthcare Professional",   "domain": "Healthcare", "salary": 78000, "demand": 9.0},
    {"name": "Pharmacist / Medical Tech", "domain": "Healthcare", "salary": 68000, "demand": 8.5},
    {"name": "Freelance Specialist",      "domain": "Creative",   "salary": 55000, "demand": 6.0},
]

MAX_SALARY = max(c["salary"] for c in _CAREER_OPTIONS)
MAX_DEMAND = 10.0


def _fitness(chromosome: List[float], career: dict,
             skill: float, interest: float, risk: float) -> float:
    # Chromosome gene synergy score
    gene_weights = [skill * 0.15, interest * 0.15, risk * 0.12, skill * 0.13, risk * 0.10]
    gene_score = sum(g * w for g, w in zip(chromosome, gene_weights)) / 10.0

    # Career metrics (normalised 0–1)
    salary_score = career["salary"] / MAX_SALARY
    demand_score = career["demand"] / MAX_DEMAND

    # Weighted fitness
    return gene_score * 0.35 + salary_score * 0.35 + demand_score * 0.30


def _crossover(p1: List[float], p2: List[float]) -> List[float]:
    point = random.randint(1, len(p1) - 1)
    return p1[:point] + p2[point:]


def _mutate(chromosome: List[float]) -> List[float]:
    return [
        round(min(1.0, max(0.0, g + random.uniform(-0.25, 0.25))), 3)
        if random.random() < MUTATION_RATE else g
        for g in chromosome
    ]


def run_genetic_algorithm(skill: float, interest: float, risk: float,
                           domain: str = "Tech") -> dict:
    s, i, r = skill / 10, interest / 10, risk / 10

    # Filter careers by domain (prefer same domain, but keep all for diversity)
    preferred = [c for c in _CAREER_OPTIONS if c["domain"] == domain]
    other     = [c for c in _CAREER_OPTIONS if c["domain"] != domain]
    career_pool = preferred + other[:5]  # domain-first + top 5 others

    best_results = []

    for career in career_pool:
        population = [
            [round(random.random(), 3) for _ in range(len(GENE_LABELS))]
            for _ in range(POPULATION_SIZE)
        ]

        for _ in range(GENERATIONS):
            population.sort(key=lambda c: _fitness(c, career, s, i, r), reverse=True)
            elites   = population[:ELITE_SIZE]
            survivors = population[:POPULATION_SIZE // 2]
            offspring = [
                _mutate(_crossover(*random.sample(survivors, 2)))
                for _ in range(POPULATION_SIZE - ELITE_SIZE)
            ]
            population = elites + offspring

        best_chrom   = population[0]
        fit_score    = _fitness(best_chrom, career, s, i, r)
        strategy     = {lb: round(v * 100, 1) for lb, v in zip(GENE_LABELS, best_chrom)}

        best_results.append({
            "career": career["name"],
            "domain": career["domain"],
            "salary_estimate": career["salary"],
            "job_demand": career["demand"],
            "fitness_score": round(fit_score, 4),
            "top_actions": sorted(strategy, key=strategy.get, reverse=True)[:3],
            "strategy": strategy,
        })

    # Sort by fitness, deduplicate domains for top 3
    best_results.sort(key=lambda x: x["fitness_score"], reverse=True)
    top3 = best_results[:3]

    # Gene strategy for display (use best career's chromosome)
    overall_strategy = top3[0]["strategy"] if top3 else {}

    return {
        "top_3_careers": top3,
        "strategy": overall_strategy,
        "top_actions": top3[0]["top_actions"] if top3 else [],
        "fitness_score": top3[0]["fitness_score"] if top3 else 0.0,
    }
