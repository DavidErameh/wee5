import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { POST as awardXPAPI } from '@/app/api/xp/route';
import { GET as getLeaderboardAPI } from '@/app/api/leaderboard/route';

// Mock all dependencies for API testing
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextRequest: jest.fn(),
    NextResponse: {
      json: jest.fn((data) => ({ 
        json: async () => data, 
        status: jest.fn(() => ({ json: async () => data })) 
      })),
    },
  };
});

jest.mock('@/lib/xp-logic', () => ({
  awardXP: jest.fn(),
  calculateLevel: jest.fn(),
  xpForNextLevel: jest.fn(),
}));

jest.mock('@/lib/rewards', () => ({
  handleLevelUp: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  supabase: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
        limit: jest.fn(() => ({
          order: jest.fn(() => ({
            gte: jest.fn(() => ({
              eq: jest.fn(() => ({
                limit: jest.fn(),
              })),
            })),
          })),
        })),
      })),
    })),
  })),
  supabaseAdmin: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
        limit: jest.fn(() => ({
          order: jest.fn(() => ({
            gte: jest.fn(() => ({
              eq: jest.fn(() => ({
                limit: jest.fn(),
              })),
            })),
          })),
        })),
      })),
    })),
  })),
}));

jest.mock('@/lib/redis', () => ({
  getCachedLeaderboard: jest.fn(),
  cacheLeaderboard: jest.fn(),
}));

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(() => Promise.resolve(true)),
}));

describe('XP API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should award XP successfully', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: 'user123',
        experienceId: 'exp456',
        activityType: 'message'
      }),
      nextUrl: {
        searchParams: new URLSearchParams()
      }
    } as any;

    const { awardXP } = await import('@/lib/xp-logic');
    (awardXP as jest.Mock).mockResolvedValue({
      success: true,
      xpAwarded: 20,
      newTotalXp: 120,
      leveledUp: false
    });

    const response = await awardXPAPI(mockRequest);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.xpAwarded).toBe(20);
  });

  it('should handle cooldown correctly', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: 'user123',
        experienceId: 'exp456',
        activityType: 'message'
      }),
      nextUrl: {
        searchParams: new URLSearchParams()
      }
    } as any;

    const { awardXP } = await import('@/lib/xp-logic');
    (awardXP as jest.Mock).mockResolvedValue({
      success: true,
      onCooldown: true
    });

    const response = await awardXPAPI(mockRequest);
    expect(response.status).toBe(429); // Rate limited
  });
});

describe('Leaderboard API Route', () => {
  it('should fetch leaderboard successfully', async () => {
    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams('experienceId=exp456&filter=all-time&limit=10')
      }
    } as any;

    const { supabase } = await import('@/lib/db');
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
          limit: jest.fn(() => ({
            order: jest.fn(() => ({
              gte: jest.fn(() => ({
                eq: jest.fn(() => ({
                  limit: jest.fn(),
                })),
              })),
            })),
          })),
        })),
      })),
    };
    (supabase as jest.Mock).mockReturnValue(mockSupabase);

    // Mock for the leaderboard query
    const mockLeaderboardQuery = {
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [
          { user_id: 'user1', xp: 500, level: 5, rank: 1 },
          { user_id: 'user2', xp: 400, level: 4, rank: 2 }
        ],
        error: null
      }),
    };

    // Mock the chain correctly
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnValue(mockLeaderboardQuery);
    const mockOrder = jest.fn().mockReturnValue(mockLeaderboardQuery);
    const mockLimit = jest.fn().mockReturnValue(mockLeaderboardQuery);

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit
    });

    const response = await getLeaderboardAPI(mockRequest);
    const data = await response.json();

    expect(data.leaderboard.length).toBe(2);
    expect(data.leaderboard[0].user_id).toBe('user1');
  });
});