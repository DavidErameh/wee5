import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GET as getLeaderboardAPI } from '@/app/api/leaderboard/route';
import { NextRequest } from 'next/server';

// Mock all dependencies
jest.mock('@/lib/db', () => ({
  supabase: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  supabaseAdmin: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
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

describe('Leaderboard Real-Time Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all-time leaderboard data', async () => {
    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams('experienceId=exp456&filter=all-time&limit=10')
      }
    } as unknown as NextRequest;

    const { supabase } = await import('@/lib/db');
    const mockSupabaseInstance = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [
            { user_id: 'user1', xp: 500, level: 5, total_messages: 10, total_posts: 5, total_reactions: 2, rank: 1 },
            { user_id: 'user2', xp: 400, level: 4, total_messages: 8, total_posts: 4, total_reactions: 1, rank: 2 },
            { user_id: 'user3', xp: 300, level: 3, total_messages: 6, total_posts: 3, total_reactions: 0, rank: 3 }
          ],
          error: null
        }),
      })),
    };
    (supabase as jest.Mock).mockReturnValue(mockSupabaseInstance);

    const response = await getLeaderboardAPI(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard.length).toBe(3);
    expect(data.leaderboard[0].user_id).toBe('user1');
    expect(data.leaderboard[0].rank).toBe(1);
    expect(data.leaderboard[0].xp).toBe(500);
  });

  it('should fetch weekly leaderboard data', async () => {
    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams('experienceId=exp456&filter=week&limit=20')
      }
    } as unknown as NextRequest;

    const { supabase } = await import('@/lib/db');
    const mockSupabaseInstance = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(), // For time filtering
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [
            { user_id: 'user2', xp: 150, level: 2, total_messages: 5, total_posts: 2, total_reactions: 1, rank: 1 },
            { user_id: 'user1', xp: 100, level: 1, total_messages: 3, total_posts: 1, total_reactions: 2, rank: 2 }
          ],
          error: null
        }),
      })),
    };
    (supabase as jest.Mock).mockReturnValue(mockSupabaseInstance);

    const response = await getLeaderboardAPI(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard.length).toBe(2);
    expect(data.leaderboard[0].user_id).toBe('user2');
    expect(data.leaderboard[0].rank).toBe(1);
  });

  it('should fetch monthly leaderboard data', async () => {
    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams('experienceId=exp456&filter=month&limit=50')
      }
    } as unknown as NextRequest;

    const { supabase } = await import('@/lib/db');
    const mockSupabaseInstance = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(), // For time filtering
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [
            { user_id: 'user1', xp: 800, level: 6, total_messages: 15, total_posts: 8, total_reactions: 5, rank: 1 },
            { user_id: 'user3', xp: 650, level: 5, total_messages: 12, total_posts: 6, total_reactions: 3, rank: 2 },
            { user_id: 'user2', xp: 550, level: 4, total_messages: 10, total_posts: 5, total_reactions: 4, rank: 3 }
          ],
          error: null
        }),
      })),
    };
    (supabase as jest.Mock).mockReturnValue(mockSupabaseInstance);

    const response = await getLeaderboardAPI(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard.length).toBe(3);
    expect(data.leaderboard[0].user_id).toBe('user1');
    expect(data.leaderboard[0].rank).toBe(1);
  });

  it('should handle empty leaderboard', async () => {
    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams('experienceId=exp_empty&filter=all-time&limit=10')
      }
    } as unknown as NextRequest;

    const { supabase } = await import('@/lib/db');
    const mockSupabaseInstance = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        }),
      })),
    };
    (supabase as jest.Mock).mockReturnValue(mockSupabaseInstance);

    const response = await getLeaderboardAPI(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard.length).toBe(0);
  });

  it('should handle rate limiting', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    (checkRateLimit as jest.Mock).mockResolvedValue(false);

    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams('experienceId=exp456&filter=all-time&limit=10')
      }
    } as unknown as NextRequest;

    const response = await getLeaderboardAPI(mockRequest);

    expect(response.status).toBe(429);
  });

  it('should use cached data when available', async () => {
    const { getCachedLeaderboard } = await import('@/lib/redis');
    (getCachedLeaderboard as jest.Mock).mockResolvedValue([
      { user_id: 'cached_user1', xp: 1000, level: 7, rank: 1 },
      { user_id: 'cached_user2', xp: 900, level: 6, rank: 2 }
    ]);

    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams('experienceId=exp456&filter=all-time&limit=10')
      }
    } as unknown as NextRequest;

    const response = await getLeaderboardAPI(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard.length).toBe(2);
    expect(data.leaderboard[0].user_id).toBe('cached_user1');
    expect(data.cached).toBe(true);
  });

  it('should validate query parameters', async () => {
    const mockInvalidRequest = {
      nextUrl: {
        searchParams: new URLSearchParams('experienceId=&filter=invalid-filter&limit=invalid')
      }
    } as unknown as NextRequest;

    const response = await getLeaderboardAPI(mockInvalidRequest);

    expect(response.status).toBe(400);
  });
});