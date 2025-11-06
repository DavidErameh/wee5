import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { hasPremiumAccess } from '@/lib/rewards';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

const XpConfigSchema = z.object({
  xp_per_message: z.number().min(0).max(1000).optional(),
  min_xp_per_post: z.number().min(0).max(1000).optional(),
  max_xp_per_post: z.number().min(0).max(1000).optional(),
  xp_per_reaction: z.number().min(0).max(1000).optional(),
});

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
    const isRateLimited = await checkRateLimit(`xp_config_get:${authResult.userId}`, 10);
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const experienceId = searchParams.get('experienceId');
    
    if (!experienceId) {
      return NextResponse.json(
        { error: 'experienceId is required' },
        { status: 400 }
      );
    }
    
    // Check if user has premium access
    const hasAccess = await hasPremiumAccess(authResult.userId, experienceId!); // Assert not null after check
    
    // If not premium, return default values
    if (!hasAccess) {
      return NextResponse.json({ 
        config: {
          xp_per_message: 20,
          min_xp_per_post: 15,
          max_xp_per_post: 25,
          xp_per_reaction: 5,
        },
        isPremium: false
      });
    }

    // For premium users, fetch custom configuration
    const { supabase } = await import('@/lib/db');
    const { data, error } = await supabase
      .from('xp_configurations')
      .select('*')
      .eq('experience_id', experienceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No config found
        return NextResponse.json({ 
          config: {
            xp_per_message: 20,
            min_xp_per_post: 15,
            max_xp_per_post: 25,
            xp_per_reaction: 5,
          },
          isPremium: true
        });
      }
      Sentry.captureException(error);
      throw error;
    }

    return NextResponse.json({ 
      config: {
        xp_per_message: data.xp_per_message || 20,
        min_xp_per_post: data.min_xp_per_post || 15,
        max_xp_per_post: data.max_xp_per_post || 25,
        xp_per_reaction: data.xp_per_reaction || 5,
      },
      isPremium: true
    });

  } catch (error) {
    console.error('Error fetching XP configuration:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the XP configuration.' },
      { status: 500 }
    );
  }
}

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
    const isRateLimited = await checkRateLimit(`xp_config_post:${authResult.userId}`, 5);
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    // Extract the config object from the body (experienceId comes from auth)
    const configValidation = XpConfigSchema.safeParse(body.config); // assuming the config is nested

    if (!configValidation.success) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: configValidation.error.flatten() },
        { status: 400 }
      );
    }

    const config = configValidation.data;
    // experienceId comes from the URL/search parameters or was extracted earlier
    // In POST method, we may need to pass experienceId in the body or extract from auth context
    const bodyExperienceId = body.experienceId;

    if (!bodyExperienceId) {
      return NextResponse.json(
        { error: 'experienceId is required in request body' },
        { status: 400 }
      );
    }

    // Check if user has premium access
    const hasAccess = await hasPremiumAccess(authResult.userId, bodyExperienceId!); // Assert not null after check
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Premium tier required to customize XP rates' },
        { status: 403 }
      );
    }

    // Validate config values
    if (config.min_xp_per_post !== undefined && 
        config.max_xp_per_post !== undefined && 
        config.min_xp_per_post > config.max_xp_per_post) {
      return NextResponse.json(
        { error: 'Minimum post XP cannot exceed maximum post XP' },
        { status: 400 }
      );
    }

    // Update or create configuration
    const { supabaseAdmin } = await import('@/lib/db');
    
    const { error } = await supabaseAdmin
      .from('xp_configurations')
      .upsert({
        experience_id: bodyExperienceId,
        xp_per_message: config.xp_per_message,
        min_xp_per_post: config.min_xp_per_post,
        max_xp_per_post: config.max_xp_per_post,
        xp_per_reaction: config.xp_per_reaction,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'experience_id' });

    if (error) {
      Sentry.captureException(error);
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'XP configuration updated successfully' 
    });

  } catch (error) {
    console.error('Error updating XP configuration:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the XP configuration.' },
      { status: 500 }
    );
  }
}