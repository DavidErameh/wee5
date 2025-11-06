import { supabaseAdmin } from './db';
import { redis as getRedis, isOnCooldown, setCooldown } from './redis';

// XP values per activity type
export const XP_VALUES = {
  MESSAGE: 20,
  POST_MIN: 15,
  POST_MAX: 25,
  REACTION: 5,
} as const;

export type ActivityType = 'message' | 'post' | 'reaction';

interface AwardXPResult {
  success: boolean;
  xpAwarded?: number;
  newTotalXp?: number;
  leveledUp?: boolean;
  oldLevel?: number;
  newLevel?: number;
  error?: string;
}

/**
 * Award XP to a user for an activity
 * CRITICAL: Includes cooldown check and level calculation
 */
export async function awardXP(
  userId: string,
  experienceId: string,
  activityType: ActivityType
): Promise<AwardXPResult> {
  try {
    // 1. Check cooldown (60 seconds)
    if (await isOnCooldown(userId)) {
      return { success: false, error: 'User is on cooldown' };
    }

    // 2. Get user record to check for tier
    let { data: user, error: fetchError } = await supabaseAdmin()
      .from('users')
      .select('xp, level, tier, total_messages, total_posts, total_reactions')
      .eq('user_id', userId)
      .eq('experience_id', experienceId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw fetchError;
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
          ? Math.floor(Math.random() * (XP_VALUES.POST_MAX - XP_VALUES.POST_MIN + 1)) + XP_VALUES.POST_MIN
          : XP_VALUES[activityType.toUpperCase() as keyof typeof XP_VALUES];
      }
    } else {
      // Use default XP values for free tier
      if (activityType === 'post') {
        xpToAward = Math.floor(Math.random() * (XP_VALUES.POST_MAX - XP_VALUES.POST_MIN + 1)) + XP_VALUES.POST_MIN;
      } else {
        xpToAward = XP_VALUES[activityType.toUpperCase() as keyof typeof XP_VALUES];
      }
    }

    let isNewUser = false;
    if (!user) {
      // Create new user with default values
      const { data: newUser, error: createError } = await supabaseAdmin()
        .from('users')
        .insert({
          user_id: userId,
          experience_id: experienceId,
          xp: xpToAward,
          level: 1, // Starting at level 1 (database constraint: level >= 1)
          tier: 'free', // Default tier
          [`total_${activityType}s`]: 1,
        })
        .select()
        .single();

      if (createError) throw createError;
      
      user = newUser;
      isNewUser = true;
    } else {
      // 4. Update existing user
      const newXp = user.xp + xpToAward;
      const oldLevel = user.level;
      const newLevel = calculateLevel(newXp);
      const leveledUp = newLevel > oldLevel;

      // Increment activity counter
      const activityField = `total_${activityType}s` as keyof typeof user;
      
      // Define the update object with explicit typing
      const updateData: any = {
        xp: newXp,
        level: newLevel,
        last_activity_at: new Date().toISOString(),
      };
      
      // Add the dynamic activity field with type-safe access
      updateData[activityField] = (user[activityField] as number || 0) + 1;
      
      const { error: updateError } = await supabaseAdmin()
        .from('users')
        .update(updateData)
        .eq('user_id', userId)
        .eq('experience_id', experienceId);

      if (updateError) throw updateError;

      // 5. Log activity (optional)
      try {
        await supabaseAdmin().from('activity_log').insert({
          user_id: userId,
          experience_id: experienceId,
          activity_type: activityType,
          xp_awarded: xpToAward,
        });
      } catch (err) {
        console.error('Failed to log activity:', err);
      }

      // 6. Set cooldown
      await setCooldown(userId);

      return {
        success: true,
        xpAwarded: xpToAward,
        newTotalXp: newXp,
        leveledUp,
        oldLevel: leveledUp ? oldLevel : undefined,
        newLevel: leveledUp ? newLevel : undefined,
      };
    }

    // New user case
    await setCooldown(userId);

    return {
      success: true,
      xpAwarded: xpToAward,
      newTotalXp: xpToAward,
      leveledUp: false,
    };

  } catch (error) {
    console.error('Error awarding XP:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Calculate level from total XP using MEE6 formula
 * Formula: XP required for level N = 5 * (N^2) + 50 * N + 100
 * CRITICAL: This must match the leveling progression
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) return 1; // Starting at level 1 (database constraint: level >= 1)
  
  let level = 1; // Start from level 1 (database constraint: level >= 1)
  let cumulativeXp = 0;
  
  while (true) {
    const xpForNext = xpForNextLevel(level);
    if (cumulativeXp + xpForNext > xp) break;
    cumulativeXp += xpForNext;
    level++;
  }
  
  return level;
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