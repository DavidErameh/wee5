// app/api/leaderboard/route.ts - Optimized leaderboard endpoint
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/db';

const leaderboardQuerySchema = z.object({
  experienceId: z.string(),
  filter: z.enum(['all-time', 'week', 'month']).default('all-time'), // Match component's filter names
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(10).max(100).default(20),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional() // For backward compatibility with existing component
});

export async function GET(request: NextRequest) {
  try {
    // We'll need to implement a public endpoint, so we won't require authentication
    // for reading the leaderboard, but we'll validate the experience ID exists
    const { searchParams } = new URL(request.url);
    
    const params = leaderboardQuerySchema.parse({
      experienceId: searchParams.get('experienceId'),
      filter: searchParams.get('filter'),
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize') || searchParams.get('limit'), // Support both param names
      search: searchParams.get('search')
    });

    // Calculate offset for pagination
    const offset = (params.page - 1) * params.pageSize;

    // Build optimized query with pagination
    let query = supabaseAdmin
      .from('users')
      .select('user_id, name, xp, level, total_messages, total_posts, total_reactions, last_activity_at',
              { count: 'exact' })
      .eq('experience_id', params.experienceId)
      .is('deleted_at', null) // assuming there's a soft delete
      .not('xp', 'is', null); // exclude users with null xp

    // Apply filter if not all-time
    if (params.filter !== 'all-time') {
      const dateFilter = getDateFilterForTimeframe(params.filter);
      if (dateFilter) {
        query = query.gte('last_activity_at', dateFilter);
      }
    }
    
    // Apply search filter if provided
    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    
    // Apply sorting and pagination
    query = query
      .order('xp', { ascending: false })
      .range(offset, offset + params.pageSize - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Leaderboard query error:', error);
      throw error;
    }
    
    // Add rank numbers based on offset and current page
    const usersWithRank = data.map((user, index) => ({
      ...user,
      rank: offset + index + 1
    }));
    
    // Return paginated results
    return NextResponse.json({
      users: usersWithRank,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / params.pageSize)
      }
    });
    
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.flatten() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

function getDateFilterForTimeframe(filter: string): string | null {
  const now = new Date();

  switch (filter) {
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return weekAgo.toISOString();

    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return monthAgo.toISOString();

    case 'all-time':
    default:
      return null;
  }
}