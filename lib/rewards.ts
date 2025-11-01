
import { whopsdk } from './whop-sdk';
import { supabaseAdmin } from './db';

// Reward tiers
const REWARD_TIERS = {
  5: { type: 'free_days', value: 3 },
  10: { type: 'free_days', value: 7 },
  25: { type: 'free_days', value: 14 },
  50: { type: 'free_days', value: 30 },
  100: { type: 'discount', value: '50%' },
};

export async function handleLevelUp(userId: string, newLevel: number) {
  // Check if this level has a reward
  const reward = REWARD_TIERS[newLevel];
  if (!reward) return;

  // Check if reward already claimed
  const { data: existingReward } = await supabaseAdmin
    .from('rewards')
    .select('*')
    .eq('user_id', userId)
    .eq('level_achieved', newLevel)
    .single();

  if (existingReward) {
    console.log('Reward already claimed for this level');
    return;
  }

  try {
    // Get user's membership
    const memberships = await whopsdk.memberships.list({
      user_id: userId,
      valid: true,
    });

    const membership = memberships.data[0];
    if (!membership) {
      console.error('No valid membership found for user');
      return;
    }

    // Apply reward
    if (reward.type === 'free_days') {
      await whopsdk.memberships.addFreeDays(membership.id, {
        days: reward.value,
      });
    } else if (reward.type === 'discount') {
      // For level 100, we want a permanent 50% discount
      // Whop doesn't directly support permanent discounts on plans
      // So we'll create a long-lasting promo code with multiple uses or document the discount
      // For now, creating a promocode as a workaround
      const promoCode = await whopsdk.promoCodes.create({
        code: `LEVEL100_${userId.slice(-6)}`,
        discount_type: 'percentage',
        discount_value: 50,
        max_uses: 10, // Allow multiple uses for renewal discount
        user_id: userId,
        metadata: {
          description: `50% discount for reaching level 100 in WEE5`,
          level_reward: 100
        }
      });
      
      // Also send a notification about the permanent discount
      await whopsdk.notifications.sendPushNotification({
        user_id: userId,
        title: `🎉 Level 100 Achieved!`,
        message: `You've unlocked a permanent 50% discount! Use promo code ${promoCode.code} for your next renewal.`,
      });
    }

    // Log reward
    await supabaseAdmin.from('rewards').insert({
      user_id: userId,
      level_achieved: newLevel,
      reward_type: reward.type,
      reward_value: reward.value.toString(),
      whop_membership_id: membership.id,
    });

    // Send notification
    await whopsdk.notifications.sendPushNotification({
      user_id: userId,
      title: `🎉 Level ${newLevel} Reached!`,
      message: reward.type === 'free_days'
        ? `You've earned ${reward.value} free days!`
        : `You've earned a permanent 50% discount!`,
    });

  } catch (error) {
    console.error('Error handling reward:', error);
  }
}
