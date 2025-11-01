import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updateXpConfiguration, getXpConfiguration } from '@/lib/xpConfig';

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

    if (!experienceId) {
      return NextResponse.json(
        { error: 'experienceId is required' },
        { status: 400 }
      );
    }

    const config = await getXpConfiguration(experienceId);
    
    return NextResponse.json({ config });

  } catch (error) {
    console.error('Error fetching XP configuration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const { experienceId, xpConfig } = await req.json();

    if (!experienceId || !xpConfig) {
      return NextResponse.json(
        { error: 'experienceId and xpConfig are required' },
        { status: 400 }
      );
    }

    // Validate XP config values
    if (
      (xpConfig.xp_per_message !== undefined && (xpConfig.xp_per_message < 0 || xpConfig.xp_per_message > 1000)) ||
      (xpConfig.min_xp_per_post !== undefined && (xpConfig.min_xp_per_post < 0 || xpConfig.min_xp_per_post > 1000)) ||
      (xpConfig.max_xp_per_post !== undefined && (xpConfig.max_xp_per_post < 0 || xpConfig.max_xp_per_post > 1000)) ||
      (xpConfig.xp_per_reaction !== undefined && (xpConfig.xp_per_reaction < 0 || xpConfig.xp_per_reaction > 1000))
    ) {
      return NextResponse.json(
        { error: 'XP values must be between 0 and 1000' },
        { status: 400 }
      );
    }

    // Ensure min post XP doesn't exceed max post XP
    if (xpConfig.min_xp_per_post !== undefined && 
        xpConfig.max_xp_per_post !== undefined && 
        xpConfig.min_xp_per_post > xpConfig.max_xp_per_post) {
      return NextResponse.json(
        { error: 'Minimum post XP cannot exceed maximum post XP' },
        { status: 400 }
      );
    }

    await updateXpConfiguration(experienceId, xpConfig);
    
    return NextResponse.json({ 
      success: true, 
      message: 'XP configuration updated successfully' 
    });

  } catch (error) {
    console.error('Error updating XP configuration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}