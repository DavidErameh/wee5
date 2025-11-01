
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Helper to check if user is on cooldown
export async function isOnCooldown(userId: string): Promise<boolean> {
  const cooldown = await redis.get(`cooldown:${userId}`);
  return cooldown !== null;
}

// Helper to set cooldown (60 seconds)
export async function setCooldown(userId: string): Promise<void> {
  await redis.set(`cooldown:${userId}`, '1', { ex: 60 });
}
