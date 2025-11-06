
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // This endpoint should be protected by a secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // 1. Get all experiences
    const { data: experiences, error: experiencesError } = await supabaseAdmin
      .from('users')
      .select('experience_id')
      .distinct();

    if (experiencesError) {
      throw experiencesError;
    }

    for (const experience of experiences) {
      const experienceId = experience.experience_id;

      // 2. Get all activities for the experience for yesterday
      const { data: activities, error: activitiesError } = await supabaseAdmin
        .from('activity_log')
        .select('*')
        .eq('experience_id', experienceId)
        .gte('timestamp', `${yesterdayStr}T00:00:00.000Z`)
        .lte('timestamp', `${yesterdayStr}T23:59:59.999Z`);

      if (activitiesError) {
        console.error(`Error fetching activities for experience ${experienceId}:`, activitiesError);
        continue;
      }

      if (!activities || activities.length === 0) {
        continue;
      }

      // 3. Aggregate the data
      const totalXpEarned = activities.reduce((acc, activity) => acc + activity.xp_awarded, 0);
      const totalActiveUsers = new Set(activities.map(a => a.user_id)).size;
      const messagesSent = activities.filter(a => a.activity_type === 'message').length;
      const postsCreated = activities.filter(a => a.activity_type === 'post').length;
      const reactionsGiven = activities.filter(a => a.activity_type === 'reaction').length;

      // 4. Insert the aggregated data
      const { error: insertError } = await supabaseAdmin
        .from('engagement_analytics')
        .insert({
          experience_id: experienceId,
          date: yesterdayStr,
          total_xp_earned: totalXpEarned,
          total_users_active: totalActiveUsers,
          messages_sent: messagesSent,
          posts_created: postsCreated,
          reactions_given: reactionsGiven,
          new_levels_achieved: 0, // This needs to be calculated differently
        });

      if (insertError) {
        console.error(`Error inserting analytics for experience ${experienceId}:`, insertError);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in analytics cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
