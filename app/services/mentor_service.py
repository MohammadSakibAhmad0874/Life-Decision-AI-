"""
Upgraded AI Mentor Service — profile-aware chatbot with reasoning + warnings.
"""

import re
from typing import Tuple


_RULES: list[Tuple[list[str], str, str]] = [
    (
        ["hello", "hi", "hey", "start", "begin"],
        "Hello! I'm your AI Life Mentor 🤖. I've analysed thousands of career profiles and I'm here to help you make smarter decisions.",
        "What aspect of your life would you like to work on today?",
    ),
    (
        ["skill", "skills", "learn", "learning", "study", "improve", "upskill"],
        "Skills are the highest-ROI investment you can make 📚. Focus on ONE high-demand skill and go deep — mastery beats breadth early in a career. Use platforms like Coursera, fast.ai, or YouTube.",
        "Which skill area interests you most — technical (coding/AI), creative (design/writing), or interpersonal (leadership/sales)?",
    ),
    (
        ["risk", "risky", "afraid", "fear", "scared", "safe", "safety", "uncertain"],
        "Risk is not the enemy — unmanaged risk is 🎯. Every meaningful career involves calculated risk. Build a 6-month financial safety net, then take bold moves. Your AI risk score breaks this down numerically.",
        "What specific risk are you most concerned about — financial, career change, or starting something new?",
    ),
    (
        ["career", "job", "work", "profession", "field", "industry", "path"],
        "Choosing the right career is about aligning skills, passions, *and* market demand 💼. The GA optimizer in your report shows the highest-fitness careers based on your profile data.",
        "Are you looking to go deeper in your current field, or considering a pivot to something new?",
    ),
    (
        ["tech", "technology", "coding", "programming", "software", "ai", "data"],
        "Tech is the highest-demand domain globally 💻. AI/ML engineers earn ₹78–95 lakhs/year. Data scientists and cybersecurity analysts are among the top-earning roles. Your Tech domain score is aligned with this.",
        "Are you interested in building AI systems, writing software, or working with data analytics?",
    ),
    (
        ["business", "entrepreneur", "startup", "founder", "product", "manager"],
        "Business and entrepreneurship reward execution over education 🚀. Your profile's risk tolerance score is particularly important here — high risk tolerance + strong skills is the founder profile.",
        "Are you thinking about launching a startup, or advancing within a corporate structure?",
    ),
    (
        ["creative", "design", "art", "ux", "content", "writing", "media"],
        "Creative careers reward consistency and portfolio quality 🎨. Build in public — document your process, share your work. Your interest score is a strong indicator of creative career satisfaction.",
        "Are you focused on digital design, writing/content, or traditional creative arts?",
    ),
    (
        ["science", "research", "healthcare", "medical", "biology", "chemistry"],
        "Science and Healthcare offer high stability and strong job demand 🔬. These domains have some of the highest job_demand scores in our dataset (8.5–9.0 out of 10).",
        "Are you aiming for research, clinical work, or applied science in industry?",
    ),
    (
        ["salary", "money", "income", "earn", "rich", "wealth", "finance", "rupee", "inr", "lakh"],
        "Financial growth follows value creation 💰. Your simulation tab shows projected salary curves in Indian Rupees (₹) over 5 years. Tech salaries start at ₹37–79 lakhs and grow to ₹70–1.5 crore over 5 years. Healthcare and Business are strong 2nd and 3rd.",
        "Is your goal short-term income boost, or long-term wealth building through compounding career growth?",
    ),
    (
        ["motivation", "motivate", "unmotivated", "lazy", "procrastinate", "stuck", "focus"],
        "Motivation follows action, not the other way around 🔥. Set a 25-minute timer and work on ONE task. After that sprint, momentum builds itself. Also check that your goals match your interest score.",
        "What is the ONE most important task you keep putting off?",
    ),
    (
        ["stress", "anxiety", "anxious", "overwhelmed", "burnout", "tired", "exhausted"],
        "Burnout is a signal that your approach — not your goal — needs to change ❤️. Protect deep work hours, sleep 7–8h, and ruthlessly cut low-value commitments.",
        "On a scale of 1–10, how would you rate your current energy and focus levels?",
    ),
    (
        ["score", "result", "report", "decision", "analysis", "percentage"],
        "Your overall score is calculated by fusing three AI engines: Fuzzy Logic (rule confidence), ML model (trained success probability), and Genetic Algorithm (optimised career fitness) 📊. Each contributes differently to your final score.",
        "Would you like me to explain any of the three AI components in more detail?",
    ),
    (
        ["model", "machine learning", "logistic", "decision tree", "algorithm", "neural"],
        "The ML model is trained on real career data with features: skill, interest, risk, domain, salary, and job demand 🤖. It uses Logistic Regression and Decision Tree classifiers, picking the best performer.",
        "Have you clicked 'Train Model' in the app? It runs the full training pipeline and shows you live accuracy metrics.",
    ),
    (
        ["genetic", "ga", "optimizer", "optimization", "chromosome"],
        "The Genetic Algorithm simulates evolution 🧬. Each 'chromosome' represents a life strategy (study, network, start business, etc.). Over 60 generations, it evolves the highest-fitness strategy for your specific profile.",
        "Are you curious about what 'fitness' means in this context — career salary, success probability, or job demand?",
    ),
    (
        ["explain", "why", "reason", "because", "factor", "impact", "influence"],
        "Great question — let me explain the drivers 🔍. Your skill level has the highest weight in the ML model (typically 35–40%). Interest level is 2nd (25–30%). Risk tolerance influences which career paths are recommended. Check the 'Decision Report' tab for the full XAI breakdown.",
        "Which factor would you like to understand more — skill, interest, or risk?",
    ),
    (
        ["warn", "warning", "danger", "mistake", "avoid", "pitfall", "trap"],
        "Here are the top career pitfalls to avoid ⚠️: 1) Ignoring market demand and following only passion. 2) Low skill with high risk = burn rate with no return. 3) Not building a network until you need one. 4) Comparing your early-stage to someone else's peak.",
        "Which of these pitfalls resonates most with your current situation?",
    ),
    (
        ["fuzzy", "logic", "rules", "membership", "uncertainty"],
        "Fuzzy Logic handles the grey areas of life decisions 🔵. Unlike binary yes/no, it measures degree of membership — so 'somewhat skilled' gets a partial score. This makes career advice more realistic.",
        "Would you like me to walk you through which fuzzy rules fired for your profile?",
    ),
    (
        ["goal", "goals", "dream", "vision", "future", "plan", "target"],
        "Great goals are SMART: Specific, Measurable, Achievable, Relevant, Time-bound 🎯. Write your top 3 goals for the next 12 months and review weekly.",
        "What is your single most important goal for the next 12 months?",
    ),
    (
        ["network", "networking", "connect", "connection", "linkedin", "mentor"],
        "Your network is your net worth 🤝. One warm introduction is worth 100 cold applications. Your GA top actions likely include 'Network More' — this is specifically tuned to your profile.",
        "Are you currently networking online (LinkedIn), offline (events), or both?",
    ),
    (
        ["roadmap", "plan", "steps", "how to", "start", "beginning", "path"],
        "Your personalized roadmap is available in the 'Roadmap' tab 🗺️. It provides a 12-month, month-by-month learning plan tailored to your domain and skill level. Each step has specific, actionable tasks.",
        "Which month of the roadmap would you like to start with?",
    ),
    (
        ["compare", "comparison", "vs", "versus", "better", "difference", "choose"],
        "The 'Compare' tab lets you compare any two career paths side-by-side ⚖️. You'll see salary (₹), success probability, growth rate, job demand, and satisfaction — so you can make a data-driven choice.",
        "Which two careers are you choosing between?",
    ),
    (
        ["thank", "thanks", "helpful", "great", "awesome", "good", "perfect"],
        "You're very welcome! Remember — the best time to start was yesterday, the second best time is NOW 🌟. Keep making progress, even if it's small.",
        "Is there anything else I can help you with?",
    ),
    (
        ["bye", "goodbye", "exit", "quit", "done", "finish", "close"],
        "Best of luck on your journey! 🌈 Progress over perfection. Come back anytime.",
        "",
    ),
]

