
import { supabaseAdmin } from './db';
import { redis, isOnCooldown, setCooldown } from './redis';
import { getXpConfiguration } from './xpConfig';

// XP values per activity - defaults, will be overridden by configuration
const DEFAULT_XP_VALUES = {
  message: 20,
  post: { min: 15, max: 25 }, // Range for posts
  reaction: 5,
};

// Award XP to a user
export async function awardXP(
  userId: string,
  experienceId: string,
  activityType: 'message' | 'post' | 'reaction'
): Promise<{ success: boolean; xpAwarded?: number; leveledUp?: boolean; newLevel?: number }> {
  
  // Check cooldown
  if (await isOnCooldown(userId)) {
    return { success: false };
  }

  // Get XP configuration for this experience
  const xpConfig = await getXpConfiguration(experienceId);
  
  // Calculate XP to award based on configuration
  let xpToAward: number;
  if (activityType === 'post') {
    // Calculate random XP within the configured range
    const min = xpConfig.post.min;
    const max = xpConfig.post.max;
    xpToAward = Math.floor(Math.random() * (max - min + 1)) + min;
  } else if (activityType === 'message') {
    xpToAward = xpConfig.message;
  } else { // reaction
    xpToAward = xpConfig.reaction;
  }

  // Get or create user
  let { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .eq('experience_id', experienceId)
    .single();

  if (error || !user) {
    // Create new user with initial values
    const activityField = `total_${activityType}s`;
    const initialActivityCounters: any = {};
    initialActivityCounters[activityField] = 1;
    
    const { data: newUser } = await supabaseAdmin
      .from('users')
      .insert({
        user_id: userId,
        experience_id: experienceId,
        xp: xpToAward,
        level: 1,
        total_messages: 0,
        total_posts: 0,
        total_reactions: 0,
        ...initialActivityCounters,
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    user = newUser;
    
    // Set cooldown for new user
    await setCooldown(userId);

    // Log activity for new user
    await supabaseAdmin.from('activity_log').insert({
      user_id: userId,
      experience_id: experienceId,
      activity_type: activityType,
      xp_awarded: xpToAward,
    });

    return {
      success: true,
      xpAwarded: xpToAward,
      leveledUp: false, // New users don't level up immediately
      newLevel: undefined,
    };
  } else {
    // Update existing user
    const newXp = user.xp + xpToAward;
    const currentLevel = user.level;
    const newLevel = calculateLevel(newXp);
    const leveledUp = newLevel > currentLevel;

    // Increment activity counter
    const activityField = `total_${activityType}s`;
    
    await supabaseAdmin
      .from('users')
      .update({
        xp: newXp,
        level: newLevel,
        [activityField]: (user[activityField] || 0) + 1,
        last_activity_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('experience_id', experienceId);

    // Set cooldown
    await setCooldown(userId);

    // Log activity 
    await supabaseAdmin.from('activity_log').insert({
      user_id: userId,
      experience_id: experienceId,
      activity_type: activityType,
      xp_awarded: xpToAward,
    });

    return {
      success: true,
      xpAwarded: xpToAward,
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
    };
  }
}

// Calculate level from XP (MEE6 formula)
export function calculateLevel(xp: number): number {
  let level = 1;
  let xpNeeded = xpForNextLevel(level);

  while (xp >= xpNeeded) {
    level++;
    xpNeeded += xpForNextLevel(level);
  }

  return level;
}

// Calculate XP needed for next level
export function xpForNextLevel(currentLevel: number): number {
  return 5 * (currentLevel ** 2) + 50 * currentLevel + 100;
}
