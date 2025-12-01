-- supabase/migrations/004_production_ready_schema.sql

-- ============================================
-- 1. Users Table with Optimized Indexes
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  experience_id TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'enterprise', 'lifetime')),
  total_messages INTEGER NOT NULL DEFAULT 0 CHECK (total_messages >= 0),
  total_posts INTEGER NOT NULL DEFAULT 0 CHECK (total_posts >= 0),
  total_reactions INTEGER NOT NULL DEFAULT 0 CHECK (total_reactions >= 0),
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate user-experience combinations
  CONSTRAINT user_experience_unique UNIQUE (user_id, experience_id)
);

-- Composite index for fastest lookups
CREATE INDEX IF NOT EXISTS idx_users_user_exp
  ON users(user_id, experience_id);

-- Leaderboard query optimization
CREATE INDEX IF NOT EXISTS idx_users_leaderboard
  ON users(experience_id, xp DESC, created_at);

-- Time-based queries (BRIN for large tables)
CREATE INDEX IF NOT EXISTS idx_users_activity_time
  ON users USING BRIN (last_activity_at);

-- ============================================
-- 2. XP Configurations Table (for premium features)
-- ============================================
CREATE TABLE IF NOT EXISTS xp_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id TEXT NOT NULL,
  xp_per_message INTEGER,
  min_xp_per_post INTEGER,
  max_xp_per_post INTEGER,
  xp_per_reaction INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One config per experience
  CONSTRAINT xp_config_unique UNIQUE (experience_id)
);

CREATE INDEX IF NOT EXISTS idx_xp_configs_experience
  ON xp_configurations(experience_id);

-- ============================================
-- 3. Rewards Configuration Table
-- ============================================
CREATE TABLE IF NOT EXISTS rewards_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id TEXT NOT NULL,
  level_threshold INTEGER NOT NULL CHECK (level_threshold > 0),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('free_days', 'discount', 'badge', 'custom')),
  reward_value TEXT NOT NULL, -- JSON string for flexibility
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One config per level per experience
  CONSTRAINT experience_level_unique UNIQUE (experience_id, level_threshold)
);

CREATE INDEX IF NOT EXISTS idx_rewards_experience
  ON rewards_configs(experience_id, level_threshold);

-- ============================================
-- 4. Activity Log (for analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  experience_id TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('message', 'post', 'reaction')),
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  level_before INTEGER,
  level_after INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partitioning-ready: Use BRIN for time-series
CREATE INDEX IF NOT EXISTS idx_activity_log_time
  ON activity_log USING BRIN (timestamp);

-- User activity lookup
CREATE INDEX IF NOT EXISTS idx_activity_log_user
  ON activity_log(user_id, timestamp DESC);

-- ============================================
-- 5. Cron Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS cron_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'error')),
  last_executed TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cron_logs_job
  ON cron_logs(job_name, last_executed DESC);

-- ============================================
-- 6. Reward History (for audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS reward_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  experience_id TEXT NOT NULL,
  level_reached INTEGER NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value TEXT NOT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  whop_response JSONB -- Store API response for debugging
);

CREATE INDEX IF NOT EXISTS idx_reward_history_user
  ON reward_history(user_id, delivered_at DESC);

-- ============================================
-- 7. Level Ups Table
-- ============================================
CREATE TABLE IF NOT EXISTS level_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  experience_id TEXT NOT NULL,
  old_level INTEGER NOT NULL,
  new_level INTEGER NOT NULL,
  reward_delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_level_ups_user
  ON level_ups(user_id, created_at DESC);

-- ============================================
-- 8. Engagement Analytics Table (Premium feature)
-- ============================================
CREATE TABLE IF NOT EXISTS engagement_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id TEXT NOT NULL,
  date DATE NOT NULL,
  total_activities INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  avg_xp_per_user DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_date_experience UNIQUE (experience_id, date)
);

CREATE INDEX IF NOT EXISTS idx_engagement_date
  ON engagement_analytics(experience_id, date);

-- ============================================
-- 9. Badges Table
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. User Badges Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  badge_id UUID NOT NULL,
  experience_id TEXT NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user
  ON user_badges(user_id, experience_id);

-- ============================================
-- 11. Row-Level Security (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access" ON users
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON xp_configurations
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON rewards_configs
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON activity_log
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON cron_logs
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON reward_history
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON level_ups
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON engagement_analytics
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON user_badges
  FOR ALL TO service_role USING (true);

-- ============================================
-- 12. Automatic Timestamp Updates
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER xp_config_updated_at
  BEFORE UPDATE ON xp_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER rewards_updated_at
  BEFORE UPDATE ON rewards_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 13. Real-Time Subscriptions Setup
-- ============================================
-- Enable real-time for leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;

-- ============================================
-- 14. Atomic XP Function for Race Condition Prevention
-- ============================================
CREATE OR REPLACE FUNCTION award_xp_atomic(
  p_user_id TEXT,
  p_experience_id TEXT,
  p_xp_amount INTEGER,
  p_activity_type TEXT
)
RETURNS TABLE (
  new_xp INTEGER,
  new_level INTEGER,
  old_level INTEGER,
  leveled_up BOOLEAN
) AS $$
DECLARE
  v_current_xp INTEGER;
  v_current_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_leveled_up BOOLEAN;
BEGIN
  -- Get current values or create user
  SELECT xp, level INTO v_current_xp, v_current_level
  FROM users
  WHERE user_id = p_user_id AND experience_id = p_experience_id
  FOR UPDATE; -- Lock the row

  -- If user doesn't exist, insert with initial values
  IF NOT FOUND THEN
    v_current_xp := 0;
    v_current_level := 1;
    
    INSERT INTO users (user_id, experience_id, xp, level, created_at, updated_at)
    VALUES (p_user_id, p_experience_id, 0, 1, NOW(), NOW());
  END IF;

  -- Calculate new XP
  v_new_xp := v_current_xp + p_xp_amount;

  -- Calculate new level using MEE6 formula
  -- Level = floor((-50 + sqrt(2500 + 20*XP)) / 10)
  v_new_level := FLOOR((-50 + SQRT(2500 + 20 * v_new_xp)) / 10);
  
  -- Ensure level is at least 1
  IF v_new_level < 1 THEN
    v_new_level := 1;
  END IF;

  -- Check if leveled up
  v_leveled_up := v_new_level > v_current_level;

  -- Update user
  UPDATE users
  SET 
    xp = v_new_xp,
    level = v_new_level,
    total_messages = CASE WHEN p_activity_type = 'message' THEN total_messages + 1 ELSE total_messages END,
    total_posts = CASE WHEN p_activity_type = 'post' THEN total_posts + 1 ELSE total_posts END,
    total_reactions = CASE WHEN p_activity_type = 'reaction' THEN total_reactions + 1 ELSE total_reactions END,
    last_activity_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id AND experience_id = p_experience_id;

  -- Return the results
  RETURN QUERY SELECT v_new_xp, v_new_level, v_current_level, v_leveled_up;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 15. Maintenance Function
-- ============================================
CREATE OR REPLACE FUNCTION maintain_database()
RETURNS void AS $$
BEGIN
  -- Update statistics for query planner
  ANALYZE users;
  ANALYZE activity_log;
  ANALYZE rewards_configs;

  -- Remove old activity logs (keep 90 days)
  DELETE FROM activity_log
  WHERE timestamp < NOW() - INTERVAL '90 days';

  -- Log maintenance
  INSERT INTO cron_logs (job_name, status, last_executed)
  VALUES ('database_maintenance', 'success', NOW());
END;
$$ LANGUAGE plpgsql;