import { AppError, handleError } from './error-handler';
import { supabaseAdmin } from './db';
import { isOnCooldown, setCooldown, isDuplicateActivity, markActivityProcessed } from './redis';
import { Redis } from '@upstash/redis';

// XP values per activity type
export const XP_VALUES = {
  MESSAGE: 20,
  POST_MIN: 15,
  POST_MAX: 25,
  REACTION: 5,
} as const;

export type ActivityType = 'message' | 'post' | 'reaction';

/**
 * Calculate level from total XP using MEE6 formula
 * Formula: XP required for level N = 5 * N² + 50 * N + 100
 * Using the inverse formula to solve for level directly: level = floor((-50 + sqrt(50² - 4*5*(100-XP))) / (2*5))
 * CRITICAL: This must match the leveling progression
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) return 0;
  if (xp === 0) return 0;

  // Solve quadratic equation: 5N² + 50N + (100 - xp) = 0
  // Using quadratic formula: N = (-b + sqrt(b² - 4ac)) / 2a
  const a = 5;
  const b = 50;
  const c = 100 - xp;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return 0;

  const level = Math.floor((-b + Math.sqrt(discriminant)) / (2 * a));
  return Math.max(0, level);
}

// Define the return types
interface XPAwardSuccess {
  success: true;
  xpAwarded: number;
  xp: number; // new total XP
  level: number; // new level
  leveledUp: boolean;
  message?: string;
}

interface XPAwardFailure {
  success: false;
  reason: 'cooldown' | 'duplicate' | 'error';
  message: string;
}

type XPAwardResult = XPAwardSuccess | XPAwardFailure;

/**
 * Award XP to a user for an activity with enhanced error handling
 * Uses PostgreSQL's atomic function to prevent race conditions
 */

interface XPAwardParams {
  userId: string;
  experienceId: string;
  activityType: 'message' | 'post' | 'reaction';
  activityId?: string;  // Optional activity ID for deduplication (e.g. message ID)
}

