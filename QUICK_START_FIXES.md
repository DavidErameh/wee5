# WEE5 - Quick Start Fixes

**URGENT:** These fixes must be completed before any testing or deployment.

---

## 🔴 CRITICAL FIX #1: Level Constraint Bug (15 minutes)

### Problem
New users cannot be created - database constraint violation.

### Fix

**File:** `lib/xp-logic.ts`

**Line 48-56, change:**
```typescript
// ❌ BEFORE (BROKEN)
const { data: newUser, error: createError } = await supabaseAdmin()
  .from('users')
  .insert({
    user_id: userId,
    experience_id: experienceId,
    xp: xpToAward,
    level: 0, // ❌ VIOLATES CHECK (level >= 1)
    tier: 'free',
    [`total_${activityType}s`]: 1,
  })
```

```typescript
// ✅ AFTER (FIXED)
const { data: newUser, error: createError } = await supabaseAdmin()
  .from('users')
  .insert({
    user_id: userId,
    experience_id: experienceId,
    xp: xpToAward,
    level: 1, // ✅ FIXED - Starts at level 1
    tier: 'free',
    [`total_${activityType}s`]: 1,
  })
```

**Also update line 129:**
```typescript
// ❌ BEFORE
export function calculateLevel(xp: number): number {
  if (xp < 0) return 0; // ❌ Returns 0

// ✅ AFTER
export function calculateLevel(xp: number): number {
  if (xp < 0) return 1; // ✅ Returns 1 (minimum level)
```

**And line 132:**
```typescript
// ❌ BEFORE
let level = 0;

// ✅ AFTER
let level = 1; // Start from level 1
```

### Test
```bash
# Create a test user and verify it works
curl -X POST http://localhost:3000/api/xp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "experienceId": "test_exp_456",
    "activityType": "message"
  }'
```

---

## 🔴 CRITICAL FIX #2: Environment Variables (10 minutes)

### Problem
Missing critical environment variables for webhooks and real-time features.

### Fix

**File:** `.env.local`

Add these lines:
```env
# Webhook Secret (get from Whop Developer Dashboard)
WHOP_WEBHOOK_SECRET=your_webhook_secret_here

# Bot User ID (create a bot user in Whop)
WHOP_BOT_USER_ID=user_your_bot_id_here

# Fix Sentry DSN (get complete DSN from Sentry dashboard)
SENTRY_DSN=https://your_key@your_org.ingest.sentry.io/your_project_id
NEXT_PUBLIC_SENTRY_DSN=https://your_key@your_org.ingest.sentry.io/your_project_id

# Fix undefined value
NEXT_PUBLIC_WHOP_AGENT_USER_ID=user_VZ0vdR3SA7Uuv
```

**REMOVE this line (security risk):**
```env
# ❌ DELETE THIS - Should only be server-side
SUPABASE_SERVICE_ROLE_KEY=...
```

### How to Get Values

1. **WHOP_WEBHOOK_SECRET:**
   - Go to https://whop.com/apps/developer
   - Select your app
   - Go to Webhooks section
   - Copy the webhook secret

2. **WHOP_BOT_USER_ID:**
   - Create a new user account in Whop
   - This will be your "bot" user
   - Copy the user ID (starts with `user_`)

3. **SENTRY_DSN:**
   - Go to https://sentry.io
   - Select your project
   - Go to Settings > Client Keys (DSN)
   - Copy the complete DSN

---

## 🔴 CRITICAL FIX #3: Duplicate Migration (5 minutes)

### Problem
Two migration files with the same content will cause migration failures.

### Fix

**Delete this file:**
```bash
rm supabase/migrations/20251101000002_add_tier_to_users.sql
```

**Keep this file:**
```
supabase/migrations/20251101000001_add_tier_to_users.sql
```

### Verify
```bash
# List migrations
ls -la supabase/migrations/

# Should see:
# 20251101000000_initial_schema.sql
# 20251101000001_add_tier_to_users.sql
# 20251101000003_add_enterprise_tables.sql
# 20251101000004_add_api_keys_table.sql
# 20251101000005_add_badges_tables.sql
```

---

## 🔴 CRITICAL FIX #4: Test Framework (10 minutes)

### Problem
Tests import from `vitest` but project uses `jest`.

### Fix

**File:** `tests/xp-logic.test.ts`

**Line 1, change:**
```typescript
// ❌ BEFORE
import { describe, test, expect, beforeEach, vi, MockedFunction } from 'vitest';

// ✅ AFTER
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
```

**Replace all `vi.` with `jest.`:**
```typescript
// ❌ BEFORE
vi.mock('@/lib/db', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({

// ✅ AFTER
jest.mock('@/lib/db', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
```

