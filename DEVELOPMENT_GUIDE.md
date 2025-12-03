# Development Guide: Running WEE5 Locally

## Understanding Whop App Architecture

WEE5 is a **Whop iframe app**, which means it runs inside Whop's platform with specific authentication requirements. You **cannot** simply open `http://localhost:3000` in your browser and expect it to work fully.

## Quick Start

### 1. Start the Development Server
```bash
cd wee5-app
pnpm dev
```

You should see:
```
▲ Next.js 16.0.0 (Turbopack)
- Local:        http://localhost:3000
✓ Ready in X.Xs
```

### 2. Access Your App Through Whop

**Option A: Whop Developer Dashboard (Recommended)**
1. Go to https://dev.whop.com/apps
2. Find your "WEE5" app
3. Click **"Test in Development Mode"** or **"Preview"**
4. Whop will open your app with proper authentication

**Option B: Manual Proxy URL**
If you have a Whop proxy URL, it will look like:
```
https://proxy.whop.com/.../experiences/exp_XXXX?whop-dev-user-token=...
```

This proxies to your `localhost:3000`.

## Why You Can't Use Direct Localhost

### What Happens When You Try `http://localhost:3000`

❌ **Direct Access**: `http://localhost:3000`
- No authentication token
- `getCurrentUser()` returns `null`
- Whop SDK calls fail
- Features requiring auth don't work

✅ **Whop Proxy**: `https://proxy.whop.com/...?whop-dev-user-token=...`
- Token automatically included
- Full authentication
- All features work correctly

### The Technical Details

Whop apps require:
1. **Authentication Token**: `whop-dev-user-token` in URL
2. **Iframe Context**: Runs inside Whop's iframe
3. **OAuth Flow**: Managed by Whop platform
4. **Proper Headers**: `X-Frame-Options: SAMEORIGIN`

## Development Workflows

### Testing UI Components (No Auth Required)
If you just want to see the visual design:
```bash
# Open directly (limited functionality)
http://localhost:3000
```
✅ Works for: Layout, styling, non-auth UI
❌ Doesn't work for: User data, XP, leaderboards

### Testing Full Features (Auth Required)
Always use the Whop proxy for testing:
1. Start dev server: `pnpm dev`
2. Open Whop Developer Dashboard
3. Click "Test App"

## Common Issues

### "Localhost refused to connect"
**Cause**: Trying to access `http://localhost:3000` but server isn't running.
**Fix**: Run `pnpm dev` first.

### "User is null" or "Cannot read properties of null"
**Cause**: Accessing app without authentication token.
**Fix**: Use Whop Developer Dashboard instead of direct localhost.

### "This page cannot be displayed in a frame"
**Cause**: `X-Frame-Options: DENY` in headers.
**Fix**: Already fixed - we use `SAMEORIGIN`.

## Environment Variables

Make sure you have these set in `.env.local`:
```env
NEXT_PUBLIC_WHOP_APP_ID=app_XXXX
WHOP_API_KEY=your_api_key
WHOP_AGENT_USER_ID=user_XXXX
WHOP_WEBHOOK_SECRET=your_secret

# Database
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## Testing Webhooks Locally

Use a tool like `ngrok` to expose your local server:
```bash
ngrok http 3000
```

Then configure the ngrok URL in Whop's webhook settings.

## Production Deployment

For production, deploy to Vercel:
```bash
pnpm build        # Test build locally
vercel --prod     # Deploy to production
```

See `DEPLOYMENT_CHECKLIST.md` for full deployment guide.
