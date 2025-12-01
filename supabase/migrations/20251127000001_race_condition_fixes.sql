-- Migration: Enhanced XP Awarding with Distributed Locking
-- Implements additional race condition protection using Redis distributed locks
-- Addresses Issue 8: XP Award Race Condition

-- This requires that the application layer also implements distributed locking
-- The database function already uses FOR UPDATE, but we're adding additional 
-- protections in the application layer

-- First, we'll enhance the atomic function with better error handling and consistency
CREATE OR REPLACE FUNCTION award_xp_atomic(
  p_user_id TEXT,
  p_experience_id TEXT,
  p_company_id TEXT,
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
  -- Using FOR UPDATE to lock the row during transaction
  SELECT xp, level INTO v_current_xp, v_current_level
  FROM users
  WHERE user_id = p_user_id AND experience_id = p_experience_id
  FOR UPDATE;

  -- If user doesn't exist, insert with initial values
  IF NOT FOUND THEN
    v_current_xp := 0;
    v_current_level := 1;

    INSERT INTO users (user_id, experience_id, company_id, xp, level, 
                      total_messages, total_posts, total_reactions, 
                      last_activity_at, created_at, updated_at)
    VALUES (p_user_id, p_experience_id, p_company_id, 0, 1, 
            0, 0, 0, NOW(), NOW(), NOW());
  END IF;

  -- Calculate new XP ensuring it doesn't go negative
  v_new_xp := GREATEST(v_current_xp + p_xp_amount, 0);

  -- Calculate new level using the corrected MEE6 formula:
  -- XP needed for level N = 5 * N² + 50 * N + 100
  -- Using inverse calculation to find level from XP
  v_new_level := 1;
  WHILE (5 * v_new_level * v_new_level + 50 * v_new_level + 100) <= v_new_xp LOOP
    v_new_level := v_new_level + 1;
  END LOOP;

  -- Check if leveled up
  v_leveled_up := v_new_level > v_current_level;

  -- Update user with atomic operation
  UPDATE users
  SET
    xp = v_new_xp,
    level = v_new_level,
    total_messages = CASE 
      WHEN p_activity_type IN ('message', 'chat') THEN total_messages + 1 
      ELSE total_messages 
    END,
    total_posts = CASE 
      WHEN p_activity_type IN ('post', 'forum') THEN total_posts + 1 
      ELSE total_posts 
    END,
    total_reactions = CASE 
      WHEN p_activity_type = 'reaction' THEN total_reactions + 1 
      ELSE total_reactions 
    END,
    last_activity_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id AND experience_id = p_experience_id;

  -- Return the results
  RETURN QUERY SELECT v_new_xp, v_new_level, v_current_level, v_leveled_up;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate level from XP using the corrected formula
CREATE OR REPLACE FUNCTION calculate_level_from_xp(p_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_level INTEGER := 1;
  v_required_xp INTEGER;
BEGIN
  -- MEE6 formula: XP needed for level N = 5 * N² + 50 * N + 100
  -- Calculate which level the XP amount corresponds to
  LOOP
    v_required_xp := 5 * v_level * v_level + 50 * v_level + 100;
    IF p_xp < v_required_xp THEN
      EXIT;
    END IF;
    v_level := v_level + 1;
  END LOOP;
  
  RETURN v_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add a function to get user rank efficiently for leaderboard operations
CREATE OR REPLACE FUNCTION get_user_rank(
  p_user_id TEXT,
  p_experience_id TEXT
)
RETURNS TABLE(rank BIGINT, total_users BIGINT) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_users AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY xp DESC) as user_rank
    FROM users
    WHERE experience_id = p_experience_id
      AND xp IS NOT NULL
  ),
  user_rank_result AS (
    SELECT user_rank
    FROM ranked_users
    WHERE user_id = p_user_id
  ),
  total_count AS (
    SELECT COUNT(*) as total
    FROM users
    WHERE experience_id = p_experience_id
  )
  SELECT 
    COALESCE((SELECT user_rank FROM user_rank_result), 0)::BIGINT as rank,
    (SELECT total FROM total_count)::BIGINT as total_users;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add proper indexes to support these operations
-- (These may already exist from other migrations, but ensuring they're present)
CREATE INDEX IF NOT EXISTS idx_users_user_experience ON users(user_id, experience_id);
CREATE INDEX IF NOT EXISTS idx_users_experience_xp ON users(experience_id, xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_activity_brin ON users USING BRIN (last_activity_at);