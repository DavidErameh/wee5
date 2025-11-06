
import { NextRequest, NextResponse } from 'next/server';
import { awardXP, ActivityType } from '@/lib/xp-logic';
import { handleLevelUp } from '@/lib/rewards';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const XPRequestSchema = z.object({
  userId: z.string().min(1),
  experienceId: z.string().min(1),
  activityType: z.enum(['message', 'post', 'reaction']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = XPRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, experienceId, activityType } = validation.data;

    // Apply rate limit
    const isRateLimited = await checkRateLimit(`xp_award:${userId}`, 5); // 5 requests per minute
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Award XP
    const result = await awardXP(userId, experienceId, activityType as ActivityType);

    if (!result.success) {
      if (result.error === 'User is on cooldown') {
        return NextResponse.json(
          { message: 'User is on cooldown', cooldownActive: true },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: result.error || 'Failed to award XP' },
        { status: 500 }
      );
    }

    // Handle level-up if it occurred
    let rewardResult;
    if (result.leveledUp && result.newLevel) {
      rewardResult = await handleLevelUp(userId, experienceId, result.newLevel);
    }

    return NextResponse.json({
      success: true,
      xpAwarded: result.xpAwarded,
      newTotalXp: result.newTotalXp,
      leveledUp: result.leveledUp,
      oldLevel: result.oldLevel,
      newLevel: result.newLevel,
      reward: rewardResult?.rewardGiven ? {
        type: rewardResult.rewardType,
        value: rewardResult.rewardValue,
      } : null,
    });

  } catch (error) {
    console.error('Error in XP endpoint:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error && 'code' in error && typeof error.code === 'string' && error.code.startsWith('PGRST')) {
        return NextResponse.json({ error: 'A database error occurred.' }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

// GET endpoint to check user's current XP
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const experienceId = searchParams.get('experienceId');

    if (!userId || !experienceId) {
      return NextResponse.json(
        { error: 'Missing userId or experienceId' },
        { status: 400 }
      );
    }

    const { supabase } = await import('@/lib/db');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .eq('experience_id', experienceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          xp: 0,
          level: 1,
          exists: false,
        });
      }
      throw error;
    }

    return NextResponse.json({
      xp: data.xp,
      level: data.level,
      totalMessages: data.total_messages,
      totalPosts: data.total_posts,
      totalReactions: data.total_reactions,
      exists: true,
    });

  } catch (error) {
    console.error('Error fetching user XP:', error);
    if (error instanceof Error && 'code' in error && typeof error.code === 'string' && error.code.startsWith('PGRST')) {
        return NextResponse.json({ error: 'A database error occurred while fetching user data.' }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching user data.' },
      { status: 500 }
    );
  }
}
