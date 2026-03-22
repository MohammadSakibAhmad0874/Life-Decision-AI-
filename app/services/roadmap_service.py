"""
Personalized Learning Roadmap Service.
Generates a 12-month, month-by-month career learning plan based on domain + skill level.
"""

from typing import List


# Each career domain has a structured learning path
_ROADMAP_TEMPLATES = {
    "Tech": [
        {"month": "Month 1–2",  "focus": "📚 Foundations",       "tasks": ["Complete Python / JavaScript fundamentals course", "Set up GitHub profile and publish first project", "Read 'Clean Code' or 'The Pragmatic Programmer'"]},
        {"month": "Month 3–4",  "focus": "🛠️ Core Skills",       "tasks": ["Build 2 portfolio projects (CRUD app, API, etc.)", "Learn version control (Git branching, PRs)", "Join 1 tech community (Discord, Reddit, Dev.to)"]},
        {"month": "Month 5–6",  "focus": "🤖 AI / ML Track",     "tasks": ["Complete a Machine Learning course (Coursera / fast.ai)", "Practice on Kaggle datasets (top 50% on a competition)", "Build and deploy a simple ML model (Flask / FastAPI)"]},
        {"month": "Month 7–8",  "focus": "🌐 System Design",     "tasks": ["Learn REST API design principles", "Study databases (SQL + NoSQL basics)", "Read intro to System Design (ByteByteGo / Grokking)"]},
        {"month": "Month 9–10", "focus": "💼 Interview Prep",    "tasks": ["Solve 60+ LeetCode problems (Easy + Medium)", "Mock interviews (Pramp / Interviewing.io)", "Update LinkedIn, resume, and GitHub README"]},
        {"month": "Month 11–12","focus": "🚀 Career Launch",     "tasks": ["Apply to 30+ roles or internships", "Build 1 showcase project in target domain", "Connect with 5 professionals via LinkedIn weekly"]},
    ],
    "Business": [
        {"month": "Month 1–2",  "focus": "📊 Business Basics",   "tasks": ["Complete intro to Business Strategy (Coursera)", "Learn Excel / Google Sheets for analysis", "Read 'Zero to One' or 'Good to Great'"]},
        {"month": "Month 3–4",  "focus": "📈 Data & Analytics",  "tasks": ["Learn SQL for business analysis", "Build a dashboard in Tableau or Power BI", "Study market research techniques"]},
        {"month": "Month 5–6",  "focus": "🗣️ Communication",     "tasks": ["Complete a public speaking / presentation course", "Write 4 LinkedIn articles on business topics", "Practice pitching ideas in 2 minutes or less"]},
        {"month": "Month 7–8",  "focus": "💡 Product Thinking",  "tasks": ["Read 'Inspired' by Marty Cagan", "Map a user journey for a product you use daily", "Do 5 user interviews and synthesize findings"]},
        {"month": "Month 9–10", "focus": "🤝 Networking",        "tasks": ["Attend 2 industry events or webinars", "Send 10 cold LinkedIn DMs to professionals you admire", "Join a business association or entrepreneur group"]},
        {"month": "Month 11–12","focus": "🚀 Launch & Apply",    "tasks": ["Apply to PM / BA / MBA programs or roles", "Build a case study portfolio (3 business problems solved)", "Get a reference letter from a mentor or professor"]},
    ],
    "Creative": [
        {"month": "Month 1–2",  "focus": "🎨 Core Craft",        "tasks": ["Master your primary tool (Figma / Adobe / Procreate)", "Complete a design / writing bootcamp or course", "Study 20 pieces of work by designers you admire"]},
        {"month": "Month 3–4",  "focus": "🖼️ Portfolio Build",   "tasks": ["Create 5 diverse portfolio pieces", "Build a personal portfolio website (Behance / Dribbble / own site)", "Share a weekly creative update on social media"]},
        {"month": "Month 5–6",  "focus": "💻 Digital Tools",     "tasks": ["Learn motion / interaction design (Framer / After Effects)", "Complete a UX research mini-course", "Redesign an app you use daily (case study format)"]},
        {"month": "Month 7–8",  "focus": "📣 Build in Public",   "tasks": ["Post work-in-progress content on Twitter / LinkedIn", "Get 500+ followers in your creative niche", "Collaborate with 1 other creator on a project"]},
        {"month": "Month 9–10", "focus": "💰 Monetization",      "tasks": ["Land first freelance client via Upwork / Fiverr / direct outreach", "Price your work confidently (don't undersell)", "Submit work to 3 design competitions or calls for entry"]},
        {"month": "Month 11–12","focus": "🚀 Go Pro",            "tasks": ["Apply to agencies / studios or creative firms", "Pitch your portfolio to 20+ dream companies", "Set up a personal brand (name + niche + style clear)"]},
    ],
    "Science": [
        {"month": "Month 1–2",  "focus": "🔬 Research Methods",  "tasks": ["Complete a scientific writing / research methods MOOC", "Read 10 papers in your target field (use Google Scholar)", "Join a research lab as a volunteer or RA"]},
        {"month": "Month 3–4",  "focus": "📊 Data Analysis",     "tasks": ["Learn Python for data analysis (pandas, NumPy, matplotlib)", "Reproduce results from a published paper", "Build a small dataset and analyze it"]},
        {"month": "Month 5–6",  "focus": "🤝 Academic Network",  "tasks": ["Attend 1 academic conference or seminar", "Email 3 professors about research opportunities", "Join a relevant academic society or association"]},
        {"month": "Month 7–8",  "focus": "✍️ Publishing",        "tasks": ["Co-author or contribute to a research paper", "Write a detailed blog post on a scientific topic", "Submit abstract to a student research symposium"]},
        {"month": "Month 9–10", "focus": "🎓 Advanced Study",    "tasks": ["Prepare for GRE / GATE or relevant entrance exam", "Reach out to 5 PhD / Masters supervisors with your interest", "Write a compelling research statement"]},
        {"month": "Month 11–12","focus": "🚀 Applications",      "tasks": ["Apply to research programs / doctoral programs", "Secure a letter of recommendation from a faculty member", "Finalize research portfolio and publish on Academia.edu"]},
    ],
    "Healthcare": [
        {"month": "Month 1–2",  "focus": "🏥 Clinical Foundations","tasks": ["Review anatomy, physiology, and pathology basics", "Shadow a professional for 1 week (hospital / clinic)", "Enroll in a first aid / CPR certification"]},
        {"month": "Month 3–4",  "focus": "📋 Evidence-Based Practice","tasks": ["Study clinical research methodology", "Read clinical guidelines in your specialty area", "Complete an online healthcare ethics course"]},
        {"month": "Month 5–6",  "focus": "🧑‍💻 Health Technology", "tasks": ["Learn basics of Electronic Health Records (EHR)", "Explore telehealth platforms and digital health apps", "Take an intro to health informatics course"]},
        {"month": "Month 7–8",  "focus": "🤝 Professional Network","tasks": ["Join a medical / health professional association", "Attend 1 healthcare conference or grand rounds", "Find a mentor who is 5 years ahead of your target role"]},
        {"month": "Month 9–10", "focus": "📝 Licensing / Exams",  "tasks": ["Prepare for licensing exam (USMLE / NCLEX / board relevant)", "Do 500+ practice MCQs in your specialty", "Form a study group with 3–5 peers"]},
        {"month": "Month 11–12","focus": "🚀 Career Entry",       "tasks": ["Apply for residency / internship / entry-level healthcare role", "Prepare a professional CV with clinical experiences", "Apply to 3 fellowship or scholarship opportunities"]},
    ],
}

