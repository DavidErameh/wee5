
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import * as crypto from 'crypto';
import * as Sentry from '@sentry/nextjs';
import { processActivityEvent } from '@/lib/event-processor';

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature for security
    const signature = req.headers.get('x-whop-signature');
    const timestamp = req.headers.get('x-whop-timestamp');
    const body = await req.text();

    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: 'Missing webhook signature or timestamp' },
        { status: 400 }
      );
    }

    // Verify the signature
    const expectedSignature = createSignature(body, timestamp, process.env.WHOP_WEBHOOK_SECRET!);
    const signatureMatch = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!signatureMatch) {
      console.error('Webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // Check if timestamp is within 5 minutes to prevent replay attacks
    const timestampSeconds = parseInt(timestamp, 10);
    const now = Date.now() / 1000;
    if (Math.abs(now - timestampSeconds) > 300) { // 5 minutes
      return NextResponse.json(
        { error: 'Webhook timestamp too old' },
        { status: 400 }
      );
    }

    // Apply rate limit based on IP address
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const isRateLimited = await checkRateLimit(`webhook_ip:${ip}`, 10); // 10 requests per minute per IP
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse the event after verification
    const event = JSON.parse(body);

    console.log('Received verified webhook:', event.action);

    // Handle different webhook events based on standard Whop events
    switch (event.action) {
      case 'message.created':
        // Process message event for XP
        await processActivityEvent({
          type: 'message',
          userId: event.data.user_id,
          experienceId: event.data.experience_id || event.data.product_id,
          content: event.data.content,
          timestamp: event.data.created_at || new Date().toISOString(),
        });
        break;

      case 'post.created':
        // Process post event for XP
        await processActivityEvent({
          type: 'post',
          userId: event.data.user_id,
          experienceId: event.data.experience_id || event.data.product_id,
          content: event.data.content || event.data.title,
          timestamp: event.data.created_at || new Date().toISOString(),
        });
        break;

      case 'reaction.created':
        // Process reaction event for XP
        await processActivityEvent({
          type: 'reaction',
          userId: event.data.user_id,
          experienceId: event.data.experience_id || event.data.product_id,
          timestamp: event.data.created_at || new Date().toISOString(),
        });
        break;

      case 'membership.created':
      case 'membership.updated':
        // Handle join/activation: Check status
        if (event.data.status === 'active' || event.data.status === 'trialing') {
          // Initialize user if new
          await supabaseAdmin.from('users').upsert({
            user_id: event.data.user_id,
            experience_id: event.data.plan_id || event.data.experience_id,
            xp: 0,
            level: 1, // Fixed: level starts at 1 (database constraint)
          }, { onConflict: 'user_id, experience_id' });
        } else if (event.data.status === 'canceled' || event.data.status === 'expired') {
          // Handle invalid/cancel: Optional cleanup
          console.log('Membership became invalid:', event.data.user_id);
        }
        break;

      case 'membership.canceled':
        // Handle cancel
        console.log('Membership canceled:', event.data.user_id);
        break;

      case 'payment.succeeded':
        // Handle payment (e.g., premium tier unlock)
        console.log('Payment succeeded:', event.data);
        // Update user tier status if needed
        if (event.data.user_id && event.data.plan_id) {
          // Determine if this is a premium subscription
          let tier = 'free';
          if (event.data.plan_id.includes('premium') || event.data.plan_id.includes('pro')) {
            tier = 'premium';
          } else if (event.data.plan_id.includes('enterprise') || event.data.plan_id.includes('business')) {
            tier = 'enterprise';
          }
          
          await supabaseAdmin
            .from('users')
            .upsert({
              user_id: event.data.user_id,
              experience_id: event.data.plan_id,
              tier: tier,
            }, { onConflict: 'user_id' });
        }
        break;

      default:
        console.log('Unhandled webhook event:', event.action);
    }

    return NextResponse.json({ success: true, received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    Sentry.captureException(error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && 'code' in error && typeof error.code === 'string' && error.code.startsWith('PGRST')) {
        return NextResponse.json({ error: 'A database error occurred while processing the webhook.' }, { status: 500 });
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the webhook.' },
      { status: 500 }
    );
  }
}

// Helper function to create webhook signature
function createSignature(payload: string, timestamp: string, secret: string): string {
  const message = timestamp + '.' + payload;
  return 'v1=' + crypto.createHmac('sha256', secret).update(message).digest('hex');
}
