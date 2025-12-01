import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { handleLevelUp } from '@/lib/rewards';

// Mock all dependencies
jest.mock('@/lib/db', () => ({
  supabaseAdmin: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
      upsert: jest.fn().mockResolvedValue({ error: null }),
    })),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }), // Mock rpc as well
  })),
}));

jest.mock('@/lib/whop-sdk', () => ({
  addFreeDaysToMembership: jest.fn().mockResolvedValue({}),
  createPromoCode: jest.fn().mockResolvedValue({ code: 'TEST10OFF' }),
  sendPushNotification: jest.fn().mockResolvedValue({}),
  listUserMemberships: jest.fn().mockResolvedValue({ data: [] }),
}));

describe('Rewards Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should deliver free days reward at level 5', async () => {
    const { supabaseAdmin } = await import('@/lib/db');
    // Mock that this is the first time reaching level 5 (no previous reward)
    const mockFromCall = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }), // No previous reward
    };
    (supabaseAdmin as jest.Mock).mockReturnValue({
      from: jest.fn(() => mockFromCall),
    });

    // Mock user membership
    const { listUserMemberships } = await import('@/lib/whop-sdk');
    (listUserMemberships as jest.Mock).mockResolvedValue({
      data: [
        { id: 'membership_123', experience_id: 'exp_456', status: 'active' }
      ]
    });

    const { addFreeDaysToMembership } = await import('@/lib/whop-sdk');
    (addFreeDaysToMembership as jest.Mock).mockResolvedValue({});

    const result = await handleLevelUp('user_123', 'exp_456', 4, 5);

    expect(result.success).toBe(true);
    expect(result.rewardGiven).toBe(true);
    expect(result.rewardType).toBe('free_days');
    expect(result.rewardValue).toBe('3');
    expect(addFreeDaysToMembership).toHaveBeenCalledWith('membership_123', 3);
  });

  it('should deliver free days reward at level 10', async () => {
    const { supabaseAdmin } = await import('@/lib/db');
    // Mock that this is the first time reaching level 10
    const mockFromCall = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }), // No previous reward
    };
    (supabaseAdmin as jest.Mock).mockReturnValue({
      from: jest.fn(() => mockFromCall),
    });

    // Mock user membership
    const { listUserMemberships } = await import('@/lib/whop-sdk');
    (listUserMemberships as jest.Mock).mockResolvedValue({
      data: [
        { id: 'membership_456', experience_id: 'exp_456', status: 'active' }
      ]
    });

    const { addFreeDaysToMembership } = await import('@/lib/whop-sdk');
    (addFreeDaysToMembership as jest.Mock).mockResolvedValue({});

    const result = await handleLevelUp('user_456', 'exp_456', 9, 10);

    expect(result.success).toBe(true);
    expect(result.rewardGiven).toBe(true);
    expect(result.rewardType).toBe('free_days');
    expect(result.rewardValue).toBe('7');
    expect(addFreeDaysToMembership).toHaveBeenCalledWith('membership_456', 7);
  });

  it('should deliver discount reward at level 100', async () => {
    const { supabaseAdmin } = await import('@/lib/db');
    // Mock that this is the first time reaching level 100
    const mockFromCall = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }), // No previous reward
    };
    (supabaseAdmin as jest.Mock).mockReturnValue({
      from: jest.fn(() => mockFromCall),
    });

    // Mock user membership
    const { listUserMemberships } = await import('@/lib/whop-sdk');
    (listUserMemberships as jest.Mock).mockResolvedValue({
      data: [
        { id: 'membership_789', experience_id: 'exp_456', status: 'active' }
      ]
    });

    const { createPromoCode } = await import('@/lib/whop-sdk');
    (createPromoCode as jest.Mock).mockResolvedValue({ code: 'LEVEL100_789USER' });

    const result = await handleLevelUp('user_789', 'exp_456', 99, 100);

    expect(result.success).toBe(true);
    expect(result.rewardGiven).toBe(true);
    expect(result.rewardType).toBe('discount');
    expect(result.rewardValue).toBe('50');
    expect(createPromoCode).toHaveBeenCalledWith({
      code: 'LEVEL100_789USER',
      discountPercent: 50,
      maxUses: 1,
      expiresAt: expect.any(Date),
    });
  });

  it('should handle custom rewards configuration', async () => {
    const { supabaseAdmin } = await import('@/lib/db');
    // Mock custom reward configuration for level 25
    const mockFromCall = jest.fn();
    (supabaseAdmin as jest.Mock).mockReturnValue({
      from: mockFromCall,
    });

    // First call: check for existing reward history
    mockFromCall.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }), // No previous reward
    }));
    // Second call: get custom reward config
    mockFromCall.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ 
        data: { 
          reward_type: 'free_days', 
          reward_value: '14' // Custom: 14 days instead of default 3 for level 25
        }, 
        error: null 
      }),
    }));
    // Third call: record reward history
    mockFromCall.mockImplementationOnce(() => ({
      insert: jest.fn().mockResolvedValue({ error: null }),
    }));
    // Fourth call: record level up
    mockFromCall.mockImplementationOnce(() => ({
      insert: jest.fn().mockResolvedValue({ error: null }),
    }));

    // Mock user membership
    const { listUserMemberships } = await import('@/lib/whop-sdk');
    (listUserMemberships as jest.Mock).mockResolvedValue({
      data: [
        { id: 'membership_25', experience_id: 'exp_456', status: 'active' }
      ]
    });

    const { addFreeDaysToMembership } = await import('@/lib/whop-sdk');
    (addFreeDaysToMembership as jest.Mock).mockResolvedValue({});

    const result = await handleLevelUp('user_25', 'exp_456', 24, 25);

    expect(result.success).toBe(true);
    expect(result.rewardGiven).toBe(true);
    expect(result.rewardType).toBe('free_days');
    expect(result.rewardValue).toBe('14'); // Custom value
    expect(addFreeDaysToMembership).toHaveBeenCalledWith('membership_25', 14);
  });

  it('should not deliver duplicate rewards', async () => {
    const { supabaseAdmin } = await import('@/lib/db');
    // Mock that reward was already claimed
    const mockFromCall = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: { id: 'existing_reward' }, 
        error: null 
      }), // Reward already exists
    };
    (supabaseAdmin as jest.Mock).mockReturnValue({
      from: jest.fn(() => mockFromCall),
    });

    const result = await handleLevelUp('user_123', 'exp_456', 4, 5);

    expect(result.success).toBe(true);
    expect(result.rewardGiven).toBe(false); // No reward given since it was already claimed
  });

  it('should handle cases where no active membership exists', async () => {
    const { supabaseAdmin } = await import('@/lib/db');
    // Mock that this is the first time reaching level 5
    const mockFromCall = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    };
    (supabaseAdmin as jest.Mock).mockReturnValue({
      from: jest.fn(() => mockFromCall),
    });

    // Mock no active membership
    const { listUserMemberships } = await import('@/lib/whop-sdk');
    (listUserMemberships as jest.Mock).mockResolvedValue({
      data: [] // No active memberships
    });

    const result = await handleLevelUp('user_nocomp', 'exp_456', 4, 5);

    expect(result.success).toBe(true);
    expect(result.rewardGiven).toBe(false); // No reward since no active membership
    expect(result.error).toBe('No active membership found'); // Error message added
  });

  it('should notify user about level-up', async () => {
    const { supabaseAdmin } = await import('@/lib/db');
    // Mock that this is the first time reaching level 5
    const mockFromCall = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    };
    (supabaseAdmin as jest.Mock).mockReturnValue({
      from: jest.fn(() => mockFromCall),
    });

    // Mock user membership
    const { listUserMemberships } = await import('@/lib/whop-sdk');
    (listUserMemberships as jest.Mock).mockResolvedValue({
      data: [
        { id: 'membership_123', experience_id: 'exp_456', status: 'active' }
      ]
    });

    const { addFreeDaysToMembership } = await import('@/lib/whop-sdk');
    (addFreeDaysToMembership as jest.Mock).mockResolvedValue({});

    const { sendPushNotification } = await import('@/lib/whop-sdk');
    (sendPushNotification as jest.Mock).mockResolvedValue({});

    const result = await handleLevelUp('user_123', 'exp_456', 4, 5);

    expect(result.success).toBe(true);
    expect(sendPushNotification).toHaveBeenCalledWith({
      userId: 'user_123',
      title: '🎉 Level 5 Reward!',
      message: 'Congratulations on reaching Level 5! You\'ve earned 3 free days!',
      experienceId: 'exp_456',
    });
  });

  it('should return success even if reward delivery fails', async () => {
    const { supabaseAdmin } = await import('@/lib/db');
    // Mock that this is the first time reaching level 5
    const mockFromCall = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    };
    (supabaseAdmin as jest.Mock).mockReturnValue({
      from: jest.fn(() => mockFromCall),
    });

    // Mock user membership
    const { listUserMemberships } = await import('@/lib/whop-sdk');
    (listUserMemberships as jest.Mock).mockResolvedValue({
      data: [
        { id: 'membership_123', experience_id: 'exp_456', status: 'active' }
      ]
    });

    // Mock failure in reward delivery
    const { addFreeDaysToMembership } = await import('@/lib/whop-sdk');
    (addFreeDaysToMembership as jest.Mock).mockRejectedValue(new Error('API Error'));

    const result = await handleLevelUp('user_123', 'exp_456', 4, 5);

    // Should still return success even if reward delivery fails
    expect(result.success).toBe(true);
    // But rewardGiven should be false since delivery failed
    expect(result.rewardGiven).toBe(false);
  });
});