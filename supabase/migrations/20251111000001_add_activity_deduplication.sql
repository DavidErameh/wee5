-- Add activity deduplication table to prevent duplicate XP awards

-- Create table to track activities and prevent duplicates
CREATE TABLE activity_tracker (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  experience_id TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('message', 'post', 'reaction', 'chat')),
  activity_id TEXT, -- Unique identifier for the specific activity (e.g., message ID, post ID)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate awards for the same activity
  UNIQUE(user_id, experience_id, activity_type, activity_id)
);

-- Create indexes for performance
CREATE INDEX idx_activity_tracker_user_activity ON activity_tracker(user_id, activity_type, created_at DESC);
CREATE INDEX idx_activity_tracker_experience ON activity_tracker(experience_id, created_at DESC);

-- Enhanced atomic function with additional race condition prevention
-- Function signature matches the one used in the event processor (with company_id)
CREATE OR REPLACE FUNCTION award_xp_atomic(
  p_user_id TEXT,
  p_experience_id TEXT,
  p_company_id TEXT,  -- Keeping for compatibility with event processor calls
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
  -- Get current values or create user (with row-level locking to prevent race conditions)
  SELECT xp, level INTO v_current_xp, v_current_level
  FROM users
  WHERE user_id = p_user_id AND experience_id = p_experience_id
  FOR UPDATE; -- Critical: Lock the row to prevent concurrent updates causing race conditions

  -- If user doesn't exist, insert with initial values
  IF NOT FOUND THEN
    v_current_xp := 0;
    v_current_level := 1;

    INSERT INTO users (user_id, experience_id, company_id, xp, level, created_at, updated_at)
    VALUES (p_user_id, p_experience_id, p_company_id, 0, 1, NOW(), NOW());
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

  -- Update user (atomic operation with row locking)
  UPDATE users
  SET
    xp = v_new_xp,
    level = v_new_level,
    total_messages = CASE WHEN p_activity_type = 'message' OR p_activity_type = 'chat' THEN total_messages + 1 ELSE total_messages END,
    total_posts = CASE WHEN p_activity_type = 'post' THEN total_posts + 1 ELSE total_posts END,
    total_reactions = CASE WHEN p_activity_type = 'reaction' THEN total_reactions + 1 ELSE total_reactions END,
    last_activity_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id AND experience_id = p_experience_id;

  -- Also update the activity_log table for analytics
  INSERT INTO activity_log (user_id, experience_id, activity_type, xp_awarded, level_before, level_after)
  VALUES (p_user_id, p_experience_id, p_activity_type, p_xp_amount, v_current_level, v_new_level);

  -- Return the results
  RETURN QUERY SELECT v_new_xp, v_new_level, v_current_level, v_leveled_up;
END;
$$ LANGUAGE plpgsql;

-- Future enhancement: Create a separate function with full deduplication support
-- This would require webhook/event modifications to pass unique activity IDs
-- CREATE OR REPLACE FUNCTION award_xp_atomic_with_deduplication(
--   p_user_id TEXT,
--   p_experience_id TEXT,
--   p_company_id TEXT,
--   p_xp_amount INTEGER,
--   p_activity_type TEXT,
--   p_activity_id TEXT DEFAULT NULL  -- Unique activity identifier for deduplication
-- )
-- ... implementation with activity_tracker table