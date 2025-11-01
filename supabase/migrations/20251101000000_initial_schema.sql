
-- Users table: stores XP, levels, and activity stats
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,  -- Whop user ID
  experience_id TEXT NOT NULL,    -- Whop experience ID
  xp INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  total_messages INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  total_reactions INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_experience_id ON users(experience_id);
CREATE INDEX idx_users_xp_desc ON users(xp DESC);

-- Rewards history: tracks what rewards users have claimed
CREATE TABLE rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id),
  level_achieved INTEGER NOT NULL,
  reward_type TEXT NOT NULL,  -- 'free_days' or 'discount'
  reward_value TEXT NOT NULL, -- e.g., '3' or '50%'
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  whop_membership_id TEXT     -- For tracking which membership got the reward
);

CREATE INDEX idx_rewards_user_id ON rewards(user_id);

-- Activity log (optional, for analytics)
CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  experience_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,  -- 'message', 'post', 'reaction'
  xp_awarded INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_timestamp ON activity_log(timestamp DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
