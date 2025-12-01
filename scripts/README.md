# WEE5 Scripts

Utility scripts for WebSocket and real-time service management.

## Available Scripts

### 1. Environment Validation

```bash
npm run validate:env
# or
tsx scripts/check-env.ts
```

**Purpose:** Validates all required environment variables are set correctly.

**Output:**
- ✅ Lists all configured variables
- ❌ Shows missing or invalid variables
- ⚠️ Warns about optional variables

**When to use:**
- Before starting development
- After updating `.env.local`
- When troubleshooting configuration issues

---

### 2. WebSocket Connection Test

```bash
npm run test:ws
# or
tsx scripts/test-websocket.ts
```

**Purpose:** Tests WebSocket connection to Whop and logs all received events.

**Output:**
- Connection status
- All received WebSocket events
- Parsed activity data (chat messages, forum posts)

**When to use:**
- Testing WebSocket connectivity
- Debugging event reception
- Verifying agent user configuration

**How to test:**
1. Run the script
2. Send a message in a Whop community where your app is installed
3. Verify the event appears in the output

---

### 3. Real-Time Service Startup

```bash
npm run realtime
# or
tsx scripts/start-realtime.ts
```

**Purpose:** Starts the real-time WebSocket service as a long-running process.

**Output:**
- Service initialization status
- WebSocket connection status
- Continuous event processing

**When to use:**
- Running real-time service in production
- Testing service lifecycle
- Development alongside Next.js

**Notes:**
- Runs until stopped with Ctrl+C
- Handles graceful shutdown
- Auto-reconnects on disconnection

---

## Prerequisites

All scripts require:
- Node.js 22.4+ or Bun
- Properly configured `.env.local` file
- Required environment variables set

## Environment Variables Required

```bash
# Core Whop Config
WHOP_API_KEY=your_api_key
WHOP_AGENT_USER_ID=user_XXXXXXXXXXXX
NEXT_PUBLIC_WHOP_APP_ID=app_XXXXXXXXXXXX

# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

## Troubleshooting

### "Missing required environment variables"
- Run `npm run validate:env` to see which variables are missing
- Check `.env.local` file exists and has correct values
- Ensure variable names match exactly (case-sensitive)

### "WebSocket connection failed"
- Verify Node.js version: `node --version` (must be 22.4+)
- Check `WHOP_AGENT_USER_ID` format (must start with `user_`)
- Verify API key is correct
- Ensure app is installed on at least one community

### "Agent validation failed"
- Check agent user exists in Whop dashboard
- Verify API key has proper permissions
- Ensure `WHOP_AGENT_USER_ID` is correct

## Development Workflow

1. **First time setup:**
   ```bash
   npm run validate:env  # Check configuration
   npm run test:ws       # Test WebSocket connection
   ```

2. **Development:**
   ```bash
   npm run dev           # Start Next.js (terminal 1)
   npm run realtime      # Start real-time service (terminal 2)
   ```

3. **Testing:**
   - Send test messages in Whop community
   - Check logs in both terminals
   - Verify XP awards in database

## Production Deployment

For production, initialize the service via API endpoint instead:

```bash
# After deployment
curl https://your-app.vercel.app/api/init

# Check status
curl https://your-app.vercel.app/api/debug/realtime
```

See `WEBSOCKET_IMPLEMENTATION_REPORT.md` for complete deployment guide.
