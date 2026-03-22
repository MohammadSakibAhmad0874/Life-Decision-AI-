"""
SQLite database for persisting user decisions and history.
"""

import os
import sqlite3
import json
from datetime import datetime

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(_BASE_DIR, "data", "decisions.db")


def _get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables if they don't exist."""
    conn = _get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS decisions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp   TEXT NOT NULL,
            skill       REAL,
            interest    REAL,
            risk        REAL,
            domain      TEXT,
            result_json TEXT
        )
    """)
    conn.commit()
    conn.close()


def save_decision(skill: float, interest: float, risk: float,
                  domain: str, result: dict) -> int:
    """Save a decision to the database. Returns the new row id."""
    init_db()
    conn = _get_connection()
    cursor = conn.execute(
        """INSERT INTO decisions (timestamp, skill, interest, risk, domain, result_json)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (
            datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            skill, interest, risk, domain,
            json.dumps(result),
        ),
    )
    conn.commit()
    row_id = cursor.lastrowid
    conn.close()
    return row_id


def get_history(limit: int = 20) -> list:
    """Retrieve the last N decisions ordered by newest first."""
    init_db()
    conn = _get_connection()
    rows = conn.execute(
        "SELECT * FROM decisions ORDER BY id DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()

    history = []
    for row in rows:
        result = json.loads(row["result_json"]) if row["result_json"] else {}
        history.append({
            "id": row["id"],
            "timestamp": row["timestamp"],
            "skill": row["skill"],
            "interest": row["interest"],
            "risk": row["risk"],
            "domain": row["domain"],
            "suggested_path": result.get("suggested_path", "—"),
            "overall_score": result.get("overall_score", 0),
            "risk_label": result.get("risk_label", "—"),
        })
    return history


# Init on import
init_db()
