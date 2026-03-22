"""
Real Data Loader — loads, merges, and preprocesses actual CSV datasets from /data.

Strategy:
  1. `education_career_success.csv` → PRIMARY backbone (skill scores, GPA, internships, salary, field)
  2. `Salary Data.csv`              → salary enrichment by education level
  3. `glassdoor_jobs.csv`           → sector demand (sampled 5k rows for speed) + rating signal
  4. `job_skills.csv`               → job category demand (row frequency per category)
"""

import os
import re
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split

_BASE   = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA    = os.path.join(_BASE, "data")
OUT_CSV = os.path.join(DATA, "training_dataset.csv")

# ── Domain mappings ──────────────────────────────────────────────────────────
_FIELD_TO_DOMAIN = {
    "computer science": "Tech", "information technology": "Tech",
    "software engineering": "Tech", "data science": "Tech",
    "engineering": "Tech", "electrical": "Tech", "mechanical": "Tech",
    "business administration": "Business", "business": "Business",
    "management": "Business", "finance": "Business",
    "accounting": "Business", "economics": "Business",
    "marketing": "Business", "entrepreneurship": "Business",
    "graphic design": "Creative", "art": "Creative",
    "communications": "Creative", "media": "Creative",
    "journalism": "Creative", "design": "Creative",
    "biology": "Science", "chemistry": "Science", "physics": "Science",
    "environmental": "Science", "biochemistry": "Science",
    "mathematics": "Science", "statistics": "Science",
    "nursing": "Healthcare", "medicine": "Healthcare",
    "pharmacy": "Healthcare", "health": "Healthcare",
    "psychology": "Healthcare", "public health": "Healthcare",
}

_SECTOR_TO_DOMAIN = {
    "information technology": "Tech", "finance": "Business",
    "healthcare": "Healthcare", "education": "Science",
    "media": "Creative", "retail": "Business",
    "manufacturing": "Business", "biotech": "Science",
    "business services": "Business", "oil": "Science",
    "consulting": "Business", "real estate": "Business",
    "government": "Business", "non-profit": "Creative",
    "telecommunications": "Tech", "aerospace": "Tech",
    "insurance": "Business", "arts": "Creative",
}

_CATEGORY_TO_DOMAIN = {
    "software": "Tech", "data science": "Tech",
    "product management": "Business", "program management": "Business",
    "hardware": "Tech", "manufacturing": "Tech",
    "sales": "Business", "marketing": "Creative",
    "design": "Creative", "business strategy": "Business",
    "finance": "Business", "legal": "Business",
    "human resources": "Business", "technical": "Tech",
    "network": "Tech", "information technology": "Tech",
    "research": "Science", "quality": "Tech",
    "customer": "Business", "operations": "Business",
}

DOMAINS = ["Tech", "Business", "Creative", "Science", "Healthcare"]


def _vec_map(series: pd.Series, mapping: dict, default: str = "Tech") -> pd.Series:
    """Vectorised keyword → domain using str.contains (regex=False for speed)."""
    s = series.fillna("").str.lower()
    result = pd.Series(default, index=series.index, dtype=str)
    for kw, dom in mapping.items():
        mask = s.str.contains(kw, na=False, regex=False)
        result = result.where(~mask, dom)
    return result


def _fast_salary_parse(col: pd.Series) -> pd.Series:
    """
    Fast salary parsing using a single str.extract (no MultiIndex).
    Input examples: '$45K-$65K (Glassdoor est.)' or '70000-90000'
    Extracts first two numbers and returns midpoint.
    """
    # Extract first number and optionally second
    extracted = col.str.extract(r"(\d[\d,]*)\D*(\d[\d,]*)?")
    lo = pd.to_numeric(extracted[0].str.replace(",", "", regex=False), errors="coerce")
    hi = pd.to_numeric(extracted[1].str.replace(",", "", regex=False), errors="coerce").fillna(lo)
    mid = (lo + hi) / 2
    # If values look like thousands (< 1000), scale up
    mid = mid.where(mid >= 1000, mid * 1000)
    return mid