_SKILL_ADJUSTMENTS = {
    "beginner": "Focus extra time on Month 1–2 fundamentals before advancing.",
    "intermediate": "You can move faster through early months. Add a stretch project in Month 4.",
    "advanced": "Skip basics and jump to Month 5+. Focus on leadership and visible output.",
}

_CAREER_FOCUS = {
    "AI / ML Engineer":           "Emphasize Python, data skills, and ML frameworks (PyTorch, TensorFlow).",
    "Data Scientist":             "Focus on statistics, Python, SQL, and storytelling with data.",
    "Cybersecurity Analyst":      "Add: CompTIA Security+, TryHackMe labs, network fundamentals.",
    "Product Manager":            "Emphasize user research, roadmapping, and stakeholder communication.",
    "Business Analyst":           "Focus on SQL, process mapping, and requirements gathering.",
    "UX / Product Designer":      "Prioritize user research, Figma, and interaction design principles.",
    "Research Scientist":         "Add: academic publishing, grant writing, and lab techniques.",
    "Healthcare Professional":    "Add: clinical hours, licensing prep, and patient communication.",
}


def generate_roadmap(skill: float, domain: str, career_path: str = "") -> dict:
    """
    Generate a 12-month personalized roadmap.
    - skill 0–4: beginner
    - skill 5–7: intermediate
    - skill 8–10: advanced
    """
    domain_key = domain if domain in _ROADMAP_TEMPLATES else "Tech"
    steps = _ROADMAP_TEMPLATES[domain_key]

    skill_tier = "beginner" if skill < 4 else ("advanced" if skill >= 8 else "intermediate")
    skill_note = _SKILL_ADJUSTMENTS[skill_tier]

    career_focus = ""
    if career_path:
        for key, note in _CAREER_FOCUS.items():
            if key.lower() in career_path.lower() or career_path.lower() in key.lower():
                career_focus = note
                break

    return {
        "domain":       domain,
        "career_path":  career_path or f"{domain} Professional",
        "skill_tier":   skill_tier,
        "skill_note":   skill_note,
        "career_focus": career_focus,
        "months":       steps,
        "total_months": 12,
    }
