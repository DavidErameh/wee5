
-- Users table: Core XP/level tracking
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  experience_id TEXT NOT NULL,
  xp INTEGER DEFAULT 0 NOT NULL CHECK (xp >= 0),
  level INTEGER DEFAULT 1 NOT NULL CHECK (level >= 1),
  total_messages INTEGER DEFAULT 0 NOT NULL CHECK (total_messages >= 0),
  total_posts INTEGER DEFAULT 0 NOT NULL CHECK (total_posts >= 0),
  total_reactions INTEGER DEFAULT 0 NOT NULL CHECK (total_reactions >= 0),
  last_activity_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_experience_id ON users(experience_id);
CREATE INDEX idx_users_xp_desc ON users(xp DESC);
CREATE INDEX idx_users_experience_xp ON users(experience_id, xp DESC);
CREATE INDEX idx_users_last_activity ON users(last_activity_at DESC);

-- Rewards tracking
CREATE TABLE rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  experience_id TEXT NOT NULL,
  level_achieved INTEGER NOT NULL CHECK (level_achieved > 0),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('free_days', 'discount')),
  reward_value TEXT NOT NULL,
  whop_membership_id TEXT,
  claimed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, experience_id, level_achieved)
);

CREATE INDEX idx_rewards_user_id ON rewards(user_id);
CREATE INDEX idx_rewards_experience_id ON rewards(experience_id);

-- Activity log (optional, for analytics)
CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  experience_id TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('message', 'post', 'reaction')),
  xp_awarded INTEGER NOT NULL CHECK (xp_awarded > 0),
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_experience_id ON activity_log(experience_id);
CREATE INDEX idx_activity_log_timestamp ON activity_log(timestamp DESC);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow service role full access, users read-only)
CREATE POLICY "Allow public read access" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow service role full access" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow public read access" ON rewards
  FOR SELECT USING (true);

CREATE POLICY "Allow service role full access" ON rewards
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
