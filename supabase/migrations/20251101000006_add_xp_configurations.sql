-- Migration: Add XP Configurations Table
-- Per IMPLEMENTATION_PLAN.md Phase 2 and DIAGNOSTIC_REPORT.md Issue #12
-- Allows premium users to customize XP rates for their communities

CREATE TABLE xp_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id TEXT NOT NULL UNIQUE,
  xp_per_message INTEGER CHECK (xp_per_message > 0 AND xp_per_message <= 1000),
  min_xp_per_post INTEGER CHECK (min_xp_per_post > 0 AND min_xp_per_post <= 1000),
  max_xp_per_post INTEGER CHECK (max_xp_per_post > 0 AND max_xp_per_post <= 1000),
  xp_per_reaction INTEGER CHECK (xp_per_reaction > 0 AND xp_per_reaction <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CHECK (max_xp_per_post >= min_xp_per_post)
);

-- Index for fast lookups by experience_id
CREATE INDEX idx_xp_config_experience ON xp_configurations(experience_id);

-- Enable Row Level Security
ALTER TABLE xp_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access" ON xp_configurations
  FOR SELECT USING (true);

CREATE POLICY "Allow service role full access" ON xp_configurations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Auto-update updated_at trigger
CREATE TRIGGER update_xp_configurations_updated_at 
  BEFORE UPDATE ON xp_configurations
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
