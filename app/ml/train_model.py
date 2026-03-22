"""
ML Training Pipeline — trains a Decision Tree on real career data.
Auto-trains on first use if /models/model.pkl not found.
"""

import os
import joblib
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix

from app.data.data_loader import load_and_preprocess, encode_profile, DOMAINS

_BASE   = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR   = os.path.join(_BASE, "models")
MODEL_PATH   = os.path.join(MODELS_DIR, "model.pkl")     # as requested
SCALER_PATH  = os.path.join(MODELS_DIR, "scaler.pkl")
ENCODER_PATH = os.path.join(MODELS_DIR, "encoder.pkl")

# Runtime cache
_model = _scaler = _label_encoder = None

# Career path map: domain + prediction → title
_CAREER_MAP = {
    ("Tech",       1): "AI/ML Engineer / Senior Developer",
    ("Tech",       0): "Junior Developer / IT Support Analyst",
    ("Business",   1): "Senior Business Analyst / Product Manager",
    ("Business",   0): "Sales Associate / Admin Executive",
    ("Creative",   1): "Senior UX Designer / Creative Director",
    ("Creative",   0): "Freelance Artist / Content Producer",
    ("Science",    1): "Research Scientist / Senior Data Analyst",
    ("Science",    0): "Lab Technician / Research Assistant",
    ("Healthcare", 1): "Healthcare Specialist / Clinical Lead",
    ("Healthcare", 0): "Healthcare Assistant / Allied Health Technician",
}


def train(force_rebuild: bool = False) -> dict:
    """
    Train Decision Tree (+ Logistic Regression as baseline) on real CSV data.
    Returns performance metrics dict. Saves model to /models/model.pkl
    """
    global _model, _scaler, _label_encoder

    X_train, X_test, y_train, y_test, scaler, le, feature_cols = \
        load_and_preprocess(force=force_rebuild)

    candidates = {
        "Decision Tree": DecisionTreeClassifier(
            random_state=42, max_depth=10, min_samples_leaf=10,
            class_weight="balanced", criterion="gini",
        ),
        "Logistic Regression": LogisticRegression(
            random_state=42, max_iter=1000, C=1.0, class_weight="balanced",
        ),
    }

    best_name, best_model, best_acc = None, None, -1.0
    all_metrics: dict = {}

    for name, clf in candidates.items():
        clf.fit(X_train, y_train)
        y_pred  = clf.predict(X_test)
        acc     = accuracy_score(y_test, y_pred)
        f1      = f1_score(y_test, y_pred, average="weighted")
        report  = classification_report(y_test, y_pred, output_dict=True)
        cm      = confusion_matrix(y_test, y_pred).tolist()
        all_metrics[name] = {
            "accuracy":      round(acc,  4),
            "f1_score":      round(f1,   4),
            "precision_0":   round(report.get("0", {}).get("precision", 0), 4),
            "recall_0":      round(report.get("0", {}).get("recall",    0), 4),
            "precision_1":   round(report.get("1", {}).get("precision", 0), 4),
            "recall_1":      round(report.get("1", {}).get("recall",    0), 4),
            "confusion_matrix": cm,
        }
        print(f"[Train] {name}: accuracy={acc:.4f}, f1={f1:.4f}")
        if acc > best_acc:
            best_acc   = acc
            best_name  = name
            best_model = clf

    # Save best model
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(best_model, MODEL_PATH)
    joblib.dump(scaler,     SCALER_PATH)
    joblib.dump(le,         ENCODER_PATH)
    print(f"[Train] Best model saved: {best_name} ({best_acc:.4f}) → {MODEL_PATH}")

    _model         = best_model
    _scaler        = scaler
    _label_encoder = le

    return {
        "best_model":     best_name,
        "best_accuracy":  round(best_acc, 4),
        "dataset_source": "Real CSVs (education_career_success + glassdoor_jobs + job_skills)",
        "dataset_size":   len(X_train) + len(X_test),
        "train_size":     len(X_train),
        "test_size":      len(X_test),
        "features":       list(feature_cols),
        "metrics":        all_metrics,
    }


def _load_artifacts():
    global _model, _scaler, _label_encoder
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model         = joblib.load(MODEL_PATH)
            _scaler        = joblib.load(SCALER_PATH)
            _label_encoder = joblib.load(ENCODER_PATH)
        else:
            print("[Train] No saved model found — auto-training on real data…")
            train()


def predict_profile(skill: float, interest: float, risk: float,
                    domain: str, job_demand: float = 7.0,
                    expected_salary: float = 55000.0) -> dict:
    """Predict success probability and best career for a user profile."""
    _load_artifacts()

    X = encode_profile(skill, interest, risk, domain,
                       job_demand, expected_salary, _scaler, _label_encoder)

    prediction  = int(_model.predict(X)[0])
    proba_arr   = _model.predict_proba(X)[0]
    proba       = float(proba_arr[1]) if len(proba_arr) > 1 else float(prediction)
    career_path = _CAREER_MAP.get((domain, prediction),
                                  _CAREER_MAP.get(("Tech", prediction), "Career Specialist"))
    return {
        "prediction":  prediction,
        "probability": round(proba, 4),
        "label":       "Likely to Succeed" if prediction == 1 else "Needs More Development",
        "career_path": career_path,
    }


def is_trained() -> bool:
    return os.path.exists(MODEL_PATH)
