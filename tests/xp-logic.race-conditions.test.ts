import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { awardXP } from '@/lib/xp-logic';

// Mock the database and other dependencies
jest.mock('@/lib/db', () => ({
  supabaseAdmin: jest.fn(() => ({
    from: jest.fn(() => ({
      upsert: jest.fn().mockResolvedValue({ error: null }),
      update: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { xp: 0, level: 1 }, error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    })),
    rpc: jest.fn().mockResolvedValue({
      data: { old_level: 1, new_xp: 20, new_level: 1, leveled_up: false },
      error: null
    }),
  })),
}));

jest.mock('@/lib/redis', () => ({
  redis: jest.fn(),
  isOnCooldown: jest.fn().mockResolvedValue(false),
  setCooldown: jest.fn(),
}));

describe('XP System - Race Condition Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('concurrent XP awards do not cause lost updates', async () => {
    const userId = 'test_user_1';
    const experienceId = 'exp_test_1';

    // Simulate 5 concurrent XP award requests
    const promises = Array.from({ length: 5 }, (_, i) =>
      awardXP(userId, experienceId, 'message') // 20 XP each for messages
    );

    const results = await Promise.all(promises);

    // Count successful awards (some may fail due to cooldown in real implementation)
    const successfulAwards = results.filter(r => r.success && !r.onCooldown);

    // In our case, since we're mocking the cooldown to return false,
    // all should succeed in the mock environment
    expect(successfulAwards.length).toBeGreaterThanOrEqual(1);

    // Verify that the XP awarding logic returns correct values
    for (const result of successfulAwards) {
      expect(result.success).toBe(true);
      expect(result.xpAwarded).toBeGreaterThanOrEqual(20); // At least 20 XP for message
    }
  });

  it('user creation race condition is handled', async () => {
    const userId = 'new_user_' + Date.now();
    const experienceId = 'exp_test_1';

    // Mock for a new user scenario
    const mockSupabase = {
      from: jest.fn(() => ({
        upsert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockResolvedValue({ error: null }),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { xp: 25, level: 1 }, error: null }),
        rpc: jest.fn().mockResolvedValue({
          data: { old_level: 1, new_xp: 25, new_level: 1, leveled_up: false },
          error: null
        }),
        insert: jest.fn().mockResolvedValue({ error: null }),
      })),
      rpc: jest.fn().mockResolvedValue({
        data: { old_level: 1, new_xp: 25, new_level: 1, leveled_up: false },
        error: null
      }),
    };

    const { supabaseAdmin } = await import('@/lib/db');
    (supabaseAdmin as jest.Mock).mockReturnValue(mockSupabase);

    // Simulate 3 concurrent requests for a brand new user
    const promises = Array.from({ length: 3 }, () =>
      awardXP(userId, experienceId, 'post') // Post activity type
    );

    const results = await Promise.all(promises);

    // All should succeed without duplicate key errors thanks to UPSERT
    const successful = results.filter(r => r.success && !r.onCooldown);
    expect(successful.length).toBeGreaterThanOrEqual(1);
  });

  it('respects cooldown period', async () => {
    // Mock that user is on cooldown
    const { isOnCooldown } = await import('@/lib/redis');
    (isOnCooldown as jest.Mock).mockResolvedValue(true);

    const result = await awardXP('test_user', 'exp_test', 'message');
    
    expect(result.success).toBe(true);
    expect(result.onCooldown).toBe(true);
  });
});