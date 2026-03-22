"""
FastAPI main entry point — Life Decision AI v5.0 (SaaS + Payments)
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from app.db.models import init_db
from app.routes import decision, simulation, mentor, train
from app.routes import compare, roadmap, xai
from app.routes import auth, upgrade, history, payment

app = FastAPI(
    title="Life Decision AI",
    description=(
        "Production SaaS v5.0: Fuzzy Logic + ML + GA + XAI. "
        "JWT Auth · Freemium · Razorpay Payments · ₹ INR."
    ),
    version="5.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://9tw7cbcp.us-east.insforge.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Startup: init SQLite DB tables ──────────────────────────────────────────
@app.on_event("startup")
def startup_event():
    init_db()


# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(upgrade.router)
app.include_router(history.router)
app.include_router(payment.router)
app.include_router(decision.router)
app.include_router(simulation.router)
app.include_router(mentor.router)
app.include_router(train.router)
app.include_router(compare.router)
app.include_router(roadmap.router)
app.include_router(xai.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Life Decision AI v5.0 SaaS 🚀",
        "version": "5.0.0",
        "currency": "INR",
        "auth": "JWT",
        "plans": ["free (3/day)", "premium (₹999/mo)"],
        "payment": "Razorpay",
    }


@app.get("/health", tags=["Health"])
def health():
    from app.ml.train_model import is_trained
    return {"status": "ok", "model_trained": is_trained(), "version": "5.0.0"}
