-- Migration: Fix Missing Tables for RLS
-- Creates user_memberships and app_settings tables which are referenced by RLS policies

-- ============================================
-- 1. User Memberships Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  experience_id TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate memberships
  CONSTRAINT unique_user_membership UNIQUE (user_id, experience_id)
);

CREATE INDEX IF NOT EXISTS idx_user_memberships_lookup
  ON user_memberships(user_id, experience_id);

-- Enable RLS
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_memberships
CREATE POLICY "Users can view own memberships" ON user_memberships
  FOR SELECT USING (user_id = auth.uid()::text);

-- ============================================
-- 2. App Settings Table
-- ============================================
CREATE TABLE IF NOT EXISTS app_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_settings
CREATE POLICY "Public read access for settings" ON app_settings
  FOR SELECT USING (true);

-- Only service role can update settings
CREATE POLICY "Service role update settings" ON app_settings
  FOR ALL TO service_role USING (true);

-- ============================================
-- 3. Seed Default Settings
-- ============================================
INSERT INTO app_settings (setting_key, setting_value, description)
VALUES 
  ('service_role_enabled', 'true', 'Enables service role access context checks')
ON CONFLICT (setting_key) DO NOTHING;
