-- Create atomic function for incrementing user XP and activity counters
-- This prevents race conditions in concurrent XP awards

CREATE OR REPLACE FUNCTION increment_user_xp_and_activity(
  p_user_id TEXT,
  p_experience_id TEXT,
  p_xp_amount INTEGER,
  p_activity_type TEXT,
  p_timestamp BIGINT
)
RETURNS TABLE(old_level INTEGER, new_xp INTEGER, new_level INTEGER) AS $$
DECLARE
  v_old_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_activity_field TEXT;
BEGIN
  -- Determine which activity field to increment based on activity type
  v_activity_field := 'total_' || p_activity_type || 's';
  
  -- Update user record atomically - XP, activity counter, and timestamp
  EXECUTE format(
    'UPDATE users 
     SET 
       xp = xp + $1,
       %I = COALESCE(%I, 0) + 1,
       last_activity_at = to_timestamp($2 / 1000.0),
       updated_at = now()
     WHERE user_id = $3 AND experience_id = $4
     RETURNING level, xp',
    v_activity_field, v_activity_field
  ) USING p_xp_amount, p_timestamp, p_user_id, p_experience_id
  INTO v_old_level, v_new_xp;

  -- Calculate new level based on new XP
  v_new_level := 1;
  DECLARE
    v_xp_for_next_level INTEGER := 100;
    v_temp_xp INTEGER := v_new_xp;
  BEGIN
    WHILE v_temp_xp >= v_xp_for_next_level LOOP
      v_new_level := v_new_level + 1;
      v_temp_xp := v_temp_xp - v_xp_for_next_level;
      v_xp_for_next_level := 5 * (v_new_level * v_new_level) + 50 * v_new_level + 100;
    END LOOP;
  END;

  -- Update level if changed
  EXECUTE format(
    'UPDATE users 
     SET level = $1 
     WHERE user_id = $2 AND experience_id = $3 AND level < $1',
    v_new_level, p_user_id, p_experience_id
  );

  RETURN QUERY SELECT v_old_level, v_new_xp, v_new_level;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update activity counters atomically
CREATE OR REPLACE FUNCTION update_activity_counter(
  p_user_id TEXT,
  p_experience_id TEXT,
  p_activity_type TEXT
)
RETURNS VOID AS $$
DECLARE
  v_activity_field TEXT;
BEGIN
  v_activity_field := 'total_' || p_activity_type || 's';
  
  EXECUTE format(
    'UPDATE users 
     SET %I = COALESCE(%I, 0) + 1
     WHERE user_id = $1 AND experience_id = $2',
    v_activity_field, v_activity_field
  ) USING p_user_id, p_experience_id;
END;
$$ LANGUAGE plpgsql;

-- Backward compatibility: create the original function as well
CREATE OR REPLACE FUNCTION increment_user_xp(
  p_user_id TEXT,
  p_experience_id TEXT,
  p_xp_amount INTEGER,
  p_timestamp BIGINT
)
RETURNS TABLE(old_level INTEGER, new_xp INTEGER) AS $$
DECLARE
  v_old_level INTEGER;
  v_new_xp INTEGER;
BEGIN
  -- Get current level and increment XP atomically
  UPDATE users
  SET
    xp = xp + p_xp_amount,
    last_activity_at = to_timestamp(p_timestamp / 1000), -- Convert milliseconds to timestamp
    updated_at = now()
  WHERE user_id = p_user_id AND experience_id = p_experience_id
  RETURNING level, xp INTO v_old_level, v_new_xp;

  RETURN QUERY SELECT v_old_level, v_new_xp;
END;
$$ LANGUAGE plpgsql;

-- Ensure user table has proper unique constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_id_experience_id_key;
ALTER TABLE users ADD CONSTRAINT users_user_id_experience_id_key UNIQUE (user_id, experience_id);

-- Create necessary indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_xp_lookup ON users(user_id, experience_id);
CREATE INDEX IF NOT EXISTS idx_users_leaderboard ON users(experience_id, xp DESC);

-- Create activity_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  experience_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  xp_awarded INTEGER NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id, timestamp DESC);

-- Create cron_logs table for tracking cron job execution
CREATE TABLE IF NOT EXISTS cron_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL UNIQUE,
  last_executed TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups by job_name
CREATE INDEX IF NOT EXISTS idx_cron_logs_job_name ON cron_logs(job_name);