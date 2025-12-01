import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface LeaderboardEntry {
  user_id: string;
  xp: number;
  level: number;
  total_messages: number;
  total_posts: number;
  total_reactions: number;
  rank: number;
}

export async function getCachedLeaderboard(
  experienceId: string,
  filter: 'all-time' | 'week' | 'month' = 'all-time'
): Promise<LeaderboardEntry[]> {
  const cacheKey = `leaderboard:${experienceId}:${filter}`;

  try {
    // Try to get from cache first
    const cached = await redis.get<LeaderboardEntry[]>(cacheKey);
    if (cached) {
      console.log(`Cache hit for leaderboard: ${cacheKey}`);
      return cached;
    }
  } catch (error) {
    console.error('Error getting cached leaderboard:', error);
    // Continue to fetch from DB if cache fails
  }

  console.log(`Cache miss for leaderboard: ${cacheKey}, fetching from database`);
  return []; // In a real implementation, this would fetch from the database
}

export async function cacheLeaderboard(
  experienceId: string,
  filter: 'all-time' | 'week' | 'month',
  data: LeaderboardEntry[]
): Promise<void> {
  const cacheKey = `leaderboard:${experienceId}:${filter}`;

  try {
    await redis.set(cacheKey, data, { ex: 30 }); // Cache for 30 seconds
    console.log(`Leaderboard cached: ${cacheKey}`);
  } catch (error) {
    console.error('Error caching leaderboard:', error);
  }
}

export async function invalidateLeaderboardCache(
  experienceId: string
): Promise<void> {
  try {
    // Delete all cached versions of this leaderboard
    await Promise.all([
      redis.del(`leaderboard:${experienceId}:all-time`),
      redis.del(`leaderboard:${experienceId}:week`),
      redis.del(`leaderboard:${experienceId}:month`),
    ]);
    console.log(`Leaderboard cache invalidated for: ${experienceId}`);
  } catch (error) {
    console.error('Error invalidating leaderboard cache:', error);
  }
}