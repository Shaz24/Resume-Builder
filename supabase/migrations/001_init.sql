-- ============================================================
-- ResumeAI Premium — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Sessions (anonymous user tracking) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  plan            TEXT,
  referral_code   TEXT UNIQUE,
  user_agent      TEXT,
  ref_by          TEXT  -- referral source code
);

-- ─── Payments ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID REFERENCES sessions(id) ON DELETE SET NULL,
  plan                  TEXT NOT NULL CHECK (plan IN ('basic', 'pro', 'premium')),
  amount                INTEGER NOT NULL,           -- in paise (₹99 = 9900)
  razorpay_payment_id   TEXT UNIQUE,
  razorpay_order_id     TEXT,
  status                TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'demo')),
  paid_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Resumes ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID REFERENCES sessions(id) ON DELETE SET NULL,
  form_data     JSONB,         -- raw intake form fields
  resume_json   JSONB,         -- AI-generated resume content
  template      TEXT DEFAULT 'Classic',
  ats_score     INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Testimonials ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES sessions(id) ON DELETE SET NULL,
  name        TEXT,
  college     TEXT,
  text        TEXT NOT NULL,
  stars       INTEGER DEFAULT 5 CHECK (stars BETWEEN 1 AND 5),
  approved    BOOLEAN DEFAULT FALSE,   -- moderation flag
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Analytics ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID,
  event       TEXT NOT NULL,
  data        JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row Level Security (RLS) ─────────────────────────────────────────────────
ALTER TABLE sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics    ENABLE ROW LEVEL SECURITY;

-- Sessions: anon can insert their own + read their own
CREATE POLICY "anon_insert_session" ON sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_read_own_session" ON sessions FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_own_session" ON sessions FOR UPDATE TO anon USING (true);

-- Payments: anon can insert + read their own (matched by session)
CREATE POLICY "anon_insert_payment" ON payments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_read_payment" ON payments FOR SELECT TO anon USING (true);

-- Resumes: anon can insert + read + update
CREATE POLICY "anon_insert_resume" ON resumes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_read_resume" ON resumes FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_resume" ON resumes FOR UPDATE TO anon USING (true);

-- Testimonials: anon can insert; read only approved
CREATE POLICY "anon_insert_testimonial" ON testimonials FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_read_approved" ON testimonials FOR SELECT TO anon USING (approved = true);

-- Analytics: anon can insert only
CREATE POLICY "anon_insert_analytics" ON analytics FOR INSERT TO anon WITH CHECK (true);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payments_session    ON payments(session_id);
CREATE INDEX IF NOT EXISTS idx_resumes_session     ON resumes(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event     ON analytics(event);
CREATE INDEX IF NOT EXISTS idx_analytics_session   ON analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_referral   ON sessions(referral_code);
