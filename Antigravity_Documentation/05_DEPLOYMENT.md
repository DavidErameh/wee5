# Deployment Guide

This guide details how to deploy the WEE5 application to production. The recommended hosting platform is Vercel due to its native support for Next.js.

## Prerequisites

Before deploying, ensure you have the following:
1. **GitHub Repository**: The code should be pushed to a GitHub repository.
2. **Vercel Account**: For hosting the application.
3. **Supabase Project**: For the database and real-time features.
4. **Upstash Redis Database**: For caching and rate limiting.
5. **Whop Developer Account**: To configure the app and webhooks.

## Environment Variables

Configure the following environment variables in your hosting provider (e.g., Vercel Project Settings):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_WHOP_APP_ID` | Your Whop Application ID (Public). |
| `WHOP_API_KEY` | Secret API key for backend communication. |
| `WHOP_WEBHOOK_SECRET` | Secret used to verify incoming webhooks from Whop. |
| `SUPABASE_URL` | The REST URL of your Supabase project. |
| `SUPABASE_ANON_KEY` | The `anon` public key for Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | The `service_role` secret key (keep this secure!). |
| `UPSTASH_REDIS_REST_URL` | The REST URL for your Upstash Redis instance. |
| `UPSTASH_REDIS_REST_TOKEN` | The REST token for Upstash Redis. |
| `SENTRY_DSN` | (Optional) DSN for server-side error tracking. |
| `NEXT_PUBLIC_SENTRY_DSN` | (Optional) DSN for client-side error tracking. |

## Deployment Steps (Vercel)

1. **Import Project**:
   - Go to your Vercel Dashboard.
   - Click "Add New..." -> "Project".
   - Select your GitHub repository.

2. **Configure Project**:
   - **Framework Preset**: Next.js.
   - **Root Directory**: `./` (default).
   - **Environment Variables**: Copy-paste the variables from above.

3. **Deploy**:
   - Click "Deploy".
   - Vercel will build the application and assign a production URL.

## Database Setup

1. **Schema Migration**:
   - You must apply the database schema to your Supabase project.
   - Locally, run: `pnpm run migrate:up` (requires Supabase CLI and connection details).
   - Alternatively, copy the contents of `supabase/schema.sql` and run it in the Supabase SQL Editor.

2. **Realtime Configuration**:
   - In Supabase Dashboard, go to **Database** -> **Replication**.
   - Enable replication for the `users` table (or all relevant tables) to allow real-time subscriptions.

## Whop Configuration

1. **App URL**:
   - In your Whop Developer Dashboard, set the **Base URL** to your Vercel deployment URL (e.g., `https://wee5-app.vercel.app`).

2. **Webhooks**:
   - Set the webhook URL to `https://[your-domain]/api/webhook`.
   - Subscribe to: `membership.created`, `membership.updated`, `membership.canceled`, `payment.succeeded`.
   - **Important**: Ensure you also configure the specific activity webhooks if Whop supports them for chat/forum events, or ensure your integration captures these.

## Post-Deployment Verification

1. **Check Health**: Visit the app URL to ensure it loads.
2. **Test Webhooks**: Use the Whop dashboard to send a test webhook and check Vercel logs for successful processing.
3. **Verify Realtime**: Open the app in two different windows/browsers and verify that updates in one reflect in the other.