# ────────────────────────────────────────────────────────────────────────────
# Glassdoor aggregates — sample 5000 rows for speed on large file
# ────────────────────────────────────────────────────────────────────────────
def _load_glassdoor_aggregates() -> pd.DataFrame:
    path = os.path.join(DATA, "glassdoor_jobs.csv")
    if not os.path.exists(path):
        return pd.DataFrame()
    try:
        # Count rows first without loading everything
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            total_rows = sum(1 for _ in f) - 1  # minus header
        # Sample fraction to get ~5000 rows max for speed
        skip_n = max(1, total_rows // 5000)
        skip_rows = list(range(1, total_rows + 1, skip_n))  # rows to skip
        # Keep only first 5000 sampled rows
        df = pd.read_csv(path, usecols=["Job Title", "Salary Estimate", "Rating", "Sector"],
                         skiprows=skip_rows[:max(0, total_rows - 5000)],
                         nrows=5000, low_memory=False)

        df["sal"]    = _fast_salary_parse(df["Salary Estimate"])
        df["Rating"] = pd.to_numeric(df["Rating"], errors="coerce")
        df["domain"] = _vec_map(df["Sector"], _SECTOR_TO_DOMAIN)

        agg = df.groupby("domain").agg(
            gd_avg_salary=("sal",       "mean"),
            gd_avg_rating=("Rating",    "mean"),
            gd_job_count =("Job Title", "count"),
        ).reset_index()
        agg["gd_demand"] = (agg["gd_job_count"] / agg["gd_job_count"].max() * 10).round(2)
        print(f"[DataLoader] glassdoor: {len(df)} sampled rows, {len(agg)} domains")
        return agg
    except Exception as e:
        print(f"[DataLoader] glassdoor skip: {e}")
        return pd.DataFrame()


# ────────────────────────────────────────────────────────────────────────────
# job_skills demand aggregates
# ────────────────────────────────────────────────────────────────────────────
def _load_job_skills_aggregates() -> pd.DataFrame:
    path = os.path.join(DATA, "job_skills.csv")
    if not os.path.exists(path):
        return pd.DataFrame()
    try:
        df = pd.read_csv(path, usecols=["Category"], nrows=20000, low_memory=False)
        df["domain"] = _vec_map(df["Category"], _CATEGORY_TO_DOMAIN)
        agg = df.groupby("domain").size().reset_index(name="js_posting_count")
        agg["js_demand"] = (agg["js_posting_count"] / agg["js_posting_count"].max() * 10).round(2)
        print(f"[DataLoader] job_skills: {len(df)} rows, {len(agg)} domains")
        return agg[["domain", "js_demand"]]
    except Exception as e:
        print(f"[DataLoader] job_skills skip: {e}")
        return pd.DataFrame()


# ────────────────────────────────────────────────────────────────────────────
# Primary dataset: education_career_success.csv
# ────────────────────────────────────────────────────────────────────────────
def _load_education_career() -> pd.DataFrame:
    path = os.path.join(DATA, "education_career_success.csv")
    df = pd.read_csv(path, low_memory=False)

    df["domain"] = _vec_map(df["Field_of_Study"], _FIELD_TO_DOMAIN)

    # skill_level (0–10) from GPA, certs, internships, projects
    gpa_n  = df["University_GPA"].fillna(df["University_GPA"].median()) / 4.0 * 3.5
    certs  = df["Certifications"].fillna(0).clip(0, 5)  / 5.0 * 2.0
    intern = df["Internships_Completed"].fillna(0).clip(0, 4) / 4.0 * 2.5
    proj   = df["Projects_Completed"].fillna(0).clip(0, 5)   / 5.0 * 2.0
    df["skill_level"] = (gpa_n + certs + intern + proj).clip(0, 10).round(2)

    # interest_level (0–10): average of soft_skills + networking
    df["interest_level"] = (
        df["Soft_Skills_Score"].fillna(5).clip(0, 10) +
        df["Networking_Score"].fillna(5).clip(0, 10)
    ) / 2

    # risk_tolerance from entrepreneurship flag
    df["risk_tolerance"] = df["Entrepreneurship"].map(
        {"Yes": 7.5, "No": 4.0}
    ).fillna(df["Work_Life_Balance"].fillna(5).astype(float))

    df["expected_salary"] = pd.to_numeric(df["Starting_Salary"], errors="coerce").fillna(50000)

    # success_label: salary ≥ median AND satisfaction ≥ 7 AND job_offers ≥ 2
    sat  = pd.to_numeric(df["Career_Satisfaction"], errors="coerce").fillna(5)
    jobs = pd.to_numeric(df["Job_Offers"],          errors="coerce").fillna(0)
    df["success_label"] = (
        (df["expected_salary"] >= df["expected_salary"].median()) &
        (sat >= 7) & (jobs >= 2)
    ).astype(int)

    print(f"[DataLoader] education_career: {len(df)} rows")
    return df[["domain","skill_level","interest_level","risk_tolerance",
               "expected_salary","success_label"]].copy()


# ────────────────────────────────────────────────────────────────────────────
# Public build
# ────────────────────────────────────────────────────────────────────────────
def build_training_dataset(force: bool = False) -> pd.DataFrame:
    """Build & cache the merged training dataset."""
    if not force and os.path.exists(OUT_CSV):
        print(f"[DataLoader] Loading cached dataset: {OUT_CSV}")
        return pd.read_csv(OUT_CSV)

    print("[DataLoader] Building training dataset from real CSVs…")

    primary = _load_education_career()
    gd_agg  = _load_glassdoor_aggregates()
    js_agg  = _load_job_skills_aggregates()

    if not gd_agg.empty:
        primary = primary.merge(
            gd_agg[["domain","gd_avg_salary","gd_demand"]], on="domain", how="left"
        )
    else:
        primary["gd_avg_salary"] = np.nan
        primary["gd_demand"]     = 7.0

    if not js_agg.empty:
        primary = primary.merge(js_agg, on="domain", how="left")
    else:
        primary["js_demand"] = 7.0

    primary["job_demand"] = (
        primary["gd_demand"].fillna(7.0) * 0.5 +
        primary["js_demand"].fillna(7.0) * 0.5
    ).round(2)

    gd_sal = primary.get("gd_avg_salary", primary["expected_salary"]).fillna(primary["expected_salary"])
    primary["expected_salary"] = (primary["expected_salary"] * 0.6 + gd_sal * 0.4).round(0)

    out_cols = ["domain","skill_level","interest_level","risk_tolerance",
                "expected_salary","job_demand","success_label"]
    df = primary[out_cols].dropna(subset=["skill_level","interest_level"]).copy()

    df.to_csv(OUT_CSV, index=False)
    print(f"[DataLoader] Saved {len(df)} rows → {OUT_CSV}")
    return df


def load_and_preprocess(force: bool = False):
    """Load real dataset, encode, scale, split. Returns train/test components."""
    df = build_training_dataset(force=force)

    le = LabelEncoder()
    df["domain_enc"] = le.fit_transform(df["domain"])

    feature_cols = ["skill_level","interest_level","risk_tolerance",
                    "domain_enc","expected_salary","job_demand"]
    X = df[feature_cols].values
    y = df["success_label"].values

    scaler   = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"[DataLoader] Train={len(X_train)}, Test={len(X_test)}, "
          f"Success rate={y.mean():.2%}")
    return X_train, X_test, y_train, y_test, scaler, le, feature_cols


def encode_profile(skill, interest, risk, domain, job_demand, expected_salary,
                   scaler: StandardScaler, label_encoder: LabelEncoder) -> np.ndarray:
    """Encode a single user profile for inference."""
    try:
        domain_enc = int(label_encoder.transform([domain])[0])
    except Exception:
        domain_enc = 0
    raw = np.array([[skill, interest, risk, domain_enc, expected_salary, job_demand]])
    return scaler.transform(raw)
