import { describe, test, expect, vi, beforeEach } from 'vitest';
import { POST as awardXPAPI } from '@/app/api/xp/route';
import { GET as getLeaderboardAPI } from '@/app/api/leaderboard/route';

// Mock all dependencies for API testing
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextRequest: vi.fn(),
    NextResponse: {
      json: vi.fn((data) => ({ 
        json: async () => data, 
        status: vi.fn(() => ({ json: async () => data })) 
      })),
    },
  };
});

vi.mock('@/lib/xp-logic', () => ({
  awardXP: vi.fn(),
  calculateLevel: vi.fn(),
  xpForNextLevel: vi.fn(),
}));

vi.mock('@/lib/rewards', () => ({
  handleLevelUp: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        limit: vi.fn(() => ({
          order: vi.fn(() => ({
            gte: vi.fn(() => ({
              eq: vi.fn(() => ({
                limit: vi.fn(),
              })),
            })),
          })),
        })),
      })),
    })),
  },
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        limit: vi.fn(() => ({
          order: vi.fn(() => ({
            gte: vi.fn(() => ({
              eq: vi.fn(() => ({
                limit: vi.fn(),
              })),
            })),
          })),
        })),
      })),
    })),
  },
}));

vi.mock('@/lib/redis', () => ({
  getCachedLeaderboard: vi.fn(),
  cacheLeaderboard: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(true)),
}));

describe('XP API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should award XP successfully', async () => {
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        userId: 'user123',
        experienceId: 'exp456',
        activityType: 'message'
      }),
      nextUrl: {
        searchParams: new URLSearchParams()
      }
    } as any;

    const { awardXP } = await import('@/lib/xp-logic');
    (awardXP as vi.Mock).mockResolvedValue({
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

  test('should handle XP award failure', async () => {
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        userId: 'user123',
        experienceId: 'exp456',
        activityType: 'message'
      }),
      nextUrl: {
        searchParams: new URLSearchParams()
      }
    } as any;

    const { awardXP } = await import('@/lib/xp-logic');
    (awardXP as vi.Mock).mockResolvedValue({
      success: false,
      error: 'User is on cooldown'
    });

    const response = await awardXPAPI(mockRequest);
    expect(response.status).toBe(429); // Rate limited
  });
});

describe('Leaderboard API Route', () => {
  test('should fetch leaderboard successfully', async () => {
    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams('experienceId=exp456&filter=all-time&limit=10')
      }
    } as any;

    const { supabaseAdmin } = await import('@/lib/db');
    (supabaseAdmin.from as vi.Mock).mockReturnThis();
    (supabaseAdmin.select as vi.Mock).mockReturnThis();
    (supabaseAdmin.eq as vi.Mock).mockReturnThis();
    (supabaseAdmin.order as vi.Mock).mockReturnThis();
    (supabaseAdmin.limit as vi.Mock).mockResolvedValue({
      data: [
        { user_id: 'user1', xp: 500, level: 5, rank: 1 },
        { user_id: 'user2', xp: 400, level: 4, rank: 2 }
      ],
      error: null
    });

    const response = await getLeaderboardAPI(mockRequest);
    const data = await response.json();

    expect(data.leaderboard.length).toBe(2);
    expect(data.leaderboard[0].user_id).toBe('user1');
  });
});