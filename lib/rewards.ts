/**
 * Rewards System with Whop SDK Integration
 * Per Documentation: 01_START HERE.MD, 03_CORE FEATURE.MD, 06_PAYMENTS.MD
 * 
 * Implements automated reward delivery using Whop SDK for:
 * - Free membership days
 * - Discount promo codes
 * - Push notifications
 */

import {
  addFreeDaysToMembership,
  createPromoCode,
  sendPushNotification,
  listUserMemberships,
  getMembership
} from './whop-sdk-wrapper';
import { supabaseAdmin } from './db';
import * as Sentry from '@sentry/nextjs';

// Reward tier definitions per documentation
export const REWARD_TIERS = {
  5: { type: 'free_days', value: 3 },
  10: { type: 'free_days', value: 7 },
  25: { type: 'free_days', value: 14 },
  50: { type: 'free_days', value: 30 },
  100: { type: 'discount', value: 50 },
} as const;

export type RewardTier = keyof typeof REWARD_TIERS;

interface HandleLevelUpResult {
  success: boolean;
  rewardGiven?: boolean;
  rewardType?: string;
  rewardValue?: string | number;
  error?: string;
}

// Define retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

/**
 * Exponential backoff with jitter helper
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff and jitter
      const baseDelay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 0.3 * baseDelay; // Add up to 30% jitter
      const delay = Math.min(baseDelay + jitter, RETRY_CONFIG.maxDelay);

      console.warn(`Operation failed (attempt ${attempt}), retrying in ${Math.round(delay)}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Handle level-up rewards with Whop SDK integration
 * Awards free days or creates promo codes automatically
 */
export async function handleLevelUp(
  userId: string,
  experienceId: string,
  oldLevel: number,
  newLevel: number
): Promise<HandleLevelUpResult> {
  try {
    // Check if this level has a reward
    const reward = REWARD_TIERS[newLevel as RewardTier];
    if (!reward) {
      return { success: true, rewardGiven: false };
    }

    // Check if reward already claimed
    const { data: existingReward } = await supabaseAdmin
      .from('rewards')
      .select('*')
      .eq('user_id', userId)
      .eq('experience_id', experienceId)
      .eq('level_achieved', newLevel)
      .single();

    if (existingReward) {
      console.log(`Reward for level ${newLevel} already claimed by user ${userId}`);
      return { success: true, rewardGiven: false };
    }

    // Get user's active membership from Whop
    let whopMembershipId = null;
    let rewardApplied = false;
    let retryCount = 0;

    try {
      // Fetch user's memberships from Whop SDK with retry logic
      const memberships = await retryWithBackoff(async () => {
        const result = await listUserMemberships(userId);
        if (!result.data || result.data.length === 0) {
          throw new Error('No memberships found for user');
        }
        return result;
      });

      const activeMembership = memberships.data?.find(
        (m: any) => m.experience_id === experienceId && m.status === 'active'
      );

      if (!activeMembership) {
        console.error(`No active membership found for user ${userId} in experience ${experienceId}`);
        return {
          success: true,
          rewardGiven: false,
          error: 'No active membership found'
        };
      }

      whopMembershipId = activeMembership.id;

      // Apply reward via Whop SDK with retry logic
      if (reward.type === 'free_days') {
        // Add free days to membership using SDK with retry
        await retryWithBackoff(() => addFreeDaysToMembership(whopMembershipId!, reward.value));
        console.log(`✅ Added ${reward.value} free days to membership ${whopMembershipId}`);
        rewardApplied = true;
      } else if (reward.type === 'discount') {
        // Create promo code for discount using SDK with retry
        const promoCode = await retryWithBackoff(() => createPromoCode({
          code: `LEVEL${newLevel}_${userId.substring(0, 8)}`,
          discountPercent: reward.value,
          maxUses: 1,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        }));
        console.log(`✅ Created ${reward.value}% discount promo code: ${promoCode.code}`);
        rewardApplied = true;
      }
    } catch (apiError) {
      console.error('Error applying reward via Whop API (after retries):', apiError);
      Sentry.captureException(apiError, {
        tags: { operation: 'reward-delivery' },
        extra: { userId, experienceId, level: newLevel, rewardType: reward?.type }
      });

      // Continue to record in database even if API call fails after retries
      // This ensures the reward is tracked for manual processing if needed
    }

    // Record reward in database
    try {
      await supabaseAdmin.from('rewards').insert({
        user_id: userId,
        experience_id: experienceId,
        level_achieved: newLevel,
        reward_type: reward.type,
        reward_value: reward.value.toString(),
        whop_membership_id: whopMembershipId || `pending_${userId}_${newLevel}`,
        created_at: new Date().toISOString(),
      });
    } catch (dbError) {
      console.error('Failed to record reward in database:', dbError);
      Sentry.captureException(dbError, {
        tags: { operation: 'reward-storage' },
        extra: { userId, experienceId, level: newLevel }
      });
      // Don't fail the whole process if DB fails, but log it
    }

    console.log(`✅ Level ${newLevel} reward processed for user ${userId}: ${reward.type} = ${reward.value}`);

    // Send push notification to user about reward using SDK with retry
    try {
      await retryWithBackoff(() => sendPushNotification({
        userId,
        title: `🎉 Level ${newLevel} Reward!`,
        message: `You've earned ${reward.value} ${reward.type === 'free_days' ? 'free days' : '% discount'}!`,
        experienceId,
      }));
      console.log(`✅ Sent reward notification to user ${userId}`);
    } catch (notifError) {
      console.error('Failed to send reward notification (after retries):', notifError);
      Sentry.captureException(notifError, {
        tags: { operation: 'notification-send' },
        extra: { userId, experienceId, level: newLevel }
      });
      // Don't fail the whole operation if notification fails after retries
    }

    return {
      success: true,
      rewardGiven: rewardApplied,
      rewardType: reward.type,
      rewardValue: reward.value,
    };

  } catch (error) {
    console.error('Error handling level-up reward:', error);
    Sentry.captureException(error, {
      tags: { operation: 'level-up-processing' },
      extra: { userId, experienceId, oldLevel, newLevel }
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      rewardGiven: false
    };
  }
}

/**
 * Check if a user has access to premium features based on their tier
 */
export async function hasPremiumAccess(userId: string, experienceId: string): Promise<boolean> {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('tier')
      .eq('user_id', userId)
      .eq('experience_id', experienceId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // No row found is OK
        Sentry.captureException(error);
      }
      return false;
    }

    return user?.tier === 'premium' || user?.tier === 'enterprise' || user?.tier === 'lifetime';
  } catch (error) {
    console.error('Error checking premium access:', error);
    Sentry.captureException(error);
    return false;
  }
}

/**
 * Check if a user has enterprise access
 */
export async function hasEnterpriseAccess(userId: string, experienceId: string): Promise<boolean> {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('tier')
      .eq('user_id', userId)
      .eq('experience_id', experienceId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        Sentry.captureException(error);
      }
      return false;
    }

    return user?.tier === 'enterprise' || user?.tier === 'lifetime';
  } catch (error) {
    console.error('Error checking enterprise access:', error);
    Sentry.captureException(error);
    return false;
  }
}
