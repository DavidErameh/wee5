import { NextRequest } from 'next/server';
import { whopSdk } from './whop-sdk';

interface AuthResult {
  userId: string | null;
  companyId: string | null;
  hasAccess: boolean;
  error?: string;
}

// Verify user access to a specific company/experience
export async function verifyUserAccess(
  request: NextRequest,
  requiredCompanyId?: string
): Promise<AuthResult> {
  try {
    // Extract user ID from request - this depends on how Whop passes auth
    // In typical Whop apps, the user ID is available in the request context
    // For now, we'll look for it in the URL parameters or headers
    
    const userId = request.headers.get('x-whop-user-id') || 
                   request.nextUrl.searchParams.get('userId') ||
                   request.nextUrl.searchParams.get('user_id') ||
                   null;

    if (!userId) {
      return {
        userId: null,
        companyId: null,
        hasAccess: false,
        error: 'No user ID found in request'
      };
    }

    // Check if user has access to the specific resource using Whop SDK
    if (requiredCompanyId) {
      try {
        // Check if user has access to the specific resource using database validation
        // since the SDK method 'from' may not exist
        const { supabaseAdmin: getSupabaseAdmin } = await import('./db');
        const { data: userMembership, error: membershipError } = await getSupabaseAdmin()
          .from('users')
          .select('experience_id')
          .eq('user_id', userId)
          .eq('experience_id', requiredCompanyId!)
          .single();

        if (membershipError && membershipError.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Database error checking user access:', membershipError);
          return {
            userId,
            companyId: requiredCompanyId,
            hasAccess: false,
            error: 'Error verifying user access'
          };
        }

        const hasDatabaseAccess = !!(userMembership && !membershipError);
        
        if (!hasDatabaseAccess) {
          return {
            userId,
            companyId: requiredCompanyId,
            hasAccess: false,
            error: 'User does not have access to this resource'
          };
        }

        return {
          userId,
          companyId: requiredCompanyId,
          hasAccess: true
        };
      } catch (error) {
        console.error(`Error verifying access for user ${userId} in company ${requiredCompanyId}:`, error);
        return {
          userId,
          companyId: requiredCompanyId,
          hasAccess: false,
          error: 'Failed to verify access'
        };
      }
    }

    return {
      userId,
      companyId: requiredCompanyId || null,
      hasAccess: true
    };

  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      userId: null,
      companyId: null,
      hasAccess: false,
      error: 'Authentication failed'
    };
  }
}

// Helper to verify access in API routes
export async function requireAuth(request: NextRequest, companyId?: string) {
  const authResult = await verifyUserAccess(request, companyId);
  
  if (!authResult.hasAccess) {
    return {
      success: false,
      error: authResult.error || 'Unauthorized access',
      status: 401
    };
  }

  // Get user tier from database
  const { supabase: getSupabase } = await import('@/lib/db');
  const { data: userData, error: userError } = await getSupabase()
    .from('users')
    .select('tier')
    .eq('user_id', authResult.userId!)
    .single();

  return {
    success: true,
    userId: authResult.userId!,
    companyId: authResult.companyId,
    tier: userData?.tier || 'free'
  };
}