### Test
```bash
pnpm test
# Should run without errors
```

---

## 🔴 CRITICAL FIX #5: Missing Dependency (2 minutes)

### Problem
`lucide-react` is imported but not installed.

### Fix

```bash
pnpm add lucide-react
```

### Verify
```bash
# Check it's in package.json
grep "lucide-react" package.json
```

---

## 🟠 HIGH PRIORITY FIX #1: Webhook Route (5 minutes)

### Problem
Confusion between `/api/webhook` and `/api/webhooks`.

### Fix

1. **Confirm the correct path:**
   - Current: `/api/webhook/route.ts` ✅
   - Old: `/api/webhooks/route.ts` (deleted)

2. **Update Whop webhook configuration:**
   - Go to Whop Developer Dashboard
   - Set webhook URL to: `https://yourdomain.com/api/webhook`

3. **Update README if needed:**
   - Search for "webhooks" (plural)
   - Replace with "webhook" (singular)

---

## 🟠 HIGH PRIORITY FIX #2: Add Missing Table (10 minutes)

### Problem
XP configuration feature needs a database table.

### Fix

**Create file:** `supabase/migrations/20251101000006_add_xp_configurations.sql`

```sql
CREATE TABLE xp_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id TEXT NOT NULL UNIQUE,
  xp_per_message INTEGER CHECK (xp_per_message > 0 AND xp_per_message <= 1000),
  min_xp_per_post INTEGER CHECK (min_xp_per_post > 0 AND min_xp_per_post <= 1000),
  max_xp_per_post INTEGER CHECK (max_xp_per_post > 0 AND max_xp_per_post <= 1000),
  xp_per_reaction INTEGER CHECK (xp_per_reaction > 0 AND xp_per_reaction <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CHECK (max_xp_per_post >= min_xp_per_post)
);

CREATE INDEX idx_xp_config_experience ON xp_configurations(experience_id);

-- Enable RLS
ALTER TABLE xp_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access" ON xp_configurations
  FOR SELECT USING (true);

CREATE POLICY "Allow service role full access" ON xp_configurations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
```

### Apply Migration
```bash
# If using Supabase CLI
supabase db push

# Or run the SQL directly in Supabase dashboard
```

---

## ✅ Verification Checklist

After completing all fixes, verify:

- [ ] New users can be created without errors
- [ ] Environment variables are set correctly
- [ ] No duplicate migrations exist
- [ ] Tests run successfully
- [ ] lucide-react is installed
- [ ] Webhook URL is configured in Whop
- [ ] XP configurations table exists
- [ ] Service role key is NOT in .env.local

---

## 🧪 Quick Test Script

Run this to verify core functionality:

```bash
# 1. Start dev server
pnpm dev

# 2. In another terminal, test XP awarding
curl -X POST http://localhost:3000/api/xp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "experienceId": "test_exp_456",
    "activityType": "message"
  }'

# Expected response:
# {
#   "success": true,
#   "xpAwarded": 20,
#   "newTotalXp": 20,
#   "leveledUp": false
# }

# 3. Test leaderboard
curl "http://localhost:3000/api/leaderboard?experienceId=test_exp_456"

# Expected response:
# {
#   "leaderboard": [
#     {
#       "rank": 1,
#       "user_id": "test_user_123",
#       "xp": 20,
#       "level": 1,
#       ...
#     }
#   ]
# }

# 4. Run tests
pnpm test

# Expected: All tests pass
```

---

## 🚨 If Something Goes Wrong

### Database Issues
```bash
# Reset database (CAUTION: Deletes all data)
supabase db reset

# Or manually drop and recreate tables in Supabase dashboard
```

### Environment Issues
```bash
# Verify environment variables are loaded
pnpm dev
# Check console for any "undefined" warnings
```

### Dependency Issues
```bash
# Clear and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

---

## ⏱️ Total Time Estimate

- Critical Fix #1 (Level Bug): 15 min
- Critical Fix #2 (Env Vars): 10 min
- Critical Fix #3 (Migration): 5 min
- Critical Fix #4 (Tests): 10 min
- Critical Fix #5 (Dependency): 2 min
- High Priority #1 (Webhook): 5 min
- High Priority #2 (Table): 10 min
- Verification: 10 min

**Total: ~67 minutes (1 hour 7 minutes)**

---

## 📞 Need Help?

If you encounter issues:

1. Check the full DIAGNOSTIC_REPORT.md for detailed explanations
2. Review IMPLEMENTATION_PLAN.md for the complete roadmap
3. Check Supabase logs for database errors
4. Check Vercel logs for deployment errors
5. Check Sentry for runtime errors

---

**Last Updated:** January 2025  
**Priority:** URGENT - Complete before any other work
