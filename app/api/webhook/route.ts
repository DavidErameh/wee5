import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { isRateLimited } from '@/lib/rate-limit';
import { validateWebhook } from '@/lib/webhook-validation';
import { verifyWhopSignature } from '@/lib/webhook-security';
import * as Sentry from '@sentry/nextjs';
import { processActivityEvent } from '@/lib/event-processor';
import { Redis } from '@upstash/redis';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Get raw body (CRITICAL: Do not parse before verification)
    const rawBody = await req.text();

    // 2. Get signature headers
    const signature = req.headers.get('x-whop-signature');
    const timestamp = req.headers.get('x-whop-timestamp');

    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: 'Missing signature headers' },
        { status: 400 }
      );
    }

    // 3. Verify webhook signature
    const isValid = verifyWhopSignature(rawBody, signature, timestamp);
    if (!isValid) {
      Sentry.captureMessage('Invalid webhook signature', {
        level: 'warning',
        extra: { timestamp, bodyLength: rawBody.length },
      });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 4. Apply rate limit based on IP address
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const isRateLimitedResult = await isRateLimited(`webhook_ip:${ip}`, 10); // 10 requests per minute per IP
    if (isRateLimitedResult) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.'
        },
        {
          status: 429
        }
      );
    }

    // 5. Parse and validate webhook data
    const event = JSON.parse(rawBody);
    const validation = validateWebhook(event);

    if (!validation.success) {
      console.error('Webhook validation failed:', validation.error);
      Sentry.captureException(new Error('Webhook validation failed'), {
        extra: {
          validationErrors: validation.error,
          event,
        },
      });
      return NextResponse.json(
        { error: 'Invalid webhook data format' },
        { status: 400 }
      );
    }

    // 5.5. Check for duplicate events using event ID (DEDUPLICATION FOR RELIABILITY)
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!
    });

    // Use the ID from webhook event if available, otherwise create one from timestamp and action
    const eventId = event.id || `${event.action}_${event.data?.id || timestamp}_${Date.now()}`;
    const eventKey = `webhook_event:${eventId}`;

    // Check if this event has already been processed
    const hasBeenProcessed = await redis.get(eventKey);
    if (hasBeenProcessed) {
      console.log(`[Webhook] Duplicate event detected and skipped: ${eventId}`);
      return NextResponse.json({ success: true, duplicate: true }, { status: 200 });
    }

    // Mark event as processed with 24-hour expiration (in case of system failure)
    await redis.set(eventKey, '1', { ex: 86400 }); // 24 hours

    // 6. Process validated event
    const validatedEvent = validation.data;
    console.log('Received validated webhook:', validatedEvent.action);

    // Handle different webhook events based on standard Whop events
    switch (validatedEvent.action) {
      case 'message.created':
        // Process message event for XP
        await processActivityEvent({
          type: 'message',
          userId: validatedEvent.data.user_id,
          experienceId: validatedEvent.data.experience_id || validatedEvent.data.product_id,
          companyId: validatedEvent.data.company_id || validatedEvent.data.user_id.split('_')[1] || 'default', // Extract from userId if not provided
          content: validatedEvent.data.content,
          timestamp: validatedEvent.data.created_at ? validatedEvent.data.created_at * 1000 : Date.now(),
        });
        break;

      case 'post.created':
        // Process post event for XP
        await processActivityEvent({
          type: 'post',
          userId: validatedEvent.data.user_id,
          experienceId: validatedEvent.data.experience_id || validatedEvent.data.product_id,
          companyId: validatedEvent.data.company_id || validatedEvent.data.user_id.split('_')[1] || 'default', // Extract from userId if not provided
          content: validatedEvent.data.content || validatedEvent.data.title,
          timestamp: validatedEvent.data.created_at ? validatedEvent.data.created_at * 1000 : Date.now(),
        });
        break;

      case 'reaction.created':
        // Process reaction event for XP
        await processActivityEvent({
          type: 'reaction',
          userId: validatedEvent.data.user_id,
          experienceId: validatedEvent.data.experience_id || validatedEvent.data.product_id,
          companyId: validatedEvent.data.company_id || validatedEvent.data.user_id.split('_')[1] || 'default', // Extract from userId if not provided
          timestamp: validatedEvent.data.created_at ? validatedEvent.data.created_at * 1000 : Date.now(),
        });
        break;

      case 'membership.went_valid':
      case 'membership.went_invalid':
        // Handle membership status changes
        if (validatedEvent.data.status === 'valid' || validatedEvent.data.status === 'active' || validatedEvent.data.status === 'trialing') {
          // Initialize user if new
          await supabaseAdmin.from('users').upsert({
            user_id: validatedEvent.data.user_id,
            experience_id: validatedEvent.data.product_id || validatedEvent.data.id,
            xp: 0,
            level: 1, // Fixed: level starts at 1 (database constraint)
          }, { onConflict: 'user_id, experience_id' });
        } else if (validatedEvent.data.status === 'invalid' || validatedEvent.data.status === 'canceled' || validatedEvent.data.status === 'expired') {
          // Handle invalid/cancel: Optional cleanup
          console.log('Membership became invalid:', validatedEvent.data.user_id);
        }
        break;

      case 'payment.succeeded':
        // Handle payment (e.g., premium tier unlock)
        console.log('Payment succeeded:', validatedEvent.data);
        // Update user tier status if needed
        if (validatedEvent.data.user_id && validatedEvent.data.membership_id) {
          // Determine if this is a premium subscription
          let tier = 'free';
          const membershipId = validatedEvent.data.membership_id;
          
          // Get membership details to determine plan
          // For now, we'll use basic pattern matching on IDs
          if (membershipId.includes('premium') || membershipId.includes('pro')) {
            tier = 'premium';
          } else if (membershipId.includes('enterprise') || membershipId.includes('business')) {
            tier = 'enterprise';
          }

          await supabaseAdmin
            .from('users')
            .upsert({
              user_id: validatedEvent.data.user_id,
              experience_id: membershipId,
              tier: tier,
            }, { onConflict: 'user_id' });
        }
        break;

      case 'payment.failed':
        // Handle payment failure
        console.log('Payment failed:', validatedEvent.data);
        break;

      default:
        console.log('Unhandled webhook event:', validatedEvent.action);
    }

    // 7. Log success metrics
    const duration = Date.now() - startTime;
    console.log(`Webhook processed: ${validatedEvent.action} in ${duration}ms`);

    // MUST respond quickly (< 3 seconds)
    return NextResponse.json({ success: true, received: true }, { status: 200 });

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('Webhook error:', error);
    Sentry.captureException(error, {
      tags: { duration_ms: duration },
    });

    // Return 200 to prevent Whop retries on our errors
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}

