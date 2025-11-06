import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { hasPremiumAccess } from '@/lib/rewards';
import { checkRateLimit } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

// GET endpoint to list communities for enterprise users
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Apply rate limit
    const isRateLimited = await checkRateLimit(`enterprise_get:${authResult.userId}`, 10);
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if user has enterprise access
    // For enterprise users, we check if they have 'enterprise' tier in any community
    const { supabaseAdmin } = await import('@/lib/db');
    
    const { data: enterpriseUsers, error } = await supabaseAdmin
      .from('users')
      .select('experience_id, tier')
      .eq('user_id', userId!)
      .eq('tier', 'enterprise');

    if (error) {
      Sentry.captureException(error);
      throw error;
    }

    if (!enterpriseUsers || enterpriseUsers.length === 0) {
      return NextResponse.json(
        { error: 'Enterprise tier required for this feature' },
        { status: 403 }
      );
    }

    // Get all communities where user has enterprise access
    const communityIds = enterpriseUsers.map(user => user.experience_id);
    
    // Get additional community details if needed
    // For this implementation, we'll just return the experience IDs
    // In a real implementation, we would fetch more details from Whop

    return NextResponse.json({ 
      communities: communityIds.map(id => ({ 
        id, 
        name: `Community ${id.substring(0, 8)}...` // In real implementation, fetch actual names
      })),
      total: communityIds.length
    });

  } catch (error) {
    console.error('Error fetching enterprise communities:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching enterprise communities.' },
      { status: 500 }
    );
  }
}

// POST endpoint for enterprise-specific operations
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Apply rate limit
    const isRateLimited = await checkRateLimit(`enterprise_post:${authResult.userId}`, 5);
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { action, communityId, data } = body;

    if (!action || !communityId) {
      return NextResponse.json(
        { error: 'action and communityId are required' },
        { status: 400 }
      );
    }

    // Check if user has enterprise access to this specific community
    const hasAccess = await hasPremiumAccess(authResult.userId, communityId!); // Assert not null after check
    // Note: hasPremiumAccess also returns true for enterprise users
    
    // For enterprise tier, we need to specifically check if the user has enterprise tier
    const { supabaseAdmin } = await import('@/lib/db');
    const { data: userRecord, error } = await supabaseAdmin
      .from('users')
      .select('tier')
      .eq('user_id', authResult.userId)
      .eq('experience_id', communityId)
      .single();

    if (error || !userRecord || userRecord.tier !== 'enterprise') {
      return NextResponse.json(
        { error: 'Enterprise access required for this community' },
        { status: 403 }
      );
    }

    // Process enterprise-specific actions
    switch (action) {
      case 'cross_community_analytics':
        // Aggregate analytics across multiple communities
        const aggregatedAnalytics = await getCrossCommunityAnalytics(
          authResult.userId,
          data.communityIds || [communityId!]
        );
        return NextResponse.json({ analytics: aggregatedAnalytics });

      case 'create_custom_badge':
        // Create a custom badge for the community
        const badge = await createCustomBadge(communityId, data.badgeData);
        return NextResponse.json({ badge });

      case 'get_custom_badges':
        // Get all custom badges for the community
        const badges = await getCustomBadges(communityId);
        return NextResponse.json({ badges });

      default:
        return NextResponse.json(
          { error: 'Invalid action for enterprise features' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in enterprise POST:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing enterprise request.' },
      { status: 500 }
    );
  }
}

// Helper function to get cross-community analytics
async function getCrossCommunityAnalytics(userId: string, communityIds: string[]) {
  const { supabaseAdmin } = await import('@/lib/db');
  
  // This is a simplified implementation
  // In a real implementation, this would aggregate data across multiple communities
  const results = [];
  
  for (const communityId of communityIds) {
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('xp, level, total_messages, total_posts, total_reactions')
      .eq('experience_id', communityId);
    
    if (error) {
      console.error(`Error fetching data for community ${communityId}:`, error);
      continue;
    }
    
    if (userData) {
      const totalXp = userData.reduce((sum, user) => sum + user.xp, 0);
      const totalUsers = userData.length;
      const avgXp = totalUsers > 0 ? totalXp / totalUsers : 0;
      
      results.push({
        communityId,
        totalXp,
        totalUsers,
        avgXp: Math.round(avgXp),
        topUser: userData.length > 0 ? 
          userData.reduce((top, user) => user.xp > top.xp ? user : top) : null
      });
    }
  }
  
  return {
    communities: results,
    totalCommunities: results.length,
    combinedTotalXp: results.reduce((sum, comm) => sum + comm.totalXp, 0),
    combinedTotalUsers: results.reduce((sum, comm) => sum + comm.totalUsers, 0)
  };
}

// Helper function to create custom badge
async function createCustomBadge(communityId: string, badgeData: any) {
  // In a real implementation, this would create a badge in a badges table
  // For now, we'll return a mock badge
  return {
    id: `badge_${Date.now()}`,
    communityId,
    name: badgeData.name || 'Custom Badge',
    description: badgeData.description || 'A custom badge',
    icon: badgeData.icon || '⭐',
    createdAt: new Date().toISOString(),
    ...badgeData
  };
}

// Helper function to get custom badges
async function getCustomBadges(communityId: string) {
  // In a real implementation, this would fetch from a badges table
  // For now, we'll return mock badges
  return [
    {
      id: 'badge_1',
      name: 'Top Contributor',
      description: 'Awarded to top community contributors',
      icon: '🏆',
      createdAt: new Date().toISOString()
    },
    {
      id: 'badge_2',
      name: 'Early Bird',
      description: 'Awarded to early community members',
      icon: '🐦',
      createdAt: new Date().toISOString()
    }
  ];
}