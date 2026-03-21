-- ─── Life Decision AI — Insforge DB Schema ──────────────────────────────────
-- Run via: insforge db import insforge/schema.sql

-- 1. Users table (mirrors Insforge auth.users via user_id UUID)
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,          -- links to Insforge auth user
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  plan_type    TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'premium')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Decisions table
CREATE TABLE IF NOT EXISTS decisions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_level     NUMERIC(5,2),
  interest_level  NUMERIC(5,2),
  risk_tolerance  NUMERIC(5,2),
  domain          TEXT,
  result_score    NUMERIC(5,2),
  suggested_path  TEXT,
  fuzzy_score     NUMERIC(5,2),
  ml_probability  NUMERIC(5,2),
  result_json     JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. History table
CREATE TABLE IF NOT EXISTS history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  decision_id UUID REFERENCES decisions(id) ON DELETE SET NULL,
  career      TEXT,
  score       INTEGER,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_decisions_created  ON decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_user_id    ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_timestamp  ON history(timestamp DESC);

-- 5. Count today's predictions for a user (freemium check)
CREATE OR REPLACE FUNCTION count_today_predictions(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM decisions
  WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
$$ LANGUAGE sql STABLE;
