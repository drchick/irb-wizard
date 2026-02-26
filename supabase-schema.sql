-- =============================================================
-- IRBWiz — Supabase Database Schema
-- Run this in the Supabase SQL Editor (in order)
-- Project: https://qdavqrpmzgyxkmjirwos.supabase.co
-- =============================================================


-- -----------------------------------------------
-- 1. user_credits
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS user_credits (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits    INT DEFAULT 3 NOT NULL CHECK (credits >= 0),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_credits_owner" ON user_credits
  USING (auth.uid() = user_id);


-- -----------------------------------------------
-- 2. purchases  (Stripe idempotency log)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS purchases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email        TEXT,
  plan              TEXT,
  credits           INT,
  amount_cents      INT,
  status            TEXT DEFAULT 'completed',
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "purchases_owner_read" ON purchases
  FOR SELECT USING (auth.uid() = user_id);


-- -----------------------------------------------
-- 3. promo_codes
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS promo_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code       TEXT UNIQUE NOT NULL,
  credits    INT NOT NULL,
  max_uses   INT,
  uses       INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
-- No user-facing SELECT policy; all reads go through service-role API routes


-- -----------------------------------------------
-- 4. promo_redemptions
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS promo_redemptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code       TEXT NOT NULL,
  credits    INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, code)
);

ALTER TABLE promo_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promo_redemptions_owner" ON promo_redemptions
  USING (auth.uid() = user_id);


-- -----------------------------------------------
-- 5. usage_logs  (AI call tracking)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS usage_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  endpoint   TEXT,
  section    TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
-- No user-facing SELECT policy; all reads go through service-role API routes


-- -----------------------------------------------
-- 6. DB Trigger: auto-grant 3 credits on signup
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 3)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
