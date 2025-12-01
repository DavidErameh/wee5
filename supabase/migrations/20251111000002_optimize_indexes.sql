-- Optimize database indexes for better query performance
-- Focus on indexes that will improve leaderboard, XP lookup, and reward delivery performance

-- Index for rewards_configs table to optimize level-specific reward lookups
-- Used in getRewardForLevel function: .eq('experience_id', experienceId).eq('level_threshold', level)
CREATE INDEX IF NOT EXISTS idx_rewards_configs_exp_level 
ON rewards_configs(experience_id, level_threshold);

-- Index for reward_history table to optimize duplicate reward checks
-- Used in handleLevelUp function: .eq('user_id', userId).eq('experience_id', experienceId).eq('level_reached', newLevel)
CREATE INDEX IF NOT EXISTS idx_reward_history_user_exp_level 
ON reward_history(user_id, experience_id, level_reached);

-- Additional index for activity_log to improve analytics queries
-- Used for time-based analytics and user activity tracking
CREATE INDEX IF NOT EXISTS idx_activity_log_user_time 
ON activity_log(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_activity_log_exp_time 
ON activity_log(experience_id, timestamp DESC);

-- Verify the most important indexes for XP and leaderboard operations exist
-- These should already exist from the base schema, but ensuring they do
CREATE INDEX IF NOT EXISTS idx_users_exp_xp 
ON users(experience_id, xp DESC);  -- For leaderboard queries

CREATE INDEX IF NOT EXISTS idx_users_exp_id 
ON users(user_id, experience_id);  -- For user XP lookups with experience context

-- Index for XP configuration lookups (premium tier checks)
CREATE INDEX IF NOT EXISTS idx_xp_configs_experience 
ON xp_configurations(experience_id);

-- Optimize level_ups table for analytics and tracking
CREATE INDEX IF NOT EXISTS idx_level_ups_user_time 
ON level_ups(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_level_ups_experience_time 
ON level_ups(experience_id, created_at DESC);

-- Optimize user_badges for performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_exp 
ON user_badges(user_id, experience_id);

-- Make sure the main lookup indexes are not just individual columns
-- but also the combinations that are commonly used together
CREATE INDEX IF NOT EXISTS idx_users_exp_xp_activity 
ON users(experience_id, xp DESC, last_activity_at DESC);