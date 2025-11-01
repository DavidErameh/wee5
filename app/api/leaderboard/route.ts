
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // Verify authentication
  const authResult = await requireAuth(req);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const experienceId = searchParams.get('experienceId');
  const filter = searchParams.get('filter') || 'all-time'; // 'all-time', 'week', 'month'
  const limit = parseInt(searchParams.get('limit') || '100');

  if (!experienceId) {
    return NextResponse.json(
      { error: 'experienceId is required' },
      { status: 400 }
    );
  }

  try {
    // Additional validation to ensure user has access to this experience
    // In a real implementation, you would check if the experience belongs to the user's company
    // For now, we'll just ensure the experience ID is provided

    let query = supabaseAdmin
      .from('users')
      .select('user_id, xp, level, total_messages, total_posts, total_reactions')
      .eq('experience_id', experienceId)
      .order('xp', { ascending: false })
      .limit(limit);

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

    const { data, error } = await query;

    if (error) throw error;

    // Add rank
    const rankedData = data.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    return NextResponse.json({ leaderboard: rankedData });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
