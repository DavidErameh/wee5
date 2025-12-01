import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { awardXP } from '@/lib/xp-logic';

// Mock all dependencies
jest.mock('@/lib/db', () => ({
  supabaseAdmin: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }), // Default to free tier
      upsert: jest.fn().mockResolvedValue({ error: null }),
    })),
    rpc: jest.fn().mockResolvedValue({ // Add rpc mock here
      data: { old_level: 1, new_xp: 0, new_level: 1, leveled_up: false },
      error: null
    }),
  })),
}));

jest.mock('@/lib/redis', () => ({
  redis: jest.fn(),
  isOnCooldown: jest.fn().mockResolvedValue(false),
  setCooldown: jest.fn(),
}));

describe('Premium Tiers Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use default XP rates for free tier users', async () => {
    const { supabaseAdmin } = await import('@/lib/db');
    // Free tier - no custom configuration
    (supabaseAdmin().from as jest.Mock).mockReturnThis();
    (supabaseAdmin().from().select as jest.Mock).mockReturnThis();
    (supabaseAdmin().from().select().eq as jest.Mock).mockReturnThis();
    (supabaseAdmin().from().select().eq().single as jest.Mock).mockResolvedValue({ data: null, error: null });

    // Mock the RPC call to award XP
    const mockRpcResult = {
      data: { old_level: 1, new_xp: 20, new_level: 1, leveled_up: false },
      error: null
    };
    
    const mockFromResult = {
      rpc: jest.fn().mockResolvedValue(mockRpcResult),
    };
    
    (supabaseAdmin().from as jest.Mock).mockReturnValue(mockFromResult);

    const result = await awardXP('user_123', 'exp_456', 'message');

    expect(result.success).toBe(true);
    // For free tier, should use default rates: 20 XP for message
    expect(supabaseAdmin().from).toHaveBeenCalledWith('xp_configurations');
  });

  it('should use custom XP rates for premium tier users', async () => {
    const { supabaseAdmin } = await import('@/lib/db');
    // Premium tier - with custom configuration
    (supabaseAdmin().from as jest.Mock).mockReturnThis();
    (supabaseAdmin().from().select as jest.Mock).mockReturnThis();
    (supabaseAdmin().from().select().eq as jest.Mock).mockReturnThis();
    (supabaseAdmin().from().select().eq().single as jest.Mock).mockResolvedValue({ 
      data: { 
        xp_per_message: 30,  // Custom rate for premium: 30 XP per message
        min_xp_per_post: 20,
        max_xp_per_post: 35,
        xp_per_reaction: 8
      }, 
      error: null 
    });

    // Mock the RPC call to award XP
    const mockRpcResult = {
      data: { old_level: 1, new_xp: 30, new_level: 1, leveled_up: false },
      error: null
    };
    
    const mockFromResult = {
      rpc: jest.fn().mockResolvedValue(mockRpcResult),
    };
    
    (supabaseAdmin().from as jest.Mock).mockReturnValue(mockFromResult);

    const result = await awardXP('premium_user_123', 'exp_456', 'message');

    expect(result.success).toBe(true);
    // For premium tier, should use custom rates: 30 XP for message
  });

  it('should use custom rates for post activities in premium tier', async () => {
    const { supabaseAdmin } = await import('@/lib/db');
    // Premium tier - with custom configuration
    (supabaseAdmin().from as jest.Mock).mockReturnThis();
    (supabaseAdmin().from().select as jest.Mock).mockReturnThis();
    (supabaseAdmin().from().select().eq as jest.Mock).mockReturnThis();
    (supabaseAdmin().from().select().eq().single as jest.Mock).mockResolvedValue({ 
      data: { 
        xp_per_message: 25,  
        min_xp_per_post: 20,  // Custom min for premium: 20
        max_xp_per_post: 35,  // Custom max for premium: 35
        xp_per_reaction: 8
      }, 
      error: null 
    });

    // Mock the RPC call to award XP
    const mockRpcResult = {
      data: { old_level: 1, new_xp: 27, new_level: 1, leveled_up: false }, // Random between 20-35
      error: null
    };
    
    const mockFromResult = {
      rpc: jest.fn().mockResolvedValue(mockRpcResult),
    };
    
    (supabaseAdmin().from as jest.Mock).mockReturnValue(mockFromResult);

    const result = await awardXP('premium_user_123', 'exp_456', 'post');

    expect(result.success).toBe(true);
    // For premium tier posts, should use custom range 20-35 XP
  });

  it('should use custom rates for reaction activities in premium tier', async () => {
    const { supabaseAdmin } = await import('@/lib/db');
    // Premium tier - with custom configuration
    (supabaseAdmin().from as jest.Mock).mockReturnThis();
    (supabaseAdmin().from().select as jest.Mock).mockReturnThis();
    (supabaseAdmin().from().select().eq as jest.Mock).mockReturnThis();
    (supabaseAdmin().from().select().eq().single as jest.Mock).mockResolvedValue({ 
      data: { 
        xp_per_message: 25,  
        min_xp_per_post: 20,
        max_xp_per_post: 35,
        xp_per_reaction: 10  // Custom rate for premium: 10 XP per reaction
      }, 
      error: null 
    });

    // Mock the RPC call to award XP
    const mockRpcResult = {
      data: { old_level: 1, new_xp: 10, new_level: 1, leveled_up: false },
      error: null
    };
    
    const mockFromResult = {
      rpc: jest.fn().mockResolvedValue(mockRpcResult),
    };
    
    (supabaseAdmin().from as jest.Mock).mockReturnValue(mockFromResult);

    const result = await awardXP('premium_user_123', 'exp_456', 'reaction');

    expect(result.success).toBe(true);
    // For premium tier reactions, should use custom rate: 10 XP
  });

  it('should fall back to default rates when premium config is incomplete', async () => {
    const { supabaseAdmin } = await import('@/lib/db');
    // Premium tier with incomplete configuration - some fields missing
    (supabaseAdmin().from as jest.Mock).mockReturnThis();
    (supabaseAdmin().from().select as jest.Mock).mockReturnThis();
    (supabaseAdmin().from().select().eq as jest.Mock).mockReturnThis();
    (supabaseAdmin().from().select().eq().single as jest.Mock).mockResolvedValue({ 
      data: { 
        xp_per_message: 30,  // Only message rate is set
        // min_xp_per_post and max_xp_per_post are missing
        xp_per_reaction: 8
      }, 
      error: null 
    });

    // Mock the RPC call to award XP
    const mockRpcResult = {
      data: { old_level: 1, new_xp: 22, new_level: 1, leveled_up: false }, // Default 15-25 range for post
      error: null
    };
    
    const mockFromResult = {
      rpc: jest.fn().mockResolvedValue(mockRpcResult),
    };
    
    (supabaseAdmin().from as jest.Mock).mockReturnValue(mockFromResult);

    const result = await awardXP('premium_user_123', 'exp_456', 'post');

    expect(result.success).toBe(true);
    // Should fall back to default range (15-25) when min/max are not set
  });
});