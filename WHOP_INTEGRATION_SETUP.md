# Whop Integration Setup Guide

**Status:** 🔴 REQUIRED FOR PRODUCTION  
**Priority:** P0 - CRITICAL  
**Estimated Time:** 2-3 hours

---

## 📋 Overview

This guide walks you through setting up the Whop-specific integrations that are documented but not yet implemented. These are **critical** for the app to function as a Whop-native product.

---

## 🚀 Step 1: Install Whop SDK

### Install Package
```bash
cd wee5-app
pnpm add whop-sdk-ts
```

### Verify Installation
```bash
pnpm list whop-sdk-ts
```

**Expected Output:** `whop-sdk-ts@latest`

---

## 🤖 Step 2: Create Bot User

Per `UNDERSTANDING_BOTUSER.MD`, you need a dedicated bot user for real-time event listening.

### 2.1 Create Bot Account

1. **Go to Whop Dashboard**
   - Visit: https://business.whop.com
   - Navigate to your company/app settings

2. **Create New User**
   - Option A: Use dashboard Members > Add Member
   - Option B: Sign up new account at whop.com/signup
   - Email: `wee5-bot@yourdomain.com` (use dedicated email)
   - Username: `WEE5-Bot` or similar

3. **Add Bot to Communities**
   - Add the bot user to all communities where you want XP tracking
   - Give appropriate permissions (member level is sufficient)

### 2.2 Get Bot User ID

**Method 1: Via Dashboard**
1. Go to Members section
2. Find your bot user
3. Click to view details
4. Copy the user ID (format: `user_xxxxxxxxxxxx`)

**Method 2: Via API**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.whop.com/v5/app/members
```
Find your bot in the response and copy the `id` field.

### 2.3 Generate OAuth Token

1. **Set Up OAuth in Dashboard**
   - Apps > Your App > Integration > Enable OAuth
   - Add scopes: `me:read`, `support_chat:create`
   - Note the Client ID and Client Secret

2. **Authorize Bot User**
   - Use OAuth flow to authorize the bot user
   - Redirect to: `/oauth/authorize?client_id=YOUR_CLIENT_ID&scope=me:read`
   - Complete authorization as the bot user
   - Exchange code for access token via `/oauth/token`

3. **Save Token Securely**
   - Store in environment variables (never commit to git)
   - Token format: `oauth_xxxxxxxxxxxx`

---

## 🔑 Step 3: Configure Environment Variables

### 3.1 Update .env.local

Add these variables to your `.env.local` file:

```env
# Whop API Configuration
WHOP_API_KEY=your_whop_api_key_here
WHOP_APP_ID=your_app_id_here
WHOP_WEBHOOK_SECRET=your_webhook_secret_here

# Bot User Configuration (CRITICAL for real-time)
WHOP_BOT_USER_ID=user_xxxxxxxxxxxx
WHOP_BOT_TOKEN=oauth_xxxxxxxxxxxx

# Optional: Enable reaction polling fallback
ENABLE_REACTION_POLLING=true
```

### 3.2 Get API Keys

1. **WHOP_API_KEY**
   - Dashboard > Developer > API Keys
   - Create new key with appropriate scopes
   - Copy and save securely

2. **WHOP_APP_ID**
   - Dashboard > Apps > Your App
   - Copy the App ID

3. **WHOP_WEBHOOK_SECRET**
   - Dashboard > Apps > Your App > Webhooks
   - Copy the webhook secret for signature verification

### 3.3 Verify Configuration

Create a test script to verify:

```typescript
// test-whop-config.ts
import { whopClient } from './lib/whop-sdk';

async function testConfig() {
  try {
    console.log('Testing Whop SDK configuration...');
    
    // Test API key
    const experiences = await whopClient.experiences.list();
    console.log('✅ API Key valid');
    
    // Test bot user
    const botId = process.env.WHOP_BOT_USER_ID;
    console.log(`✅ Bot User ID: ${botId}`);
    
    console.log('🎉 Configuration successful!');
  } catch (error) {
    console.error('❌ Configuration error:', error);
  }
}

testConfig();
```

Run: `npx tsx test-whop-config.ts`

---

## 🔌 Step 4: Configure Webhooks

### 4.1 Set Webhook URL

1. **Go to Whop Dashboard**
   - Apps > Your App > Webhooks

2. **Add Webhook Endpoint**
   - URL: `https://your-app.vercel.app/api/webhook`
   - For local testing: Use ngrok or similar tunnel

3. **Select Events**
   - `payment.succeeded`
   - `membership.created`
   - `membership.went_valid`
   - `membership.went_invalid`

4. **Save and Test**
   - Send test webhook
   - Verify signature verification works

### 4.2 Verify Webhook Handler

The webhook handler at `/api/webhook/route.ts` should:
- ✅ Verify Whop signature
- ✅ Process membership events
- ✅ Update user tiers
- ✅ Trigger XP initialization

---

## 🌐 Step 5: Test Real-Time Integration

### 5.1 Start Development Server

```bash
pnpm dev
```

### 5.2 Monitor WebSocket Connection

