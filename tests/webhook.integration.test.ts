import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { POST as webhookHandler } from '@/app/api/webhook/route';
import { NextRequest } from 'next/server';

// Mock all dependencies
jest.mock('@/lib/db', () => ({
  supabaseAdmin: jest.fn(() => ({
    from: jest.fn(() => ({
      upsert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}));

jest.mock('@/lib/xp-logic', () => ({
  awardXP: jest.fn().mockResolvedValue({
    success: true,
    xpAwarded: 20,
    newTotalXp: 20,
    leveledUp: false
  }),
}));

jest.mock('@/lib/webhook-validation', () => ({
  validateWebhook: jest.fn().mockReturnValue({
    success: true,
    data: {
      action: 'message.created',
      data: {
        user_id: 'user_test_123',
        experience_id: 'exp_test_456',
        content: 'Test message',
        created_at: 1234567890
      }
    }
  })
}));

jest.mock('@/lib/webhook-security', () => ({
  verifyWhopSignature: jest.fn().mockReturnValue(true),
}));

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue(true),
}));

describe('Webhook Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process message creation webhook successfully', async () => {
    const mockRequest = {
      text: jest.fn().mockResolvedValue(JSON.stringify({
        action: 'message.created',
        data: {
          user_id: 'user_test_123',
          experience_id: 'exp_test_456',
          content: 'Test message',
          created_at: 1234567890
        }
      })),
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'x-whop-signature') return 'v1=test_signature';
          if (header === 'x-whop-timestamp') return '1234567890';
          if (header === 'x-forwarded-for') return '192.168.1.1';
          return null;
        })
      }
    } as unknown as NextRequest;

    const response = await webhookHandler(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.received).toBe(true);
  });

  it('should process post creation webhook successfully', async () => {
    const mockRequest = {
      text: jest.fn().mockResolvedValue(JSON.stringify({
        action: 'post.created',
        data: {
          user_id: 'user_test_123',
          experience_id: 'exp_test_456',
          title: 'Test post',
          content: 'Test post content',
          created_at: 1234567890
        }
      })),
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'x-whop-signature') return 'v1=test_signature';
          if (header === 'x-whop-timestamp') return '1234567890';
          return null;
        })
      }
    } as unknown as NextRequest;

    const response = await webhookHandler(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should process reaction creation webhook successfully', async () => {
    const mockRequest = {
      text: jest.fn().mockResolvedValue(JSON.stringify({
        action: 'reaction.created',
        data: {
          user_id: 'user_test_123',
          experience_id: 'exp_test_456',
          created_at: 1234567890
        }
      })),
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'x-whop-signature') return 'v1=test_signature';
          if (header === 'x-whop-timestamp') return '1234567890';
          return null;
        })
      }
    } as unknown as NextRequest;

    const response = await webhookHandler(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should handle membership status changes', async () => {
    const mockRequest = {
      text: jest.fn().mockResolvedValue(JSON.stringify({
        action: 'membership.went_valid',
        data: {
          user_id: 'user_test_123',
          product_id: 'exp_test_456',
          status: 'active'
        }
      })),
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'x-whop-signature') return 'v1=test_signature';
          if (header === 'x-whop-timestamp') return '1234567890';
          return null;
        })
      }
    } as unknown as NextRequest;

    const { supabaseAdmin } = await import('@/lib/db');
    const mockSupabaseInstance = {
      from: jest.fn(() => ({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      })),
    };
    (supabaseAdmin as jest.Mock).mockReturnValue(mockSupabaseInstance);

    const response = await webhookHandler(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should reject invalid signatures', async () => {
    const { verifyWhopSignature } = await import('@/lib/webhook-security');
    (verifyWhopSignature as jest.Mock).mockReturnValue(false);

    const mockRequest = {
      text: jest.fn().mockResolvedValue(JSON.stringify({
        action: 'message.created',
        data: {
          user_id: 'user_test_123',
          experience_id: 'exp_test_456',
          content: 'Test message',
          created_at: 1234567890
        }
      })),
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'x-whop-signature') return 'v1=invalid_signature';
          if (header === 'x-whop-timestamp') return '1234567890';
          return null;
        })
      }
    } as unknown as NextRequest;

    const response = await webhookHandler(mockRequest);

    expect(response.status).toBe(401);
  });

  it('should handle rate limiting', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    (checkRateLimit as jest.Mock).mockResolvedValue(false);

    const mockRequest = {
      text: jest.fn().mockResolvedValue(JSON.stringify({
        action: 'message.created',
        data: {
          user_id: 'user_test_123',
          experience_id: 'exp_test_456',
          content: 'Test message',
          created_at: 1234567890
        }
      })),
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'x-whop-signature') return 'v1=test_signature';
          if (header === 'x-whop-timestamp') return '1234567890';
          if (header === 'x-forwarded-for') return '192.168.1.1';
          return null;
        })
      }
    } as unknown as NextRequest;

    const response = await webhookHandler(mockRequest);

    expect(response.status).toBe(429);
  });
});