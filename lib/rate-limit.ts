
import { redis as getRedis } from './redis';

const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute

export async function checkRateLimit(key: string, limit: number): Promise<boolean> {
  try {
    const requestCount = await getRedis().incr(key);

    if (requestCount === 1) {
      await getRedis().expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }

    return requestCount <= limit;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return true; // Fail open: if Redis is down, don't block legitimate requests
  }
}
