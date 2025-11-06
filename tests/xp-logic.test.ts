import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { calculateLevel, xpForLevel, xpForNextLevel, calculateProgress, awardXP } from '@/lib/xp-logic';
import { handleLevelUp } from '@/lib/rewards';
import { hasPremiumAccess } from '@/lib/rewards';

// Mock the database and other dependencies
jest.mock('@/lib/db', () => ({
  supabaseAdmin: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  })),
}));

jest.mock('@/lib/redis', () => ({
  isOnCooldown: jest.fn(),
  setCooldown: jest.fn(),
}));

jest.mock('@/lib/whop-sdk', () => ({
  whopSdk: {
    withUser: jest.fn(() => ({
      memberships: {
        list: jest.fn(),
        addFreeDays: jest.fn(),
      },
      promoCodes: {
        create: jest.fn(),
      },
      notifications: {
        sendPushNotification: jest.fn(),
      },
    })),
  },
}));

describe('XP Logic Functions', () => {
  test('calculates level from XP correctly', () => {
    // Updated expectations after fixing level constraint bug (level starts at 1, not 0)
    expect(calculateLevel(0)).toBe(1); // Changed from 0 to 1
    expect(calculateLevel(99)).toBe(1); // Changed from 0 to 1
    expect(calculateLevel(100)).toBe(2); // Changed from 1 to 2
    expect(calculateLevel(254)).toBe(2); // Changed from 1 to 2
    expect(calculateLevel(255)).toBe(3); // Changed from 2 to 3
    expect(calculateLevel(474)).toBe(3); // Changed from 2 to 3
    expect(calculateLevel(475)).toBe(4); // Changed from 3 to 4
  });

  test('calculates XP needed for levels correctly', () => {
    // Updated expectations after fixing level constraint bug
    expect(xpForLevel(0)).toBe(0);
    expect(xpForLevel(1)).toBe(0); // Level 1 is the starting level (0 XP needed)
    expect(xpForLevel(2)).toBe(100); // Changed from level 1
    expect(xpForLevel(3)).toBe(255); // Changed from level 2
  });

  test('calculates XP for next level correctly', () => {
    // Updated expectations after fixing level constraint bug
    expect(xpForNextLevel(1)).toBe(155); // From level 1 to level 2
    expect(xpForNextLevel(2)).toBe(220); // From level 2 to level 3
    expect(xpForNextLevel(3)).toBe(295); // From level 3 to level 4
  });

  test('calculates progress correctly', () => {
    // Updated expectations after fixing level constraint bug
    const progress = calculateProgress(150, 2); // 150 total, level 2 (100-254 range)
    expect(progress.current).toBe(50);
    expect(progress.needed).toBe(220);
    expect(progress.percentage).toBeCloseTo(22.73, 1);
  });
});

describe('Reward System', () => {
  test('should handle level-up rewards', async () => {
    // Mock the database response
    const { supabaseAdmin } = await import('@/lib/db');
    (supabaseAdmin.from as Mock<any>)
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'membership_123' },
          error: null
        }),
      });

    const result = await handleLevelUp('user_123', 'exp_456', 5);
    expect(result.success).toBe(true);
    expect(result.rewardGiven).toBe(true);
  });

  test('should not give reward for non-milestone levels', async () => {
    const result = await handleLevelUp('user_123', 'exp_456', 3);
    expect(result.success).toBe(true);
    expect(result.rewardGiven).toBe(false);
  });
});

describe('Premium Access', () => {
  test('should detect premium access correctly', async () => {
    const { supabaseAdmin } = await import('@/lib/db');
    (supabaseAdmin.from as Mock<any>)
      .mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { tier: 'premium' },
          error: null
        }),
      });

    const hasAccess = await hasPremiumAccess('user_123', 'exp_456');
    expect(hasAccess).toBe(true);
  });

  test('should return false for free tier access', async () => {
    const { supabaseAdmin } = await import('@/lib/db');
    (supabaseAdmin.from as Mock<any>)
      .mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { tier: 'free' },
          error: null
        }),
      });

    const hasAccess = await hasPremiumAccess('user_123', 'exp_456');
    expect(hasAccess).toBe(false);
  });
});