import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import { processActivityEvent } from '@/lib/event-processor';

// Mock all the dependencies
jest.mock('@/lib/xp-logic', () => ({
  awardXP: jest.fn().mockResolvedValue({
    success: true,
    xpAwarded: 20,
    newTotalXp: 20,
    leveledUp: false
  }),
  calculateLevel: jest.fn().mockReturnValue(1),
}));

jest.mock('@/lib/rewards', () => ({
  handleLevelUp: jest.fn().mockResolvedValue({}),
}));

jest.mock('@/lib/db', () => ({
  supabaseAdmin: () => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { xp: 0, level: 1 }, error: null }),
      update: jest.fn().mockResolvedValue({ error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    })),
  }),
}));

jest.mock('@/lib/redis', () => ({
  redis: jest.fn(),
  isOnCooldown: jest.fn().mockResolvedValue(false),
  setCooldown: jest.fn(),
}));

describe('Event Processor Integration Tests', () => {
  beforeAll(() => {
    // Ensure all mocks are properly set up
    jest.clearAllMocks();
  });

  it('processes message event correctly', async () => {
    const event = {
      type: 'message',
      userId: 'test_user_1',
      experienceId: 'exp_test_1',
      content: 'Hello world',
      timestamp: Date.now(),
    };

    await processActivityEvent(event);

    // Verify that awardXP was called with correct parameters
    const { awardXP } = await import('@/lib/xp-logic');
    expect(awardXP).toHaveBeenCalledWith('test_user_1', 'exp_test_1', 'message');
  });

  it('processes post event correctly', async () => {
    const event = {
      type: 'post',
      userId: 'test_user_2',
      experienceId: 'exp_test_2',
      content: 'This is a test post',
      timestamp: Date.now(),
    };

    await processActivityEvent(event);

    const { awardXP } = await import('@/lib/xp-logic');
    expect(awardXP).toHaveBeenCalledWith('test_user_2', 'exp_test_2', 'post');
  });

  it('processes reaction event correctly', async () => {
    const event = {
      type: 'reaction',
      userId: 'test_user_3',
      experienceId: 'exp_test_3',
      timestamp: Date.now(),
    };

    await processActivityEvent(event);

    const { awardXP } = await import('@/lib/xp-logic');
    expect(awardXP).toHaveBeenCalledWith('test_user_3', 'exp_test_3', 'reaction');
  });

  it('handles level-up correctly', async () => {
    // Mock a scenario where the user levels up
    const { awardXP } = await import('@/lib/xp-logic');
    (awardXP as jest.Mock).mockResolvedValue({
      success: true,
      xpAwarded: 20,
      newTotalXp: 150, // Enough XP to level up
      leveledUp: true,
      oldLevel: 1,
      newLevel: 2,
    });

    const event = {
      type: 'message',
      userId: 'level_up_user',
      experienceId: 'exp_test_4',
      content: 'Message triggering level up',
      timestamp: Date.now(),
    };

    await processActivityEvent(event);

    // Verify that handleLevelUp was called due to leveling up
    const { handleLevelUp } = await import('@/lib/rewards');
    expect(handleLevelUp).toHaveBeenCalledWith('level_up_user', 'exp_test_4', 2);
  });

  it('continues processing when level-up fails', async () => {
    // Mock level-up failure but ensure main flow continues
    const { awardXP } = await import('@/lib/xp-logic');
    (awardXP as jest.Mock).mockResolvedValue({
      success: true,
      xpAwarded: 20,
      newTotalXp: 150,
      leveledUp: true,
      oldLevel: 1,
      newLevel: 2,
    });

    const { handleLevelUp } = await import('@/lib/rewards');
    (handleLevelUp as jest.Mock).mockRejectedValue(new Error('Level up failed'));

    const event = {
      type: 'message',
      userId: 'user_with_levelup_error',
      experienceId: 'exp_test_5',
      content: 'Message with level up error',
      timestamp: Date.now(),
    };

    // Should not throw, even if level-up handler fails
    await expect(processActivityEvent(event)).resolves.not.toThrow();

    // But level-up handler was still called
    expect(handleLevelUp).toHaveBeenCalledWith('user_with_levelup_error', 'exp_test_5', 2);
  });
});