-- Users table to store XP, level, and activity data
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Whop user ID
  experience_id TEXT NOT NULL, -- Whop experience ID
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_messages INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  total_reactions INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'free', -- 'free', 'premium', 'enterprise'
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, experience_id)
);

-- XP configuration table for custom rates (premium feature)
CREATE TABLE IF NOT EXISTS xp_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id TEXT NOT NULL UNIQUE,
  xp_per_message INTEGER DEFAULT 20,
  min_xp_per_post INTEGER DEFAULT 15,
  max_xp_per_post INTEGER DEFAULT 25,
  xp_per_reaction INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log to track all XP-earning activities
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  experience_id TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('message', 'post', 'reaction')),
  xp_awarded INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rewards table to track earned rewards
CREATE TABLE IF NOT EXISTS rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  level_achieved INTEGER NOT NULL,
  reward_type TEXT NOT NULL, -- 'free_days', 'discount', etc.
  reward_value TEXT NOT NULL,
  whop_membership_id TEXT,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Engagement analytics table (premium feature)
CREATE TABLE IF NOT EXISTS engagement_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id TEXT NOT NULL,
  date DATE NOT NULL,
  total_xp_earned INTEGER DEFAULT 0,
  total_users_active INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  posts_created INTEGER DEFAULT 0,
  reactions_given INTEGER DEFAULT 0,
  new_levels_achieved INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(experience_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_experience ON users(user_id, experience_id);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_xp_configurations_experience ON xp_configurations(experience_id);
CREATE INDEX IF NOT EXISTS idx_engagement_analytics_experience_date ON engagement_analytics(experience_id, date);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_user_level ON rewards(user_id, level_achieved);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update the updated_at column for users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update the updated_at column for xp_configurations
CREATE TRIGGER update_xp_configurations_updated_at 
    BEFORE UPDATE ON xp_configurations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();