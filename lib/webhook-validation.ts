// lib/webhook-validation.ts
import { z } from 'zod';

// Base webhook schema
const WebhookBaseSchema = z.object({
  action: z.enum([
    'membership.went_valid',
    'membership.went_invalid',
    'payment.succeeded',
    'payment.failed',
  ]),
  data: z.object({
    id: z.string().regex(/^(mem|pay)_[a-zA-Z0-9]+$/, 'Invalid ID format'),
    user_id: z.string().regex(/^user_[a-zA-Z0-9]+$/, 'Invalid user ID'),
    product_id: z.string().regex(/^prod_[a-zA-Z0-9]+$/).optional(),
    created_at: z.number().positive('Timestamp must be positive'),
  }).passthrough(), // Allow additional fields
});

// Specific schemas for each action
const MembershipWebhookSchema = WebhookBaseSchema.extend({
  action: z.enum(['membership.went_valid', 'membership.went_invalid']),
  data: z.object({
    id: z.string().regex(/^mem_/),
    user_id: z.string().regex(/^user_/),
    product_id: z.string().regex(/^prod_/),
    plan_id: z.string().regex(/^plan_/).optional(),
    status: z.enum(['valid', 'invalid', 'active', 'expired']),
    created_at: z.number(),
    expires_at: z.number().optional(),
  }).passthrough(),
});

const PaymentWebhookSchema = WebhookBaseSchema.extend({
  action: z.enum(['payment.succeeded', 'payment.failed']),
  data: z.object({
    id: z.string().regex(/^pay_/),
    user_id: z.string().regex(/^user_/),
    membership_id: z.string().regex(/^mem_/).optional(),
    final_amount: z.number().nonnegative(),
    status: z.enum(['succeeded', 'failed']),
    created_at: z.number(),
  }).passthrough(),
});

// Server-side event validation (WebSocket)
const ServerEventSchema = z.object({
  feedEntity: z.object({
    dmsPost: z.object({
      author_id: z.string().regex(/^user_/),
      experience_id: z.string().regex(/^exp_/),
      content: z.string().max(10000),
      created_at: z.number().positive(),
    }).optional(),
    forumPost: z.object({
      author_id: z.string().regex(/^user_/),
      experience_id: z.string().regex(/^exp_/),
      content: z.string().max(50000),
      created_at: z.number().positive(),
    }).optional(),
  }).optional(),
}).passthrough();

export function validateWebhook(rawData: unknown) {
  // Try base schema first
  const baseResult = WebhookBaseSchema.safeParse(rawData);

  if (!baseResult.success) {
    return {
      success: false,
      error: baseResult.error.flatten(),
    };
  }

  // Validate specific schema based on action
  const { action } = baseResult.data;

  if (action.startsWith('membership')) {
    return MembershipWebhookSchema.safeParse(rawData);
  } else if (action.startsWith('payment')) {
    return PaymentWebhookSchema.safeParse(rawData);
  }

  return baseResult;
}

export function validateServerEvent(rawData: unknown) {
  return ServerEventSchema.safeParse(rawData);
}