export async function awardXP(params: XPAwardParams): Promise<XPAwardResult> {
  const { userId, experienceId, activityType, activityId } = params;
  const startTime = Date.now();
  const context = {
    operation: 'awardXP',
    userId,
    experienceId,
    metadata: { activityType, activityId },
  };

  // Use a Redis-based distributed lock to prevent race conditions
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!
  });

  // Create a unique lock key based on the user and activity
  const lockKey = `xp_award_lock:${userId}:${activityId || `${Date.now()}_${Math.random()}`}`;
  const lockTimeout = 5000; // 5 seconds timeout

  // Attempt to acquire a distributed lock
  const lockAcquired = await redis.set(lockKey, '1', {
    nx: true, // Only set if key doesn't exist
    px: lockTimeout // Expire after 5 seconds to prevent deadlock
  });

  if (!lockAcquired) {
    // Another process is already handling XP award for this activity
    return {
      success: false,
      reason: 'duplicate',
      message: 'Activity is currently being processed'
    };
  }

  try {
    // 1. Check deduplication if activityId is provided
    if (activityId) {
      const isDuplicate = await isDuplicateActivity(userId, activityId);
      if (isDuplicate) {
        console.log('Duplicate activity detected:', { userId, activityType, activityId });
        return {
          success: false,
          reason: 'duplicate',
          message: 'Activity already processed'
        };
      }
    }

    // 2. Check cooldown
    if (await isOnCooldown(userId)) {
      console.log('User on cooldown:', { userId, activityType });
      return {
        success: false,
        reason: 'cooldown',
        message: 'Please wait before earning more XP'
      };
    }

    // 3. Calculate XP to award based on user tier (for premium users)
    let xpToAward: number;

    // Check for custom XP configuration (premium feature)
    const { data: xpConfig } = await supabaseAdmin()
      .from('xp_configurations')
      .select('*')
      .eq('experience_id', experienceId)
      .single();

    if (xpConfig) {
      // Use custom XP rates for premium communities
      if (activityType === 'message' && xpConfig.xp_per_message) {
        xpToAward = xpConfig.xp_per_message;
      } else if (activityType === 'post' && xpConfig.min_xp_per_post && xpConfig.max_xp_per_post) {
        xpToAward = Math.floor(Math.random() * (xpConfig.max_xp_per_post - xpConfig.min_xp_per_post + 1)) + xpConfig.min_xp_per_post;
      } else if (activityType === 'reaction' && xpConfig.xp_per_reaction) {
        xpToAward = xpConfig.xp_per_reaction;
      } else {
        // Fallback to default if specific config not set
        xpToAward = activityType === 'post'
          ? Math.floor(Math.random() * (25 - 15 + 1)) + 15
          : activityType === 'message' ? 20 : 5;
      }
    } else {
      // Use default XP values for free tier
      if (activityType === 'post') {
        xpToAward = Math.floor(Math.random() * (25 - 15 + 1)) + 15;
      } else {
        xpToAward = activityType === 'message' ? 20 : 5;
      }
    }

    // 4. Use atomic function to award XP and handle user creation/update safely
    const client = supabaseAdmin();
    const { data, error } = await client.rpc('award_xp_atomic', {
      p_user_id: userId,
      p_experience_id: experienceId,
      p_company_id: 'default', // Using 'default' for now, would come from webhook event in real implementation
      p_xp_amount: xpToAward,
      p_activity_type: activityType,
    });

    if (error) {
      throw new AppError('Database operation failed', 500, context);
    }

    // 5. Mark activity as processed in Redis for deduplication if activityId was provided
    if (activityId) {
      await markActivityProcessed(userId, activityId);
    }

    // 6. Set cooldown in Redis
    await setCooldown(userId);

    // 7. Check for level up and process asynchronously
    if (data?.leveled_up) {
      // Process level up separately to not block XP awarding
      import('./rewards').then(async ({ handleLevelUp }) => {
        try {
          await handleLevelUp(userId, experienceId, data.old_level, data.new_level);
        } catch (levelUpError) {
          console.error('Level up processing failed:', levelUpError);
          // Don't fail XP award if level up processing fails
        }
      });
    }

    const duration = Date.now() - startTime;
    console.log(`XP awarded successfully in ${duration}ms`);

    return {
      success: true,
      xpAwarded: xpToAward,
      xp: data?.new_xp,
      level: data?.new_level,
      leveledUp: data?.leveled_up,
      message: `Successfully awarded ${xpToAward} XP`
    };

  } catch (error) {
    console.error('Error in awardXP:', error);
    return {
      success: false,
      reason: 'error',
      message: 'Failed to award XP due to server error'
    };
  } finally {
    // Always release the distributed lock
    try {
      await redis.del(lockKey);
    } catch (releaseError) {
      console.error('Error releasing XP award lock:', releaseError);
      // Don't fail the main operation if lock release fails
    }
  }
}

/**
 * Calculate cumulative XP needed to reach a specific level
 */
export function xpForLevel(level: number): number {
  if (level <= 0) return 0;

  let totalXp = 0;
  for (let l = 0; l < level; l++) {
    totalXp += xpForNextLevel(l);
  }
  return totalXp;
}

/**
 * Calculate XP needed for next level from current level
 */
export function xpForNextLevel(currentLevel: number): number {
  return 5 * (currentLevel ** 2) + 50 * currentLevel + 100;
}

/**
 * Calculate progress percentage to next level
 */
export function calculateProgress(currentXp: number, currentLevel: number): {
  current: number;
  needed: number;
  percentage: number;
} {
  const xpAtCurrent = xpForLevel(currentLevel);
  const xpForNext = xpForNextLevel(currentLevel);

  const xpProgress = currentXp - xpAtCurrent;

  return {
    current: xpProgress,
    needed: xpForNext,
    percentage: Math.min(100, Math.max(0, (xpProgress / xpForNext) * 100)),
  };
}