import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { command, userId, experienceId } = await req.json();
    
    if (!command || !userId || !experienceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process different slash commands
    switch (command) {
      case '/leaderboard':
        // Fetch and return leaderboard data
        const { data: leaderboard, error } = await supabaseAdmin
          .from('users')
          .select('user_id, xp, level')
          .eq('experience_id', experienceId)
          .order('xp', { ascending: false })
          .limit(10);

        if (error) throw error;

        // Add ranks
        const rankedData = leaderboard.map((user, index) => ({
          ...user,
          rank: index + 1,
        }));

        return NextResponse.json({
          command: 'leaderboard',
          data: rankedData,
          message: 'Top 10 players on the leaderboard:',
        });

      case '/mylevel':
        // Fetch user's current level and XP
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('user_id, xp, level')
          .eq('user_id', userId)
          .eq('experience_id', experienceId)
          .single();

        if (userError || !userData) {
          return NextResponse.json({
            command: 'mylevel',
            message: 'You haven\'t earned any XP yet! Start participating to level up.',
          });
        }

        return NextResponse.json({
          command: 'mylevel',
          data: userData,
          message: `You are currently Level ${userData.level} with ${userData.xp} XP!`,
        });

      default:
        return NextResponse.json({
          error: 'Unknown command. Available commands: /leaderboard, /mylevel',
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing slash command:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}