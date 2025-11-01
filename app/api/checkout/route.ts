
import { NextRequest, NextResponse } from 'next/server';
import { whopsdk } from '@/lib/whop-sdk';

export async function POST(req: NextRequest) {
  try {
    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
    }

    const checkoutConfig = await whopsdk.checkoutConfigurations.create({
      plan_id: planId,
      metadata: { tier: 'premium' }, // Or dynamically set based on planId
    });

    return NextResponse.json({ checkoutConfig });

  } catch (error) {
    console.error('Error creating checkout config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
