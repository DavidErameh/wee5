
import { NextRequest, NextResponse } from 'next/server';
import { awardXP, ActivityType } from '@/lib/xp-logic';
import { handleLevelUp } from '@/lib/rewards';
import { z } from 'zod';
import { requireAuth, verifyUserMembership } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

const awardXPSchema = z.object({
  activityType: z.enum(['message', 'post', 'reaction']),
  activityId: z.string().optional(), // Added for deduplication
  metadata: z.record(z.any()).optional()
});

export async function POST(req: NextRequest) {
  try {
    // STEP 1: Authentication (CRITICAL - must be first)
    const user = await requireAuth(req);

    // STEP 2: Input validation
    const body = await req.json();
    const validatedData = awardXPSchema.parse(body);

    // STEP 3: Rate limiting (now properly ordered - after auth but before processing)
    const rateLimitResult = await checkRateLimit(user.userId, user.tier);
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429, headers: { 'Retry-After': rateLimitResult.retryAfter.toString() } }
      );
    }

    // STEP 4: Verify user membership to experience
    // In a real implementation, experienceId would come from the auth token or be validated differently
    const hasMembership = await verifyUserMembership(user.userId, user.experienceId);
    if (!hasMembership) {
      return NextResponse.json(
        { error: 'User does not have access to this experience' },
        { status: 403 }
      );
    }

    // STEP 5: Award XP with authenticated context
    const result = await awardXP({
      userId: user.userId,
      experienceId: user.experienceId, // Use the authenticated user's experience
      activityType: validatedData.activityType,
      activityId: validatedData.activityId || `${user.userId}_${Date.now()}_${validatedData.activityType}` // Generate if not provided
    });

    if (!result.success) {
      if (result.reason === 'cooldown') {
        return NextResponse.json(
          { message: result.message || 'User is on cooldown', cooldownActive: true },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: result.message || 'Failed to award XP' },
        { status: 500 }
      );
    }

    // Handle level-up if it occurred
    if (result.leveledUp) {
      handleLevelUp(user.userId, user.experienceId, result.level - 1, result.level)
        .catch(error => {
          console.error('Error in level up processing:', error);
          Sentry.captureException(error, {
            tags: { component: 'level-up' },
            extra: { userId: user.userId, experienceId: user.experienceId, oldLevel: result.level - 1, newLevel: result.level }
          });
        });
    }

    return NextResponse.json({
      success: true,
      xpAwarded: result.xpAwarded,
      newTotalXp: result.xp,
      leveledUp: result.leveledUp,
      oldLevel: result.level - (result.leveledUp ? 1 : 0),
      newLevel: result.level,
    }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.flatten() },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error instanceof Error && 'code' in error && typeof error.code === 'string' && error.code.startsWith('PGRST')) {
      return NextResponse.json({ error: 'A database error occurred.' }, { status: 500 });
    }

    // Log error to Sentry with context
    Sentry.captureException(error, {
      tags: { endpoint: 'xp-award' },
      contexts: { request: { url: req.url } }
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check user's current XP (also secured)
export async function GET(req: NextRequest) {
  try {
    // Authenticate the user first
    const user = await requireAuth(req);

    const searchParams = new URL(req.url).searchParams;
    // Use authenticated user's experienceId, or allow override if authorized
    const requestedExperienceId = searchParams.get('experienceId') || user.experienceId;

    // Verify the user has access to the requested experience
    if (requestedExperienceId !== user.experienceId) {
      const hasAccess = await verifyUserMembership(user.userId, requestedExperienceId);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'User does not have access to this experience' },
          { status: 403 }
        );
      }
    }

    const { supabase } = await import('@/lib/db');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.userId)
      .eq('experience_id', requestedExperienceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found
        return NextResponse.json({
          xp: 0,
          level: 1,
          totalMessages: 0,
          totalPosts: 0,
          totalReactions: 0,
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
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

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
