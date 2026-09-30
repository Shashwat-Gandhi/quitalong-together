CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT NOT NULL UNIQUE,
  user1_id UUID,
  user2_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  accent_color TEXT NOT NULL DEFAULT '#22c55e',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  pair_id UUID REFERENCES pairs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  cigarettes INTEGER NOT NULL DEFAULT 0 CHECK (cigarettes >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs (user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_users_pair_id ON users (pair_id);

CREATE TABLE IF NOT EXISTS log_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  cigarettes INTEGER NOT NULL DEFAULT 0 CHECK (cigarettes >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_log_events_user_date ON log_events (user_id, log_date DESC, created_at DESC);