_FALLBACK = (
    "That's a great question 🤔. Based on what I know: the best decisions combine self-awareness (your skill/interest scores) with market data (job demand, salary in ₹). Try running a full analysis in the Profile Input tab.",
    "Could you tell me more about your specific situation so I can give you more targeted advice?",
)


def _build_warnings(context: dict | None, skill: float = 5, risk: float = 5) -> list[str]:
    """Generate contextual warnings based on profile data."""
    warnings = []
    if context:
        skill_val = context.get("ml", {}).get("probability", 0.5)
        score     = context.get("overall_score", 0.5)
        domain    = context.get("domain", "")
        path      = context.get("suggested_path", "")

        if score < 0.35:
            warnings.append("⚠️ Your overall AI score is below 35% — significant upskilling recommended before a major career move.")
        if skill_val < 0.4:
            warnings.append("⚠️ ML model predicts low success probability. Consider strengthening core technical skills first.")
        if "risk" in path.lower() or "pivot" in path.lower():
            warnings.append("⚠️ Your profile suggests a career pivot. This typically involves a 6–12 month income dip before recovery.")
    return warnings


def _build_reasoning(context: dict | None, matched_keywords: list) -> str:
    """Build a short reasoning explanation."""
    if not context:
        return ""
    score  = context.get("overall_score", 0)
    domain = context.get("domain", "")
    path   = context.get("suggested_path", "")
    ml_prob = context.get("ml", {}).get("probability", 0)
    fuzzy_conf = context.get("fuzzy", {}).get("confidence", 0)

    reasons = []
    dominant = "ML model" if ml_prob > fuzzy_conf else "Fuzzy Logic rules"
    reasons.append(f"Decision driven primarily by: **{dominant}**")
    if ml_prob > 0.6:
        reasons.append(f"ML predicts {round(ml_prob * 100)}% success probability")
    if score > 0.6:
        reasons.append(f"Strong overall alignment with **{domain}** domain")
    elif score < 0.35:
        reasons.append(f"Low overall score ({round(score * 100)}%) suggests skill gaps")
    return " · ".join(reasons) if reasons else ""


def get_mentor_response(message: str, context: dict | None = None) -> dict:
    """
    Profile-aware mentor response with reasoning and warnings.
    """
    message_lower = message.lower()
    tokens = re.findall(r"\b\w+\b", message_lower)

    best_match   = None
    best_score   = 0
    matched_kws  = []

    for keywords, response, follow_up in _RULES:
        score = sum(1 for kw in keywords if kw in tokens or kw in message_lower)
        if score > best_score:
            best_score  = score
            best_match  = (response, follow_up)
            matched_kws = keywords

    if not best_match:
        response, follow_up = _FALLBACK
    else:
        response, follow_up = best_match

    # Inject profile context if available
    if context and best_score > 0:
        path      = context.get("suggested_path", "")
        score_val = context.get("overall_score", 0)
        domain    = context.get("domain", "")
        if path:
            response += f"\n\n📌 *Your current profile suggests: **{path}** (Score: {round(score_val*100)}%) in **{domain}**.*"

    reasoning = _build_reasoning(context, matched_kws)
    warnings  = _build_warnings(context)

    return {
        "response":   response,
        "follow_up":  follow_up,
        "matched":    best_score > 0,
        "reasoning":  reasoning,
        "warnings":   warnings,
    }
