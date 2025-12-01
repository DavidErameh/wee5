/**
 * WebSocket Event Processor
 * Per Documentation: WebSocket & Agent Implementation Guide
 *
 * Processes incoming WebSocket events and awards XP in real-time.
 * Integrates with direct DB operations, Redis cooldown system, and atomic XP operations.
 */

import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import * as Sentry from "@sentry/nextjs";

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface ActivityEvent {
  type: "chat" | "forum" | "reaction";
  userId: string;
  experienceId: string;
  companyId: string;
  content?: string;
  timestamp: number;
}

/**
 * Process incoming WebSocket events from Whop
 */
export async function processWebSocketEvent(message: any): Promise<void> {
  const startTime = Date.now();

  try {
    // Extract chat message (DMs and channel messages)
    const chatMessage = message.feedEntity?.dmsPost;
    if (chatMessage) {
      console.log("[Event Processor] Processing chat message");
      await processActivityEvent({
        type: "chat",
        userId: chatMessage.user?.id || chatMessage.author_id,
        experienceId: chatMessage.experienceId || chatMessage.experience_id || "default",
        companyId: chatMessage.companyId || chatMessage.company_id,
        content: chatMessage.message || chatMessage.content,
        timestamp: Date.now(),
      });

      const duration = Date.now() - startTime;
      console.log(`[Event Processor] Chat message processed in ${duration}ms`);
      return;
    }

    // Extract forum post
    const forumPost = message.feedEntity?.forumPost;
    if (forumPost) {
      console.log("[Event Processor] Processing forum post");
      await processActivityEvent({
        type: "forum",
        userId: forumPost.user?.id || forumPost.author_id,
        experienceId: forumPost.experienceId || forumPost.experience_id || "default",
        companyId: forumPost.companyId || forumPost.company_id,
        content: forumPost.content,
        timestamp: Date.now(),
      });

      const duration = Date.now() - startTime;
      console.log(`[Event Processor] Forum post processed in ${duration}ms`);
      return;
    }

    // If neither chat nor forum, log and skip
    console.log("[Event Processor] Unknown event type, skipping:", {
      hasChat: !!chatMessage,
      hasForum: !!forumPost,
      keys: Object.keys(message.feedEntity || {}),
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("[Event Processor] Error processing event:", error);

    Sentry.captureException(error, {
      tags: {
        service: 'event-processor',
        operation: 'processWebSocketEvent',
      },
      contexts: {
        performance: { duration_ms: duration },
        message: {
          hasChat: !!message.feedEntity?.dmsPost,
          hasForum: !!message.feedEntity?.forumPost,
        },
      },
    });
  }
}

/**
 * Process a single activity event
 */
export async function processActivityEvent(event: ActivityEvent): Promise<void> {
  const { type, userId, experienceId, companyId, content } = event;

  console.log(`[Event Processor] Processing ${type} for user ${userId}`);

  try {
    // Step 1: Validate user ID format
    if (!userId?.startsWith('user_')) {
      console.error(`[Event Processor] Invalid user ID format: ${userId}`);
      return;
    }

    // Step 2: Check cooldown
    const cooldownKey = `cooldown:${userId}:${experienceId}:${type}`;
    const isOnCooldown = await redis.get(cooldownKey);

    if (isOnCooldown) {
      console.log(`[Event Processor] User ${userId} on cooldown for ${type}, skipping`);
      return;
    }

    // Step 3: Determine XP amount
    let xpAmount = 0;
    switch (type) {
      case "chat":
        xpAmount = 20;
        break;
      case "forum":
        // Random between 15-25 XP for forum posts
        xpAmount = Math.floor(Math.random() * 11) + 15;
        break;
      case "reaction":
        xpAmount = 5;
        break;
    }

    // Step 4: Award XP using enhanced function with deduplication
    const { awardXP } = await import('./xp-logic');
    const result = await awardXP({
      userId,
      experienceId,
      activityType: type === 'chat' ? 'message' : type === 'forum' ? 'post' : 'reaction',
      activityId: `${userId}_${Date.now()}_${type}` // Create a unique activity ID for deduplication
    });

    if (!result.success) {
      if (result.reason === 'cooldown' || result.reason === 'duplicate') {
        // These are expected conditions, not errors
        console.log(`[Event Processor] Skipped activity for ${userId} - ${result.reason}`);
        return;
      }
      throw new Error(`XP awarding failed: ${result.message || 'Unknown error'}`);
    }

    console.log(`[Event Processor] Awarded ${result.xpAwarded} XP to ${userId}. ` +
      `Total: ${result.xp} XP, Level: ${result.level}`);

    // Step 5: Set cooldown (60 seconds)
    await redis.set(cooldownKey, "1", { ex: 60 });

    // Step 6: Handle level up if applicable
    if (result.leveledUp) {
      console.log(`[Event Processor] User ${userId} leveled up to ${result.level}!`);

      // Process level up asynchronously (don't block event processing)
      import('./rewards').then(async ({ handleLevelUp }) => {
        await handleLevelUp(userId, experienceId, result.level - 1, result.level);
      });
    }

    // Step 7: Log activity for analytics
    await logActivity(userId, experienceId, type, result.xpAwarded, result.oldLevel, result.newLevel);

  } catch (error) {
    console.error(`[Event Processor] Error processing ${type} for ${userId}:`, error);
    throw error;
  }
}

/**
 * Handle level up rewards and notifications
 */
async function handleLevelUp(
  userId: string,
  experienceId: string,
  oldLevel: number,
  newLevel: number
): Promise<void> {
  try {
    console.log(`[Level Up] Processing level ${newLevel} for user ${userId}`);

    // Check if this level has a reward
    const reward = await getRewardForLevel(experienceId, newLevel);

    if (reward) {
      console.log(`[Level Up] Delivering reward:`, reward);
      await deliverReward(userId, experienceId, newLevel, reward);
    }

    // Send notification
    await sendLevelUpNotification(userId, newLevel, reward);

    // Log to database
    await supabase.from('level_ups').insert({
      user_id: userId,
      experience_id: experienceId,
      old_level: oldLevel,
      new_level: newLevel,
      reward_delivered: !!reward,
      created_at: new Date().toISOString(),
    });

    console.log(`[Level Up] Completed for user ${userId}`);

  } catch (error) {
    console.error(`[Level Up] Error for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get reward configuration for a level
 */
async function getRewardForLevel(
  experienceId: string,
  level: number
): Promise<{ type: string; value: string } | null> {
  // Check custom rewards first
  const { data: customReward } = await supabase
    .from('rewards_configs')
    .select('*')
    .eq('experience_id', experienceId)
    .eq('level_threshold', level)
    .maybeSingle();

  if (customReward) {
    return {
      type: customReward.reward_type,
      value: customReward.reward_value,
    };
  }

  // Fall back to default rewards
  const DEFAULT_REWARDS: Record<number, { type: string; value: string }> = {
    5: { type: 'free_days', value: '3' },
    10: { type: 'free_days', value: '7' },
    25: { type: 'free_days', value: '14' },
    50: { type: 'free_days', value: '30' },
    100: { type: 'discount', value: '50' },
  };

  return DEFAULT_REWARDS[level] || null;
}

/**
 * Deliver reward via Whop API
 */
async function deliverReward(
  userId: string,
  experienceId: string,
  level: number,
  reward: { type: string; value: string }
): Promise<void> {
  // Implementation from previous guide
  // Uses Whop SDK to add free days, create promo codes, etc.
  console.log(`[Reward] Delivering ${reward.type}:${reward.value} to ${userId}`);

  // TODO: Implement actual Whop API calls
  // - Get membership ID
  // - Apply reward based on type
  // - Log to reward_history table
}

/**
 * Send level up notification
 */
async function sendLevelUpNotification(
  userId: string,
  level: number,
  reward: { type: string; value: string } | null
): Promise<void> {
  let message = `Congratulations! You've reached Level ${level}!`;

  if (reward) {
    if (reward.type === 'free_days') {
      message += ` You've earned ${reward.value} free days!`;
    } else if (reward.type === 'discount') {
      message += ` You've unlocked a ${reward.value}% discount!`;
    }
  }

  console.log(`[Notification] Sending to ${userId}:`, message);

  // TODO: Implement Whop notification API call
}

/**
 * Log activity for analytics
 */
async function logActivity(
  userId: string,
  experienceId: string,
  type: string,
  xpAwarded: number,
  oldLevel: number,
  newLevel: number
): Promise<void> {
  const { error } = await supabase.from('activity_log').insert({
    user_id: userId,
    experience_id: experienceId,
    activity_type: type,
    xp_awarded: xpAwarded,
    level_before: oldLevel,
    level_after: newLevel,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[Activity Log] Error:", error);
  }
}