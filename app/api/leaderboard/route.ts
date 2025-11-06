import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { getCachedLeaderboard, cacheLeaderboard } from '@/lib/redis';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const LeaderboardQuerySchema = z.object({
  experienceId: z.string().min(1),
  filter: z.enum(['all-time', 'week', 'month']).default('all-time'),
  limit: z.coerce.number().min(1).max(1000).default(100),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    const validation = LeaderboardQuerySchema.safeParse({
      experienceId: searchParams.get('experienceId'),
      filter: searchParams.get('filter'),
      limit: searchParams.get('limit'),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { experienceId, filter, limit } = validation.data;

    // Apply rate limit
    const isRateLimited = await checkRateLimit(`leaderboard_get:${experienceId}`, 20); // 20 requests per minute
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Try cache first
    const cached = await getCachedLeaderboard(experienceId, filter);
    if (cached) {
      return NextResponse.json({ 
        leaderboard: cached.slice(0, limit),
        cached: true 
      });
    }

    // Get Supabase client
    const supabaseClient = supabase();

    // Build query
    let query = supabaseClient
      .from('users')
      .select('user_id, xp, level, total_messages, total_posts, total_reactions, last_activity_at')
      .eq('experience_id', experienceId)
      .order('xp', { ascending: false });

    // Apply time filters
    if (filter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('last_activity_at', weekAgo.toISOString());
    } else if (filter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('last_activity_at', monthAgo.toISOString());
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Add rank
    const rankedData = (data || []).map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    // Cache result
    await cacheLeaderboard(experienceId, filter, rankedData);

    return NextResponse.json({ 
      leaderboard: rankedData,
      cached: false 
    });

  } catch (error: unknown) {
    console.error('Error fetching leaderboard:', error);
    
    // Return more detailed error information
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch leaderboard',
          message: error.message,
          details: 'code' in error ? (error as any).code : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the leaderboard.' },
      { status: 500 }
    );
  }
}
