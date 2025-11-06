import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { hasPremiumAccess } from '@/lib/rewards';
import { checkRateLimit } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

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
    const isRateLimited = await checkRateLimit(`analytics_get:${authResult.userId}`, 10);
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const experienceId = searchParams.get('experienceId');
    const timeframe = searchParams.get('timeframe') || '7d'; // Default to 7 days

    if (!experienceId) {
      return NextResponse.json(
        { error: 'experienceId is required' },
        { status: 400 }
      );
    }

    // Check if user has premium access
    const hasAccess = await hasPremiumAccess(authResult.userId, experienceId!); // Assert not null after check
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Premium tier required to access analytics' },
        { status: 403 }
      );
    }

    // Calculate date range based on timeframe
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '24h':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid timeframe. Use 24h, 7d, 30d, or 90d' },
          { status: 400 }
        );
    }

    const { supabaseAdmin } = await import('@/lib/db');

    // Get engagement metrics
    const engagementQuery = supabaseAdmin
      .from('activity_log')
      .select('*')
      .eq('experience_id', experienceId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    const { data: activityData, error: activityError } = await engagementQuery;

    if (activityError) {
      Sentry.captureException(activityError);
      throw activityError;
    }

    // Calculate metrics
    const totalActivities = activityData?.length || 0;
    
    // Group by activity type
    const activityByType: Record<string, number> = {};
    const xpByDay: Record<string, number> = {};
    
    activityData?.forEach(activity => {
      const date = new Date(activity.timestamp).toISOString().split('T')[0];
      const type = activity.activity_type;
      
      // Count by activity type
      activityByType[type] = (activityByType[type] || 0) + 1;
      
      // Sum XP by day
      xpByDay[date] = (xpByDay[date] || 0) + activity.xp_awarded;
    });

    // Get user engagement stats
    const userEngagementQuery = supabaseAdmin
      .from('users')
      .select('user_id, xp, level, total_messages, total_posts, total_reactions, last_activity_at')
      .eq('experience_id', experienceId)
      .gte('last_activity_at', startDate.toISOString());

    const { data: userData, error: userError } = await userEngagementQuery;

    if (userError) {
      Sentry.captureException(userError);
      throw userError;
    }

    const activeUsers = userData?.length || 0;
    const avgXpPerUser = userData && userData.length > 0 
      ? userData.reduce((sum, user) => sum + user.xp, 0) / userData.length 
      : 0;

    // Get leaderboard for the period
    const leaderboard = userData
      ? [...userData]
          .sort((a, b) => b.xp - a.xp)
          .slice(0, 10)
          .map((user, index) => ({
            rank: index + 1,
            userId: user.user_id,
            xp: user.xp,
            level: user.level
          }))
      : [];

    // Prepare response
    const analyticsData = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        timeframe
      },
      engagement: {
        totalActivities,
        activeUsers,
        avgXpPerUser: Math.round(avgXpPerUser),
        activityByType,
        xpByDay
      },
      leaderboard
    };

    return NextResponse.json({ 
      analytics: analyticsData,
      success: true
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching analytics.' },
      { status: 500 }
    );
  }
}

// POST endpoint for custom analytics queries or aggregation
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
    const isRateLimited = await checkRateLimit(`analytics_post:${authResult.userId}`, 5);
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Check if user has premium access
    const body = await req.json();
    const { experienceId, query } = body;

    if (!experienceId) {
      return NextResponse.json(
        { error: 'experienceId is required' },
        { status: 400 }
      );
    }

    const hasAccess = await hasPremiumAccess(authResult.userId, experienceId!); // Assert not null after check
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Premium tier required to access analytics' },
        { status: 403 }
      );
    }

    // For now, just return a placeholder response
    // In a real implementation, this would support more complex queries
    return NextResponse.json({
      message: 'Custom analytics query not implemented yet',
      query,
      experienceId
    });

  } catch (error) {
    console.error('Error in analytics POST:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing analytics query.' },
      { status: 500 }
    );
  }
}