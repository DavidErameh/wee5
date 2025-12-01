import { Redis } from '@upstash/redis';

// Initialize Redis with lazy loading to avoid module-level errors
let _redis: any = null;

export const redis = () => {
  if (!_redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Missing Upstash Redis environment variables');
    }

    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
};

const COOLDOWN_DURATION = 60; // seconds

/**
 * Check if user is on cooldown
 */
export async function isOnCooldown(userId: string): Promise<boolean> {
  try {
    const cooldown = await redis().get(`cooldown:${userId}`);
    return cooldown !== null;
  } catch (error) {
    console.error('Error checking cooldown:', error);
    return false; // Fail open to not block users
  }
}

/**
 * Set cooldown for user (60 seconds)
 */
export async function setCooldown(userId: string): Promise<void> {
  try {
    await redis().set(`cooldown:${userId}`, '1', { ex: COOLDOWN_DURATION });
  } catch (error) {
    console.error('Error setting cooldown:', error);
  }
}

/**
 * Cache leaderboard data
 */
export async function cacheLeaderboard(
  experienceId: string,
  filter: string,
  data: any[]
): Promise<void> {
  try {
    await redis().set(
      `leaderboard:${experienceId}:${filter}`,
      JSON.stringify(data),
      { ex: 300 } // 5 minutes
    );
  } catch (error) {
    console.error('Error caching leaderboard:', error);
  }
}

/**
 * Get cached leaderboard
 */
export async function getCachedLeaderboard(
  experienceId: string,
  filter: string
): Promise<any[] | null> {
  try {
    const cached = await redis().get(`leaderboard:${experienceId}:${filter}`);
    return cached ? JSON.parse(cached as string) : null;
  } catch (error) {
    console.error('Error getting cached leaderboard:', error);
    return null;
  }
}

/**
 * Check if activity is a duplicate using Redis-based deduplication
 * Key: `xp:dedup:{userId}:{activityId}` with 5-minute TTL 
 */
export async function isDuplicateActivity(userId: string, activityId: string): Promise<boolean> {
  try {
    const key = `xp:dedup:${userId}:${activityId}`;
    const exists = await redis().get(key);
    return exists !== null;
  } catch (error) {
    console.error('Error checking for duplicate activity:', error);
    return false; // Fail open to not block legitimate activities
  }
}

/**
 * Mark activity as processed to prevent duplicates
 * Uses 5-minute TTL to cover potential duplicate webhook deliveries
 */
export async function markActivityProcessed(userId: string, activityId: string): Promise<void> {
  try {
    const key = `xp:dedup:${userId}:${activityId}`;
    await redis().set(key, '1', { ex: 300 }); // 5 minutes TTL
  } catch (error) {
    console.error('Error marking activity as processed:', error);
  }
}