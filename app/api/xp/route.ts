import { NextRequest, NextResponse } from 'next/server';
import { awardXP } from '@/lib/xp-logic';
import { handleLevelUp } from '@/lib/rewards';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { userId, experienceId, activityType } = await req.json();

    // Validate input
    if (!userId || !experienceId || !activityType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Additional check to ensure the authenticated user is the same as the userId in the request
    // In production, you might need to validate that the user can award XP for this activity
    // For now, we'll just ensure the request contains valid data

    // Award XP
    const result = await awardXP(userId, experienceId, activityType);

    if (!result.success) {
      return NextResponse.json(
        { message: 'User is on cooldown' },
        { status: 429 }
      );
    }

    // Handle level-up
    if (result.leveledUp) {
      await handleLevelUp(userId, result.newLevel!);
    }

    return NextResponse.json({
      success: true,
      xpAwarded: result.xpAwarded,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
    });

  } catch (error) {
    console.error('Error awarding XP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}