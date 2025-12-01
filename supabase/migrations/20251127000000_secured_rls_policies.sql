-- Migration: Enhanced Row Level Security (RLS) Policies
-- Implements granular access controls to prevent unauthorized data access

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow public read access" ON users;
DROP POLICY IF EXISTS "Allow service role full access" ON users;
DROP POLICY IF EXISTS "Allow public read access" ON rewards;
DROP POLICY IF EXISTS "Allow service role full access" ON rewards;
DROP POLICY IF EXISTS "Allow public read access" ON activity_log;
DROP POLICY IF EXISTS "Allow service role full access" ON activity_log;

-- Users table RLS policies
-- Allow users to read their own data and data within their experience
CREATE POLICY "Users can view own data and experience data" ON users
  FOR SELECT USING (
    user_id = auth.uid()::text
    OR experience_id IN (
      SELECT experience_id FROM user_memberships 
      WHERE user_id = auth.uid()::text
    )
  );

-- Allow users to update only their own data
CREATE POLICY "Users can update own data only" ON users
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Allow service role to access only with proper context
CREATE POLICY "Service role access with context" ON users
  FOR ALL TO service_role
  USING (
    EXISTS (
      SELECT 1 FROM app_settings 
      WHERE setting_key = 'service_role_enabled' 
      AND setting_value = 'true'
    )
  );

-- Rewards table RLS policies
-- Allow users to view their own rewards and rewards for their experiences
CREATE POLICY "Users can view own rewards" ON rewards
  FOR SELECT USING (
    user_id = auth.uid()::text
    OR experience_id IN (
      SELECT experience_id FROM user_memberships 
      WHERE user_id = auth.uid()::text
    )
  );

-- Service role policy for rewards
CREATE POLICY "Service role rewards access" ON rewards
  FOR ALL TO service_role
  USING (
    EXISTS (
      SELECT 1 FROM app_settings 
      WHERE setting_key = 'service_role_enabled' 
      AND setting_value = 'true'
    )
  );

-- Activity log RLS policies
-- Allow users to view their own activity logs
CREATE POLICY "Users can view own activity logs" ON activity_log
  FOR SELECT USING (
    user_id = auth.uid()::text
    OR experience_id IN (
      SELECT experience_id FROM user_memberships 
      WHERE user_id = auth.uid()::text
    )
  );

-- Service role policy for activity_log
CREATE POLICY "Service role activity log access" ON activity_log
  FOR ALL TO service_role
  USING (
    EXISTS (
      SELECT 1 FROM app_settings 
      WHERE setting_key = 'service_role_enabled' 
      AND setting_value = 'true'
    )
  );

-- Create a helper function for experience-based authorization
CREATE OR REPLACE FUNCTION check_user_experience_access(p_user_id TEXT, p_experience_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 
    FROM users 
    WHERE user_id = p_user_id 
    AND experience_id = p_experience_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to set experience context for service operations
CREATE OR REPLACE FUNCTION set_experience_context(exp_id TEXT)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_experience_id', exp_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if current user has access to an experience
CREATE OR REPLACE FUNCTION user_has_experience_access(p_experience_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 
    FROM user_memberships 
    WHERE user_id = auth.uid()::text 
    AND experience_id = p_experience_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable RLS on all tables (should already be enabled but ensuring)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON users, rewards, activity_log TO authenticated;
GRANT INSERT, UPDATE ON users TO authenticated;
GRANT INSERT ON activity_log TO authenticated;