Check console for:
```
🔌 Connecting to Whop WebSocket...
✅ Connected to Whop WebSocket
📡 Subscribed to community events
```

### 5.3 Test XP Awarding

1. **Send Test Message**
   - As a regular user (not bot), send a message in a community
   - Bot should receive `dmsPost` event

2. **Check Logs**
   ```
   📨 Received event: dmsPost
   ✅ Awarded 20 XP to user_xxx for chat message
   ```

3. **Verify Database**
   - Check Supabase `users` table
   - XP should be updated within 1-2 seconds

### 5.4 Test Level-Up Rewards

1. **Manually Set User to Level 4**
   ```sql
   UPDATE users 
   SET xp = 480, level = 4 
   WHERE user_id = 'test_user';
   ```

2. **Award XP to Trigger Level 5**
   - Send message or use API
   - Should trigger level-up to 5

3. **Verify Reward Delivery**
   - Check logs for: `✅ Added 3 free days to membership`
   - Check Whop dashboard for membership extension
   - User should receive push notification

---

## 📦 Step 6: Install Additional Dependencies

### Required Packages

```bash
# WebSocket support
pnpm add ws
pnpm add -D @types/ws

# Ensure Whop SDK is installed
pnpm add whop-sdk-ts
```

### Verify package.json

Your `package.json` should include:
```json
{
  "dependencies": {
    "whop-sdk-ts": "^latest",
    "ws": "^8.x.x",
    "@supabase/supabase-js": "^2.x.x",
    "@upstash/redis": "^1.x.x"
  }
}
```

---

## 🧪 Step 7: Testing Checklist

### Unit Tests
- [ ] Whop SDK client initializes
- [ ] Bot user ID is configured
- [ ] WebSocket connects successfully
- [ ] Events are processed correctly
- [ ] XP is awarded within 2 seconds
- [ ] Rewards are delivered via SDK

### Integration Tests
- [ ] User sends message → XP awarded
- [ ] User posts in forum → XP awarded
- [ ] User reacts → XP awarded (if polling enabled)
- [ ] User levels up → Reward delivered
- [ ] User receives push notification

### End-to-End Tests
- [ ] New user joins → Account created
- [ ] User participates → XP accumulates
- [ ] User reaches level 5 → 3 free days added
- [ ] User reaches level 100 → Promo code created
- [ ] Leaderboard updates in real-time
- [ ] Rank card shows live progress

---

## 🚨 Troubleshooting

### WebSocket Not Connecting

**Symptoms:**
- No "Connected to Whop WebSocket" message
- Events not being received

**Solutions:**
1. Verify `WHOP_BOT_TOKEN` is correct
2. Check bot user has OAuth token
3. Ensure bot is added to communities
4. Check firewall/network settings

### Rewards Not Delivering

**Symptoms:**
- Level-up occurs but no free days added
- No promo code created

**Solutions:**
1. Verify `WHOP_API_KEY` has correct permissions
2. Check user has active membership
3. Review Whop API logs in dashboard
4. Ensure SDK methods are called correctly

### XP Not Awarding

**Symptoms:**
- User activities not triggering XP
- Database not updating

**Solutions:**
1. Check WebSocket connection status
2. Verify cooldown isn't blocking
3. Check Redis connection
4. Review event processing logs

---

## 📊 Verification Checklist

Before considering setup complete:

- [ ] `whop-sdk-ts` package installed
- [ ] Bot user created and ID obtained
- [ ] Bot OAuth token generated
- [ ] All environment variables configured
- [ ] WebSocket connects successfully
- [ ] Events are received and processed
- [ ] XP is awarded within 1-2 seconds
- [ ] Rewards are delivered automatically
- [ ] Push notifications are sent
- [ ] Webhooks are configured
- [ ] All tests passing

---

## 🎯 Success Criteria

**You'll know the integration is working when:**

1. ✅ Console shows: "Connected to Whop WebSocket"
2. ✅ User sends message → XP awarded in < 2 seconds
3. ✅ User levels up → Free days added automatically
4. ✅ User receives push notification
5. ✅ Leaderboard updates in real-time
6. ✅ No errors in Sentry

---

## 📚 Additional Resources

- **Whop SDK Documentation:** https://github.com/whopio/whop-sdk-ts
- **Whop API Reference:** https://dev.whop.com/api-reference
- **WebSocket Guide:** https://dev.whop.com/websockets
- **Bot User Guide:** See `UNDERSTANDING_BOTUSER.MD`
- **Architecture:** See `Docs/05_ARCHITECTURE.MD`

---

## 🆘 Need Help?

If you encounter issues:

1. Check the documentation in `C:\Users\Administrator\WEE5\Docs`
2. Review `DOCUMENTATION_VS_PRODUCT_REPORT.md` for known gaps
3. Check Whop developer documentation
4. Review error logs in Sentry
5. Test with Whop's sandbox environment first

---

**Setup Status:** 🔴 NOT COMPLETE  
**Next Step:** Install `whop-sdk-ts` package  
**Estimated Time Remaining:** 2-3 hours

Once complete, the app will be a true Whop-native product with real-time XP awarding! 🚀
