import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const experienceId = searchParams.get('experienceId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!experienceId) {
      return NextResponse.json(
        { error: 'experienceId is required' },
        { status: 400 }
      );
    }

    // Build query based on date range
    let query = supabaseAdmin
      .from('engagement_analytics')
      .select('*')
      .eq('experience_id', experienceId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate summary statistics
    const summary = data.reduce((acc, record) => {
      acc.totalXpEarned += record.total_xp_earned || 0;
      acc.totalActiveUsers += record.total_users_active || 0;
      acc.totalMessages += record.messages_sent || 0;
      acc.totalPosts += record.posts_created || 0;
      acc.totalReactions += record.reactions_given || 0;
      acc.totalLevelsAchieved += record.new_levels_achieved || 0;
      return acc;
    }, {
      totalXpEarned: 0,
      totalActiveUsers: 0,
      totalMessages: 0,
      totalPosts: 0,
      totalReactions: 0,
      totalLevelsAchieved: 0,
    });

    return NextResponse.json({ 
      analytics: data,
      summary,
      dateRange: { startDate, endDate }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to manually update analytics (for testing/triggering)
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { experienceId, date, data } = await req.json();

    if (!experienceId || !date || !data) {
      return NextResponse.json(
        { error: 'experienceId, date, and data are required' },
        { status: 400 }
      );
    }

    // Check if record already exists for this date
    const { data: existingRecord } = await supabaseAdmin
      .from('engagement_analytics')
      .select('id')
      .eq('experience_id', experienceId)
      .eq('date', date)
      .single();

    let result;
    if (existingRecord) {
      // Update existing record
      result = await supabaseAdmin
        .from('engagement_analytics')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('experience_id', experienceId)
        .eq('date', date);
    } else {
      // Create new record
      result = await supabaseAdmin
        .from('engagement_analytics')
        .insert({
          experience_id: experienceId,
          date,
          ...data,
          created_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Analytics data updated successfully'
    });

  } catch (error) {
    console.error('Error updating analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}