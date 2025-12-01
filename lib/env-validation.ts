import { z } from 'zod';

const envSchema = z.object({
  // Whop Configuration
  WHOP_API_KEY: z.string().startsWith('whop_'),
  NEXT_PUBLIC_WHOP_APP_ID: z.string().startsWith('app_'),
  WHOP_WEBHOOK_SECRET: z.string().min(32),

  // Database
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),

  // Redis
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),

  // Optional
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  CRON_SECRET: z.string().optional(),
});

export function validateEnv() {
  try {
    envSchema.parse(process.env);
    console.log('✅ Environment variables validation passed');
  } catch (error) {
    console.error('❌ Invalid environment variables:');
    console.error(error);
    process.exit(1);
  }
}

// Call this at app startup
validateEnv();