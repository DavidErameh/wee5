
import { redis as getRedis } from './redis';

interface RateLimitResult {
  limited: boolean;
  retryAfter: number;
}

// Define different rate limits per tier
const TIER_LIMITS = {
  free: 10,      // 10 requests per minute
  premium: 30,   // 30 requests per minute
  enterprise: 100, // 100 requests per minute
  lifetime: 100   // 100 requests per minute
};

const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute

export async function checkRateLimit(
  userId: string,
  tier: 'free' | 'premium' | 'enterprise' | 'lifetime' = 'free'
): Promise<RateLimitResult> {
  try {
    const limit = TIER_LIMITS[tier];
    const key = `ratelimit:${tier}:${userId}`;

    const requestCount = await getRedis().incr(key);

    if (requestCount === 1) {
      await getRedis().expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }

    // Calculate when the window resets (in seconds)
    const ttl = await getRedis().ttl(key);
    const retryAfter = ttl > 0 ? ttl : RATE_LIMIT_WINDOW_SECONDS;

    // CORRECT: Return limited = true when rate limit is exceeded (when requestCount > limit)
    return {
      limited: requestCount > limit, // User is limited if they exceed the limit
      retryAfter
    };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // Fail closed: If Redis is down, prevent requests to prevent abuse
    return { limited: true, retryAfter: 60 };
  }
}

// Legacy function for backward compatibility
export async function isRateLimited(key: string, limit: number): Promise<boolean> {
  try {
    const requestCount = await getRedis().incr(key);

    if (requestCount === 1) {
      await getRedis().expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }

    return requestCount > limit;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return true; // Fail closed: If Redis is down, prevent requests to prevent abuse
  }
}
