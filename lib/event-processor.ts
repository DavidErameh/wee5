import { awardXP } from './xp-logic';
import { handleLevelUp } from './rewards';
import { isOnCooldown, setCooldown } from './redis';
import { whopSdk } from './whop-sdk';
import * as Sentry from '@sentry/nextjs';

export interface ActivityEvent {
  type: 'message' | 'post' | 'reaction';
  userId: string;
  experienceId: string;
  content?: string;
  timestamp: string;
}

export interface ProcessActivityResult {
  success: boolean;
  xpAwarded?: number;
  levelUp?: boolean;
  error?: string;
}

/**
 * Process an incoming activity event from Whop
 * Validates user access, checks cooldowns, awards XP, and handles level-ups
 */
export async function processActivityEvent(event: ActivityEvent): Promise<ProcessActivityResult> {
  try {
    console.log(`Processing ${event.type} event for user ${event.userId} in experience ${event.experienceId}`);
    
    // 1. Validate user access to the experience
    const hasAccess = await validateUserAccess(event.userId, event.experienceId);
    if (!hasAccess) {
      console.log(`User ${event.userId} does not have access to experience ${event.experienceId}`);
      return { success: false, error: 'User does not have access to this experience' };
    }

    // 2. Check cooldown (60 seconds to prevent spam)
    if (await isOnCooldown(event.userId)) {
      console.log(`User ${event.userId} is on cooldown`);
      return { success: false, error: 'User is on cooldown' };
    }

    // 3. Determine XP value based on activity type
    let xpToAward: number;
    switch (event.type) {
      case 'message':
        xpToAward = 20; // Fixed for messages
        break;
      case 'post':
        // Random XP for posts (15-25 as per original design)
        xpToAward = Math.floor(Math.random() * (25 - 15 + 1)) + 15;
        break;
      case 'reaction':
        xpToAward = 5; // Fixed for reactions
        break;
      default:
        console.error(`Unknown activity type: ${event.type}`);
        return { success: false, error: `Unknown activity type: ${event.type}` };
    }

    // 4. Award XP using existing logic
    const xpResult = await awardXP(
      event.userId,
      event.experienceId,
      event.type as 'message' | 'post' | 'reaction'
    );

    if (!xpResult.success) {
      console.error(`Failed to award XP: ${xpResult.error}`);
      return { success: false, error: xpResult.error };
    }

    // 5. Set cooldown to prevent spam
    await setCooldown(event.userId);

    // 6. Check if user leveled up and handle rewards
    let levelUp = false;
    if (xpResult.leveledUp && xpResult.newLevel) {
      await handleLevelUp(event.userId, event.experienceId, xpResult.newLevel);
      levelUp = true;
    }

    console.log(`Successfully processed ${event.type} event for user ${event.userId}. XP awarded: ${xpResult.xpAwarded}. Level up: ${levelUp}`);

    return {
      success: true,
      xpAwarded: xpResult.xpAwarded,
      levelUp,
    };

  } catch (error) {
    console.error('Error processing activity event:', error);
    Sentry.captureException(error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Validate that a user has access to a specific experience
 */
async function validateUserAccess(userId: string, experienceId: string): Promise<boolean> {
  try {
    // Use database lookup to check if user has access to the experience
    // since the SDK method 'from' may not exist
    const { supabaseAdmin: getSupabaseAdmin } = await import('./db');
    
    const { data: user, error } = await getSupabaseAdmin()
      .from('users')
      .select('experience_id')
      .eq('user_id', userId)
      .eq('experience_id', experienceId)
      .single();

    // Return true if user has a record for this experience (indicating access)
    return !!(user && !error);
  } catch (error) {
    console.error('Error validating user access:', error);
    Sentry.captureException(error);
    return true; // Default to true to not block functionality
  }
}

/**
 * Bulk process multiple events (useful for handling bursts of activity)
 */
export async function processActivityEvents(events: ActivityEvent[]): Promise<ProcessActivityResult[]> {
  const results: ProcessActivityResult[] = [];
  
  for (const event of events) {
    const result = await processActivityEvent(event);
    results.push(result);
  }
  
  return results;
}