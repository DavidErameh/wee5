-- Migration: Performance Indexes for Scalability
-- Implements missing indexes to optimize query performance

-- Indexes for users table
-- Composite index for efficient leaderboard queries (experience + xp)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_experience_xp_desc 
ON users(experience_id, xp DESC);

-- Index for activity deduplication
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_tracker_user_activity_unique 
ON activity_tracker(user_id, experience_id, activity_type, activity_id);

-- BRIN indexes for time-series data (more efficient for time-based queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_activity_brin 
ON users USING BRIN (last_activity_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_log_timestamp_brin 
ON activity_log USING BRIN (timestamp);

-- Indexes for foreign key lookups and common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rewards_user_experience_level 
ON rewards(user_id, experience_id, level_achieved);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_log_user_experience 
ON activity_log(user_id, experience_id, timestamp DESC);

-- Additional indexes for user lookup performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_user_id_experience_id 
ON users(user_id, experience_id);

-- Index for membership lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_xp_configurations_experience_id 
ON xp_configurations(experience_id);

-- Optimize for analytics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_log_experience_type_time 
ON activity_log(experience_id, activity_type, timestamp DESC);

-- Run ANALYZE to update table statistics after index creation
ANALYZE users;
ANALYZE activity_log;
ANALYZE rewards;
ANALYZE activity_tracker;
ANALYZE xp_configurations;