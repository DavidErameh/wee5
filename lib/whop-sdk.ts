/**
 * Whop SDK Configuration
 * Per Documentation: 02_TECH STACK.MD and 05_ARCHITECTURE.MD
 * 
 * This file initializes the Whop SDK client for server-side operations
 * including memberships, notifications, and API interactions.
 * 
 * INSTALLATION REQUIRED:
 * Run: pnpm add @whop/api
 */

import { WhopServerSdk } from '@whop/api';

// Standard SDK instance (for most operations)
export const whopSdk = WhopServerSdk({
  appApiKey: process.env.WHOP_API_KEY!,
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
});

// Legacy export for backward compatibility
export const whopClient = whopSdk;

// Agent SDK instance (for actions on behalf of agent user)
export const agentSdk = WhopServerSdk({
  appApiKey: process.env.WHOP_API_KEY!,
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
  onBehalfOfUserId: process.env.WHOP_AGENT_USER_ID!,
});

// GraphQL headers for DM/post operations
export const getAgentHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
  'x-on-behalf-of': process.env.WHOP_AGENT_USER_ID!,
});

// Helper function to get SDK client with user context
export function getWhopClientForUser(userId: string) {
  return whopSdk.withUser(userId);
}

// Membership helpers using SDK
export async function addFreeDaysToMembership(membershipId: string, days: number) {
  try {
    const result = await whopClient.memberships.addFreeDays({
      id: membershipId,
      days,
    });
    return result;
  } catch (error) {
    console.error('Error adding free days:', error);
    throw error;
  }
}

// Notification helpers using SDK
export async function sendPushNotification(params: {
  userId: string;
  title: string;
  message: string;
  experienceId?: string;
}) {
  try {
    const result = await whopClient.notifications.sendPushNotification({
      user_id: params.userId,
      title: params.title,
      body: params.message,
      experience_id: params.experienceId,
    });
    return result;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

// Promo code helpers using SDK
export async function createPromoCode(params: {
  code: string;
  discountPercent: number;
  maxUses?: number;
  expiresAt?: Date;
}) {
  try {
    const result = await whopClient.promoCodes.create({
      code: params.code,
      discount_percent: params.discountPercent,
      max_uses: params.maxUses,
      expires_at: params.expiresAt?.toISOString(),
    });
    return result;
  } catch (error) {
    console.error('Error creating promo code:', error);
    throw error;
  }
}

// Experience helpers using SDK
export async function getExperience(experienceId: string) {
  try {
    const result = await whopClient.experiences.get({
      id: experienceId,
    });
    return result;
  } catch (error) {
    console.error('Error fetching experience:', error);
    throw error;
  }
}

// Membership helpers
export async function getMembership(membershipId: string) {
  try {
    const result = await whopClient.memberships.get({
      id: membershipId,
    });
    return result;
  } catch (error) {
    console.error('Error fetching membership:', error);
    throw error;
  }
}

export async function listUserMemberships(userId: string) {
  try {
    const result = await whopClient.memberships.list({
      user_id: userId,
    });
    return result;
  } catch (error) {
    console.error('Error listing memberships:', error);
    throw error;
  }
}

// User tier detection helper
export async function getUserTier(userId: string, experienceId: string): Promise<'free' | 'premium' | 'enterprise' | 'lifetime'> {
  try {
    const memberships = await listUserMemberships(userId);
    
    // Find membership for this experience
    const membership = memberships.data?.find(
      (m: any) => m.experience_id === experienceId
    );
    
    if (!membership) {
      return 'free';
    }
    
    // Check plan metadata for tier
    const planId = membership.plan_id;
    
    if (planId?.includes('lifetime')) {
      return 'lifetime';
    } else if (planId?.includes('enterprise')) {
      return 'enterprise';
    } else if (planId?.includes('premium')) {
      return 'premium';
    }
    
    return 'free';
  } catch (error) {
    console.error('Error detecting user tier:', error);
    return 'free';
  }
}

// Validate user has premium access
export async function hasPremiumAccess(userId: string, experienceId: string): Promise<boolean> {
  const tier = await getUserTier(userId, experienceId);
  return ['premium', 'enterprise', 'lifetime'].includes(tier);
}

// Validate user has enterprise access
export async function hasEnterpriseAccess(userId: string, experienceId: string): Promise<boolean> {
  const tier = await getUserTier(userId, experienceId);
  return ['enterprise', 'lifetime'].includes(tier);
}

export default whopClient;
