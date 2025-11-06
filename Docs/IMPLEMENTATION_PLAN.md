# WEE5 - Implementation Plan & Spec Map

**Project:** WEE5 - Community Gamification App for Whop  
**Version:** 0.2.0  
**Status:** In Development  
**Target Completion:** 4 weeks

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Specification](#architecture-specification)
3. [Feature Specification Map](#feature-specification-map)
4. [Phase-by-Phase Implementation](#phase-by-phase-implementation)
5. [Technical Specifications](#technical-specifications)
6. [API Specification](#api-specification)
7. [Database Specification](#database-specification)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Plan](#deployment-plan)

---

## 🎯 Project Overview

### Product Vision
WEE5 is a comprehensive gamification platform for Whop communities that increases engagement through XP, levels, and rewards - inspired by Discord's MEE6 bot.

### Core Value Propositions
1. **For Community Members:** Engaging progression system with tangible rewards
2. **For Community Owners:** Increased retention and engagement metrics
3. **For Premium Users:** Customizable XP rates and detailed analytics
4. **For Enterprise:** Multi-community management and advanced features

### Success Metrics
- User engagement increase: 40%+
- Daily active users: 60%+
- Premium conversion: 5%+
- Enterprise adoption: 10+ communities

---

## 🏗️ Architecture Specification

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │   React 19   │  │  Frosted-UI  │      │
│  │   App Router │  │  Components  │  │   Library    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │    XP    │ │Leaderboard│ │ Webhooks │ │ Commands │       │
│  │   API    │ │    API    │ │   API    │ │   API    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │Analytics │ │Enterprise │ │ Checkout │                    │
│  │   API    │ │    API    │ │   API    │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ XP Logic │ │  Rewards │ │   Auth   │ │Rate Limit│       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │  Event   │ │ Whop SDK │ │  Level   │                    │
│  │Processor │ │Integration│ │  Utils   │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │    Supabase      │  │  Upstash Redis   │                │
│  │   PostgreSQL     │  │   (Caching &     │                │
│  │  (Primary DB)    │  │   Cooldowns)     │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   Whop   │ │  Sentry  │ │  Vercel  │ │  Stripe  │       │
│  │   API    │ │ Monitoring│ │ Hosting  │ │ Payments │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Event Flow Architecture

```
User Activity (Whop)
        ↓
Whop Webhook → Signature Verification
        ↓
Event Processor → Cooldown Check (Redis)
        ↓
XP Logic → Calculate & Award XP
        ↓
Database Update (Supabase)
        ↓
Level Check → Reward System (if level up)
        ↓
Real-time Update (Supabase Subscriptions)
        ↓
UI Update (React Components)
```

---

## 🗺️ Feature Specification Map

### Feature Matrix

| Feature | Free | Premium | Enterprise | Status | Priority |
|---------|------|---------|------------|--------|----------|
| **Core Features** |
| XP for Messages | ✅ | ✅ | ✅ | 90% | P0 |
| XP for Posts | ✅ | ✅ | ✅ | 90% | P0 |
| XP for Reactions | ✅ | ✅ | ✅ | 90% | P0 |
| Leveling System | ✅ | ✅ | ✅ | 85% | P0 |
| Leaderboard | ✅ | ✅ | ✅ | 95% | P0 |
| Rank Cards | ✅ | ✅ | ✅ | 95% | P0 |
| Anti-Spam (60s cooldown) | ✅ | ✅ | ✅ | 100% | P0 |
| Level-up Rewards | ✅ | ✅ | ✅ | 60% | P0 |

| **Premium Features** |
| Custom XP Rates | ❌ | ✅ | ✅ | 50% | P1 |
| Engagement Analytics | ❌ | ✅ | ✅ | 80% | P1 |
| Custom Badges | ❌ | ✅ | ✅ | 40% | P2 |
| Enhanced Anti-Cheat | ❌ | ✅ | ✅ | 0% | P2 |
| Priority Support | ❌ | ✅ | ✅ | N/A | P3 |
| **Enterprise Features** |
| Multi-Community Dashboard | ❌ | ❌ | ✅ | 60% | P2 |
| Cross-Community Analytics | ❌ | ❌ | ✅ | 70% | P2 |
| API Access | ❌ | ❌ | ✅ | 40% | P2 |
| Custom Integrations | ❌ | ❌ | ✅ | 0% | P3 |
| Dedicated Support | ❌ | ❌ | ✅ | N/A | P3 |
| Bulk Operations | ❌ | ❌ | ✅ | 0% | P3 |
| **Admin Features** |
| User Management | ❌ | ✅ | ✅ | 0% | P2 |
| Manual XP Adjustment | ❌ | ✅ | ✅ | 0% | P2 |
| Badge Management | ❌ | ✅ | ✅ | 30% | P2 |
| Moderation Tools | ❌ | ✅ | ✅ | 0% | P3 |

**Priority Levels:**
- P0: Critical - Must have for MVP
- P1: High - Important for launch
- P2: Medium - Nice to have for launch
- P3: Low - Post-launch features

---

## 📅 Phase-by-Phase Implementation

### PHASE 1: Critical Fixes & Stability (Week 1)
**Goal:** Fix all blocking issues and ensure core functionality works

#### Day 1-2: Database & Environment
- [ ] **Fix level constraint bug**
  - Update `lib/xp-logic.ts` line 48: Change `level: 0` to `level: 1`
  - Update `calculateLevel()` function to return minimum level 1
  - Update all level calculations
  - Test with new user creation
  
- [ ] **Remove duplicate migration**
  - Delete `supabase/migrations/20251101000002_add_tier_to_users.sql`
  - Verify migration sequence
  - Test migrations on clean database
  
- [ ] **Configure environment variables**
  - Obtain `WHOP_WEBHOOK_SECRET` from Whop dashboard
  - Create bot user and get `WHOP_BOT_USER_ID`
  - Get complete Sentry DSN
  - Update `.env.development` and `.env.local`
  - Document all required env vars

#### Day 3-4: Security & Dependencies
- [ ] **Secure service role key**
  - Remove `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`
  - Ensure it's only in server-side `.env`
  - Rotate key if exposed in git
  - Update `.gitignore`
  
- [ ] **Fix test framework**
  - Convert test files from vitest to Jest
  - Update imports in `tests/xp-logic.test.ts`
  - Run test suite and verify all pass
  - Add test script to package.json
  
- [ ] **Add missing dependencies**
  ```bash
  pnpm add lucide-react
  ```
  - Verify all imports work
  - Test Leaderboard component

#### Day 5: Webhook & Core Testing
- [ ] **Clarify webhook route**
  - Confirm `/api/webhook` is the correct path
  - Update Whop webhook configuration
  - Update README
  - Test webhook signature verification
  
- [ ] **End-to-end testing**
  - Test new user creation
  - Test XP awarding
  - Test level progression
  - Test leaderboard updates
  - Test webhook processing

**Deliverables:**
- ✅ All critical bugs fixed
- ✅ Environment properly configured
- ✅ Tests passing
- ✅ Core XP system working

---

### PHASE 2: Core Functionality (Week 2)
**Goal:** Complete core features and real-time functionality

#### Day 1-2: Real-time Architecture
- [ ] **Redesign real-time system**
  - Remove WebSocket-based approach
  - Implement webhook-only event processing
  - Update event processor for webhook events
  - Test with Whop webhook events
  
- [ ] **Implement NotificationContext**
  - Create toast notification system
  - Add to Providers.tsx
  - Test in all components using it
  - Add notification UI component

#### Day 3-4: XP Configuration & Rewards
- [ ] **Create XP configuration table**
  - Add migration for `xp_configurations` table
  - Implement GET endpoint logic
  - Implement POST endpoint logic
  - Test XP configuration UI
  
- [ ] **Complete reward implementation**
  - Implement Whop API integration for free days
  - Implement promo code creation
  - Add error handling and retry logic
  - Test reward application
  - Add reward notification

#### Day 5: UI Customization
- [ ] **Customize root page**
  - Design WEE5 landing page
  - Add features section
  - Add pricing information
  - Add call-to-action buttons

**Deliverables:**
- ✅ Real-time events working via webhooks
- ✅ XP configuration functional
- ✅ Rewards being applied

---

### PHASE 3: Premium Features (Week 3)
**Goal:** Complete premium and enterprise features

#### Day 1-2: Badge System
- [ ] **Complete badge management**
  - Create badge management UI
  - Implement badge creation form
  - Implement badge assignment
  - Add badge display to rank cards
  - Test badge system end-to-end
  
- [ ] **Badge API endpoints**
  - Complete `/api/enterprise/badges` endpoints
  - Add badge validation
  - Add image upload for badges
  - Test API endpoints

#### Day 3-4: Admin Tools
- [ ] **User management dashboard**
  - Create admin page
  - Add user search/filter
  - Add user details view
  - Add manual XP adjustment
  - Add ban/unban functionality
  
- [ ] **Analytics improvements**
  - Add caching to analytics queries
  - Optimize N+1 queries
  - Add more metrics
  - Improve visualizations

#### Day 5: Performance & Optimization
- [ ] **Implement pagination**
  - Add cursor-based pagination to leaderboard
  - Add "Load More" functionality
  - Optimize queries
  - Test with large datasets
  
- [ ] **Data retention**
  - Implement activity log archival
  - Add cron job for cleanup
  - Test data retention policy

**Deliverables:**
- ✅ Badge system complete
- ✅ Admin tools functional
- ✅ Performance optimized
- ✅ Premium features ready

---

### PHASE 4: Polish & Security (Week 4)
**Goal:** Production readiness and security hardening

#### Day 1-2: Security
- [ ] **Implement CSRF protection**
  - Add CSRF tokens
  - Configure SameSite cookies
  - Test CSRF protection
  
- [ ] **Add request limits**
  - Implement request size limits
  - Add timeout configurations
  - Test with large payloads
  
- [ ] **Security audit**
  - Review all API endpoints
  - Check authentication on all routes
  - Verify RLS policies
  - Test rate limiting

#### Day 3-4: Documentation & Testing
- [ ] **API documentation**
  - Add OpenAPI/Swagger spec
  - Document all endpoints
  - Add example requests/responses
  - Generate API docs
  
- [ ] **Increase test coverage**
  - Add API endpoint tests
  - Add component tests
  - Add integration tests
  - Target 80% coverage

#### Day 5: Deployment Preparation
- [ ] **Backup functionality**
  - Implement data export
  - Add backup scheduling
  - Document restore process
  - Test backup/restore
  
- [ ] **Final QA**
  - Full regression testing
  - Performance testing
  - Load testing
  - User acceptance testing

**Deliverables:**
- ✅ Security hardened
- ✅ Documentation complete
- ✅ Test coverage 80%+
- ✅ Production ready

---

## 🔧 Technical Specifications

### Technology Stack

#### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Component Library:** Frosted-UI v0.0.1-canary.85
- **Styling:** Tailwind CSS 4.1.16
- **State Management:** React Query (TanStack Query) 5.90.5
- **Icons:** Lucide React

#### Backend
- **Runtime:** Node.js 20+
- **Framework:** Next.js API Routes
- **Language:** TypeScript 5.9.3
- **Validation:** Zod 4.1.12
- **Authentication:** Whop SDK

#### Database & Caching
- **Primary Database:** Supabase (PostgreSQL)
- **Caching:** Upstash Redis
- **ORM:** Supabase Client 2.78.0

#### External Services
- **Platform:** Whop API
- **Monitoring:** Sentry 10.22.0
- **Hosting:** Vercel
- **Payments:** Stripe (via Whop)

#### Development Tools
- **Package Manager:** pnpm 9.15.9
- **Linter:** Biome 2.2.6
- **Testing:** Jest 30.2.0 + React Testing Library
- **Type Checking:** TypeScript strict mode

### Performance Requirements

| Metric | Target | Critical |
|--------|--------|----------|
| API Response Time | < 200ms | < 500ms |
| Page Load Time | < 2s | < 4s |
| Time to Interactive | < 3s | < 5s |
| Database Query Time | < 100ms | < 300ms |
| Cache Hit Rate | > 80% | > 60% |
| Uptime | > 99.9% | > 99% |

### Scalability Targets

| Metric | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|
| Concurrent Users | 1,000 | 10,000 | 100,000 |
| Communities | 100 | 1,000 | 10,000 |
| Daily XP Awards | 100K | 1M | 10M |
| Database Size | 1GB | 10GB | 100GB |

---

## 📡 API Specification

### Core Endpoints

#### POST /api/xp
Award XP to a user for an activity.

**Request:**
```json
{
  "userId": "user_abc123",
  "experienceId": "exp_xyz789",
  "activityType": "message" | "post" | "reaction"
}
```

**Response:**
```json
{
  "success": true,
  "xpAwarded": 20,
  "newTotalXp": 520,
  "leveledUp": true,
  "oldLevel": 4,
  "newLevel": 5,
  "reward": {
    "type": "free_membership_days",
    "value": 3
  }
}
```

**Rate Limit:** 5 requests/minute per user  
**Authentication:** Required

---

#### GET /api/leaderboard
Fetch community leaderboard.

**Query Parameters:**
- `experienceId` (required): Community ID
- `filter`: "all-time" | "week" | "month" (default: "all-time")
- `limit`: 1-1000 (default: 100)

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "user_abc123",
      "xp": 5420,
      "level": 12,
      "total_messages": 150,
      "total_posts": 45,
      "total_reactions": 230
    }
  ],
  "cached": false
}
```

**Rate Limit:** 20 requests/minute  
**Authentication:** Optional

---

#### POST /api/webhook
Process Whop webhook events.

**Headers:**
- `x-whop-signature`: Webhook signature
- `x-whop-timestamp`: Request timestamp

**Request:**
```json
{
  "action": "message.created" | "post.created" | "reaction.created" | "membership.created",
  "data": {
    "user_id": "user_abc123",
    "experience_id": "exp_xyz789",
    "content": "Message content",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "received": true
}
```

**Rate Limit:** 10 requests/minute per IP  
**Authentication:** Signature verification

---

### Premium Endpoints

#### GET /api/xp-config
Get XP configuration for a community.

**Query Parameters:**
- `experienceId` (required): Community ID

**Response:**
```json
{
  "config": {
    "xp_per_message": 25,
    "min_xp_per_post": 20,
    "max_xp_per_post": 35,
    "xp_per_reaction": 8
  }
}
```

**Rate Limit:** 10 requests/minute  
**Authentication:** Required (Premium tier)

---

#### POST /api/xp-config
Update XP configuration.

**Request:**
```json
{
  "experienceId": "exp_xyz789",
  "config": {
    "xp_per_message": 25,
    "min_xp_per_post": 20,
    "max_xp_per_post": 35,
    "xp_per_reaction": 8
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "XP configuration updated successfully"
}
```

**Rate Limit:** 5 requests/minute  
**Authentication:** Required (Premium tier)

---

#### GET /api/analytics
Get engagement analytics.

**Query Parameters:**
- `experienceId` (required): Community ID
- `timeframe`: "24h" | "7d" | "30d" | "90d" (default: "7d")

**Response:**
```json
{
  "analytics": {
    "period": {
      "start": "2025-01-08T00:00:00Z",
      "end": "2025-01-15T00:00:00Z",
      "timeframe": "7d"
    },
    "engagement": {
      "totalActivities": 1250,
      "activeUsers": 85,
      "avgXpPerUser": 420,
      "activityByType": {
        "message": 800,
        "post": 300,
        "reaction": 150
      },
      "xpByDay": {
        "2025-01-08": 2500,
        "2025-01-09": 3200
      }
    },
    "leaderboard": [...]
  }
}
```

**Rate Limit:** 10 requests/minute  
**Authentication:** Required (Premium tier)

---

### Enterprise Endpoints

#### GET /api/enterprise
List enterprise communities.

**Query Parameters:**
- `userId` (required): User ID

**Response:**
```json
{
  "communities": [
    {
      "id": "exp_xyz789",
      "name": "Community Name"
    }
  ],
  "total": 5
}
```

**Rate Limit:** 10 requests/minute  
**Authentication:** Required (Enterprise tier)

---

#### POST /api/enterprise
Enterprise operations.

**Request:**
```json
{
  "action": "cross_community_analytics" | "create_custom_badge" | "get_custom_badges",
  "communityId": "exp_xyz789",
  "data": {
    // Action-specific data
  }
}
```

**Response:**
```json
{
  // Action-specific response
}
```

**Rate Limit:** 5 requests/minute  
**Authentication:** Required (Enterprise tier)

---

## 🗄️ Database Specification

### Schema Overview

```sql
-- Core Tables
users                    -- User XP/level tracking
rewards                  -- Earned rewards
activity_log             -- Activity history
xp_configurations        -- Custom XP rates (Premium)

-- Enterprise Tables
enterprises              -- Enterprise accounts
enterprise_companies     -- Multi-community mapping
badges                   -- Custom badges
user_badges              -- Badge assignments
api_keys                 -- API access keys
```

### Table: users

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  experience_id TEXT NOT NULL,
  xp INTEGER DEFAULT 0 NOT NULL CHECK (xp >= 0),
  level INTEGER DEFAULT 1 NOT NULL CHECK (level >= 1),
  tier TEXT DEFAULT 'free' NOT NULL CHECK (tier IN ('free', 'premium', 'enterprise')),
  total_messages INTEGER DEFAULT 0 NOT NULL CHECK (total_messages >= 0),
  total_posts INTEGER DEFAULT 0 NOT NULL CHECK (total_posts >= 0),
  total_reactions INTEGER DEFAULT 0 NOT NULL CHECK (total_reactions >= 0),
  last_activity_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, experience_id)
);

-- Indexes
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_experience_id ON users(experience_id);
CREATE INDEX idx_users_xp_desc ON users(xp DESC);
CREATE INDEX idx_users_experience_xp ON users(experience_id, xp DESC);
CREATE INDEX idx_users_last_activity ON users(last_activity_at DESC);
CREATE INDEX idx_users_tier ON users(tier);
```

**Estimated Size:**
- 10,000 users: ~2 MB
- 100,000 users: ~20 MB
- 1,000,000 users: ~200 MB

---

### Table: xp_configurations

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
```

---

### Table: badges

```sql
CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  criteria JSONB, -- Criteria for earning the badge
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_badges_experience ON badges(experience_id);
CREATE INDEX idx_badges_created_by ON badges(created_by);
```

---

### Table: user_badges

```sql
CREATE TABLE user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  experience_id TEXT NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  awarded_by TEXT,
  UNIQUE(user_id, badge_id, experience_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX idx_user_badges_experience ON user_badges(experience_id);
```

---

### Data Retention Policy

| Table | Retention | Archive Strategy |
|-------|-----------|------------------|
| users | Permanent | N/A |
| rewards | Permanent | N/A |
| activity_log | 90 days | Archive to cold storage |
| xp_configurations | Permanent | N/A |
| badges | Permanent | Soft delete |
| user_badges | Permanent | N/A |

---

## 🧪 Testing Strategy

### Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Unit Tests | 80% | 20% |
| Integration Tests | 70% | 0% |
| E2E Tests | 50% | 0% |
| API Tests | 90% | 0% |

### Test Plan

#### Unit Tests
```typescript
// XP Logic Tests
- calculateLevel() with various XP values
- xpForLevel() accuracy
- xpForNextLevel() calculations
- calculateProgress() percentages
- awardXP() with cooldowns
- awardXP() with level-ups

// Reward System Tests
- getRewardForLevel() for all milestones
- handleLevelUp() reward application
- hasPremiumAccess() tier checking

// Level Utils Tests
- getXPForNextLevel() formula
- Level progression accuracy
```

#### Integration Tests
```typescript
// XP Award Flow
- User creates account → earns XP → levels up → receives reward

// Leaderboard Updates
- Multiple users earn XP → leaderboard updates correctly

// Premium Features
- User upgrades → can configure XP → changes apply

// Webhook Processing
- Webhook received → signature verified → XP awarded
```

#### E2E Tests
```typescript
// User Journey
1. New user joins community
2. Posts message → earns XP
3. Checks /mylevel → sees progress
4. Checks /leaderboard → sees ranking
5. Levels up → receives notification
6. Reaches level 5 → receives reward

// Admin Journey
1. Admin logs in
2. Configures XP rates
3. Creates custom badge
4. Awards badge to user
5. Views analytics
```

#### API Tests
```typescript
// For each endpoint:
- Valid request → success response
- Invalid request → error response
- Missing auth → 401 error
- Rate limit exceeded → 429 error
- Database error → 500 error
```

### Testing Tools

```json
{
  "unit": "Jest + React Testing Library",
  "integration": "Jest + Supertest",
  "e2e": "Playwright",
  "api": "Postman/Newman",
  "load": "k6",
  "security": "OWASP ZAP"
}
```

---

## 🚀 Deployment Plan

### Environments

#### Development
- **URL:** http://localhost:3000
- **Database:** Local Supabase
- **Redis:** Local Redis
- **Purpose:** Local development

#### Staging
- **URL:** https://wee5-staging.vercel.app
- **Database:** Supabase staging project
- **Redis:** Upstash staging instance
- **Purpose:** QA and testing

#### Production
- **URL:** https://wee5.app (or Whop subdomain)
- **Database:** Supabase production project
- **Redis:** Upstash production instance
- **Purpose:** Live users

### Deployment Checklist

#### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Performance testing completed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Backup strategy in place

#### Deployment Steps
1. **Database Migration**
   ```bash
   # Run migrations on production database
   supabase db push --db-url $PRODUCTION_DB_URL
   ```

2. **Deploy to Vercel**
   ```bash
   # Deploy to production
   vercel --prod
   ```

3. **Verify Deployment**
   - Check health endpoints
   - Test critical user flows
   - Monitor error rates
   - Check performance metrics

4. **Post-Deployment**
   - Monitor Sentry for errors
   - Check database performance
   - Verify webhook processing
   - Monitor user feedback

### Rollback Plan

If critical issues are detected:

1. **Immediate Rollback**
   ```bash
   vercel rollback
   ```

2. **Database Rollback**
   - Restore from backup if needed
   - Revert migrations if necessary

3. **Communication**
   - Notify users of issues
   - Provide status updates
   - Document incident

### Monitoring

#### Metrics to Monitor
- API response times
- Error rates
- Database query performance
- Cache hit rates
- User activity
- XP awards per minute
- Level-ups per hour

#### Alerts
- Error rate > 1%
- API response time > 500ms
- Database CPU > 80%
- Redis memory > 90%
- Webhook failures > 5%

---

## 📊 Success Criteria

### Phase 1 Success
- ✅ All critical bugs fixed
- ✅ Core XP system working
- ✅ Tests passing
- ✅ No production blockers

### Phase 2 Success
- ✅ Webhooks processing events
- ✅ XP configuration working
- ✅ Rewards being applied

### Phase 3 Success
- ✅ Premium features complete
- ✅ Badge system working
- ✅ Admin tools functional
- ✅ Performance optimized

### Phase 4 Success
- ✅ Security hardened
- ✅ Documentation complete
- ✅ Test coverage 80%+
- ✅ Production deployed

### Overall Success
- ✅ 100+ communities using WEE5
- ✅ 10,000+ active users
- ✅ 99.9% uptime
- ✅ < 200ms average response time
- ✅ 5%+ premium conversion
- ✅ Positive user feedback

---

**Plan Version:** 1.0  
**Last Updated:** January 2025  
**Next Review:** After Phase 1 completion
