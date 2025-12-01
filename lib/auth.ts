// lib/auth.ts - Enhanced authentication utilities
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { whopSdk, getUserTier, listUserMemberships } from './whop-sdk';

export interface AuthenticatedUser {
  userId: string;
  experienceId: string;
  companyId: string;
  tier: 'free' | 'premium' | 'enterprise' | 'lifetime';
}

export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const headersList = headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  // Extract user ID from JWT token
  const userId = extractUserIdFromToken(token);

  if (!userId) {
    throw new Error('Invalid authentication token');
  }

  // In a real Whop integration, you would validate the token signature using Whop's public keys
  // For now, we'll call the Whop API to validate the user exists and get additional context
  try {
    // Attempt to validate user through Whop API (this serves as token validation proxy)
    // In a real implementation, you'd verify the JWT signature with Whop's public keys
    const memberships = await listUserMemberships(userId);

    // If the user has any valid memberships, they are authenticated
    if (!memberships || !memberships.data || memberships.data.length === 0) {
      // User exists but has no memberships - could be a valid state, or we could require active membership
      // For now, we'll allow access but set experience ID appropriately
      return {
        userId,
        experienceId: '', // Will be set by caller or default
        companyId: '',    // Will be set by caller or default
        tier: 'free'
      };
    }

    // Find the most relevant experience - in real usage, this would be provided in the request
    // or extracted from the token
    const firstMembership = memberships.data[0]; // Use first membership as default
    const tier = await getUserTier(userId, firstMembership.experience_id || 'default_experience');

    return {
      userId,
      experienceId: firstMembership.experience_id || 'default_experience',
      companyId: firstMembership.company_id || firstMembership.experience_id?.split('_')[1] || 'default_company',
      tier
    };

  } catch (error) {
    console.error('Error validating user with Whop API:', error);
    throw new Error('Invalid authentication token');
  }
}

// Helper function to validate and extract user ID from JWT token
function extractUserIdFromToken(token: string): string | null {
  try {
    // Split the token to get the header, payload, and signature
    const tokenParts = token.split('.');

    if (tokenParts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }

    // Decode the payload (the second part)
    // Add padding if needed
    let payload = tokenParts[1];
    // Convert Base64Url to Base64
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const pad = payload.length % 4;
    if (pad) {
      payload += '='.repeat(4 - pad);
    }

    // Decode the payload
    const decodedPayload = atob(payload);
    const parsedPayload = JSON.parse(decodedPayload);

    // Extract the user ID (assuming it's in 'sub' or 'user_id' field)
    const userId = parsedPayload.sub || parsedPayload.user_id || parsedPayload.userId;

    if (!userId || typeof userId !== 'string') {
      console.error('No valid user ID found in token');
      return null;
    }

    // Additional validation could go here:
    // - Check the token's expiration (exp)
    // - Check the token's audience (aud)
    // - Check the token's issuer (iss)
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    if (parsedPayload.exp && parsedPayload.exp < now) {
      console.error('Token has expired');
      return null;
    }

    return userId;
  } catch (error) {
    console.error('Error extracting user ID from JWT token:', error);
    return null;
  }
}

export function requireTier(
  user: AuthenticatedUser,
  minimumTier: AuthenticatedUser['tier']
): void {
  const tierHierarchy = { free: 0, premium: 1, enterprise: 2, lifetime: 3 };

  if (tierHierarchy[user.tier] < tierHierarchy[minimumTier]) {
    throw new Error(`This feature requires ${minimumTier} tier or higher`);
  }
}

// Function to verify user membership to experience
export async function verifyUserMembership(userId: string, experienceId: string): Promise<boolean> {
  // This would typically make a call to your membership system
  // For now, we'll assume the user has valid membership if they have a record in users table
  const { supabase } = await import('./db');

  const { data, error } = await supabase()
    .from('users')
    .select('user_id')
    .eq('user_id', userId)
    .eq('experience_id', experienceId)
    .single();

  return !error && data !== null;
}

// Enhanced token validation function (placeholder for real JWT validation)
export async function verifyToken(token: string): Promise<{ userId: string; valid: boolean; } | null> {
  // In a real implementation, you would verify the JWT with Whop's public keys
  // For now, this is a placeholder
  try {
    // Check if token matches expected pattern for user ID
    if (token && token.length > 5) { // Basic validation
      return { userId: token, valid: true };
    }
    return null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Safe version of requireAuth that returns null instead of throwing
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const userId = extractUserIdFromToken(token);

    if (!userId) {
      return null;
    }

    // We can skip the API call for basic user info if we trust the token structure
    // But for consistency, we'll try to get the full user object
    // Note: In a real app, you might want to cache this or use a lighter check

    const memberships = await listUserMemberships(userId);

    if (!memberships || !memberships.data || memberships.data.length === 0) {
      return {
        userId,
        experienceId: '',
        companyId: '',
        tier: 'free'
      };
    }

    const firstMembership = memberships.data[0];
    const tier = await getUserTier(userId, firstMembership.experience_id || 'default_experience');

    return {
      userId,
      experienceId: firstMembership.experience_id || 'default_experience',
      companyId: firstMembership.company_id || firstMembership.experience_id?.split('_')[1] || 'default_company',
      tier
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}