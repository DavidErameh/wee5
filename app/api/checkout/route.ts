import { NextRequest, NextResponse } from 'next/server';
import { whopSdk } from '@/lib/whop-sdk';
import * as Sentry from '@sentry/nextjs';

export async function POST(req: NextRequest) {
  try {
    const { userId, planId, metadata } = await req.json();

    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'Missing userId or planId' },
        { status: 400 }
      );
    }

    // Create a checkout configuration using Whop SDK
    const checkoutConfig = await whopSdk.checkoutConfigurations.create({
      plan_id: planId,
      success_url: `${req.nextUrl.origin}/success`,
      cancel_url: `${req.nextUrl.origin}/cancel`,
      metadata: {
        ...metadata,
        user_id: userId,
        app: 'wee5'
      }
    });

    return NextResponse.json({
      success: true,
      configId: checkoutConfig.id,
      checkoutUrl: `${req.nextUrl.origin}/checkout/${checkoutConfig.id}`
    });

  } catch (error) {
    console.error('Payment configuration error:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to create payment configuration' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve available plans
export async function GET(req: NextRequest) {
  try {
    // In a real implementation, we would fetch plans from Whop
    // For now, we'll return our standard tier structure
    const plans = [
      {
        id: 'plan_free_welcome',
        name: 'Free Tier',
        description: 'Basic XP tracking, leveling, and leaderboard access',
        price: 0,
        features: [
          'Message XP: 20 points',
          'Post XP: 15-25 points',
          'Reaction XP: 5 points',
          'Public leaderboard',
          'Basic rank card',
          'Standard rewards'
        ],
        tier: 'free'
      },
      {
        id: 'plan_premium_monthly',
        name: 'Premium Tier',
        description: 'Custom XP rates, analytics, and advanced features',
        price: 19,
        interval: 'month',
        features: [
          'All free features',
          'Custom XP rates',
          'Engagement analytics',
          'Advanced anti-cheat',
          'Custom badges',
          'Priority support'
        ],
        tier: 'premium'
      },
      {
        id: 'plan_enterprise_monthly',
        name: 'Enterprise Tier',
        description: 'Multi-community support and custom integrations',
        price: 79,
        interval: 'month',
        features: [
          'All premium features',
          'Multi-community support',
          'Custom integrations',
          'Dedicated support',
          'API access',
          'Custom branding'
        ],
        tier: 'enterprise'
      }
    ];

    return NextResponse.json({ plans });

  } catch (error) {
    console.error('Plans retrieval error:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to retrieve plans' },
      { status: 500 }
    );
  }
}