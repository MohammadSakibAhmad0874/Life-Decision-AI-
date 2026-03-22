"""
Neural Network / ML Model using Logistic Regression (scikit-learn).
Predicts success probability based on skill, interest, and risk inputs.
"""

import os
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_DATA_PATH = os.path.join(_BASE_DIR, "data", "sample_dataset.csv")

# Build and train the pipeline at import time (in-memory for MVP)
_pipeline: Pipeline | None = None


def _train() -> Pipeline:
    df = pd.read_csv(_DATA_PATH)
    X = df[["skill_level", "interest_score", "risk_tolerance"]].values
    y = df["outcome"].values
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(random_state=42, max_iter=500)),
    ])
    pipeline.fit(X, y)
    return pipeline


def get_model() -> Pipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = _train()
    return _pipeline


def predict_success(skill: float, interest: float, risk: float) -> dict:
    """
    Returns:
      - prediction: 1 (likely success) or 0 (needs work)
      - probability: float 0.0–1.0 probability of success
    """
    model = get_model()
    X = np.array([[skill, interest, risk]])
    prediction = int(model.predict(X)[0])
    probabilities = model.predict_proba(X)[0]
    prob_success = float(probabilities[1])
    return {
        "prediction": prediction,
        "probability": round(prob_success, 3),
        "label": "Likely to Succeed" if prediction == 1 else "Needs Improvement",
    }
