import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { whopsdk } from '@/lib/whop-sdk';

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature (this is a simplified approach)
    // In production, you should verify the webhook signature using the WHOP_WEBHOOK_SECRET
    const event = await req.json();

    // The event structure might be different from what's assumed above
    // We need to extract the actual event data properly
    console.log('Webhook received:', event);

    // Handle different webhook events
    if (event.type) {
      switch (event.type) {
        case 'membership.activated':
        case 'membership.went_valid':
          // User joined - initialize their profile if not exists
          const membershipData = event.data || event;
          const userId = membershipData.user_id;
          const productId = membershipData.product_id || membershipData.id;
          
          if (userId && productId) {
            // Check if user already exists
            const { data: existingUser } = await supabaseAdmin
              .from('users')
              .select('id')
              .eq('user_id', userId)
              .eq('experience_id', productId)
              .single();

            if (!existingUser) {
              // Initialize user profile
              await supabaseAdmin.from('users').insert({
                user_id: userId,
                experience_id: productId,
                xp: 0,
                level: 1,
                total_messages: 0,
                total_posts: 0,
                total_reactions: 0,
              });
            }
          }
          break;

        case 'membership.expired':
        case 'membership.went_invalid':
        case 'membership.cancelled':
          // User membership ended - optionally handle cleanup or change tier
          const expiredMembershipData = event.data || event;
          const expiredUserId = expiredMembershipData.user_id;
          
          if (expiredUserId) {
            // For now, we'll just log this event. In a real system you might want to:
            // - Change user tier to 'free' if they had premium
            // - Remove premium features access
            console.log('Membership ended for user:', expiredUserId);
          }
          break;

        case 'payment.succeeded':
          // Handle premium tier purchase - this would come from our own payment processing
          const paymentData = event.data || event;
          const paymentUserId = paymentData.user_id;
          const planMetadata = paymentData.plan_metadata || {};
          
          if (paymentUserId) {
            // Determine tier based on plan
            let newTier = 'premium';
            if (planMetadata.tier) {
              newTier = planMetadata.tier;
            } else if (paymentData.amount >= 10000) { // Example: $99+ is enterprise
              newTier = 'enterprise';
            } else if (paymentData.amount >= 2900) { // Example: $29+ is premium
              newTier = 'premium';
            }
            
            // Update user tier
            await supabaseAdmin
              .from('users')
              .update({ tier: newTier })
              .eq('user_id', paymentUserId);
              
            console.log(`User ${paymentUserId} upgraded to ${newTier} tier`);
          }
          break;
          
        default:
          console.log('Unhandled webhook event:', event.type);
          break;
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}