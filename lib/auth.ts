import { NextRequest } from 'next/server';
import { whopsdk } from './whop-sdk';

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
    // Extract token from headers (this is a simplified approach)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        userId: null,
        companyId: null,
        hasAccess: false,
        error: 'Missing or invalid authorization header'
      };
    }

    const token = authHeader.substring(7);
    
    // Verify the token (this should use whopsdk.verifyUserToken)
    // For now, we'll create a simplified verification based on the pattern used in dashboard
    const { headers } = await import('next/headers');
    const whopResult = await whopsdk.verifyUserToken(await headers());

    const userId = whopResult.userId;
    const companyId = requiredCompanyId; // Extract from request if needed

    // Check if user has access to the specific resource
    if (companyId) {
      const access = await whopsdk.users.checkAccess(companyId, { id: userId });
      if (!access) {
        return {
          userId,
          companyId,
          hasAccess: false,
          error: 'User does not have access to this resource'
        };
      }
    }

    return {
      userId,
      companyId: companyId || null,
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

  return {
    success: true,
    userId: authResult.userId,
    companyId: authResult.companyId
  };
}