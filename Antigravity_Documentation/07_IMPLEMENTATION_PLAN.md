# WEE5 Implementation & Remediation Plan

## Executive Summary
The current state of the WEE5 application, as detailed in the `full_production_report.md`, contains 35 issues, including 13 critical vulnerabilities and functional gaps. The application is currently **unsafe for production** due to authentication bypasses, exposed credentials, and missing core logic.

This plan outlines a 4-phase approach to remediate these issues, prioritizing security and data integrity, followed by core functionality, and finally frontend stability and performance.

## Phase 1: Security & Critical Infrastructure (Priority: Immediate)
**Objective**: Secure the application against data breaches, unauthorized access, and exploitation.

### 1.1 Secure Database Access
- **Issue**: Service role key exposed in client-side code (`lib/db.ts`).
- **Action**: Refactor `db.ts` to separate client (anon key) and server (service role key) initialization. Ensure no client-side code imports the service key.

### 1.2 Fix Authentication Bypasses
- **Issue**: `POST /api/xp` allows anyone to award XP.
- **Action**: Implement strict `requireAuth()` checks at the start of the route handler.
- **Issue**: Webhook signature verification is vulnerable to timing attacks.
- **Action**: Update `lib/webhook-security.ts` to use `crypto.timingSafeEqual`.
- **Issue**: `x-whop-user-id` header is trusted without validation.
- **Action**: Implement server-side validation of the user identity using Whop API or signed tokens.

### 1.3 Fix Race Conditions & Logic Errors
- **Issue**: Race condition in XP awarding allows double XP.
- **Action**: Implement distributed locking in `app/api/xp/route.ts` using Redis.
- **Issue**: Inverted rate limiting logic (`!isRateLimited`).
- **Action**: Correct the boolean logic to block requests when `isRateLimited` is true.

### 1.4 Database Security
- **Issue**: RLS policies are too permissive.
- **Action**: Update `supabase/migrations` to restrict Service Role access and implement proper user-scoped policies.

## Phase 2: Core Functionality & Missing Implementations (Priority: High)
**Objective**: Ensure the backend logic works as documented and missing files are created.

### 2.1 Implement Missing Core Files
- **Issue**: `lib/whop-websocket.ts` and `lib/whop-sdk.ts` are missing but referenced.
- **Action**: Create these files with the required implementation for real-time events and Whop API integration.
- **Issue**: `/app/api/leaderboard/route.ts` is missing.
- **Action**: Create the API endpoint with pagination and caching.

### 2.2 Fix XP & Leveling Logic
- **Issue**: Level calculation uses O(N) iteration and incorrect formula.
- **Action**: Refactor `lib/xp-logic.ts` to use the O(1) mathematical formula: `5 * N^2 + 50 * N + 100`.
- **Issue**: Asynchronous level-up processing fails silently.
- **Action**: Add try/catch blocks, error logging, and retry mechanisms for `handleLevelUp`.

### 2.3 Reward System Reliability
- **Issue**: No retry logic for Whop API calls.
- **Action**: Implement exponential backoff in `lib/rewards.ts`.

## Phase 3: Frontend Stability & Performance (Priority: Medium)
**Objective**: Prevent crashes and ensure a smooth user experience.

### 3.1 Error Boundaries & Safety
- **Issue**: Leaderboard crashes the entire page on error.
- **Action**: Wrap `LeaderboardTable` in a React Error Boundary.
- **Issue**: Missing root `error.tsx`.
- **Action**: Create `app/error.tsx` for global error handling.

### 3.2 Performance Optimization
- **Issue**: Leaderboard fetches all users at once.
- **Action**: Implement server-side pagination in `LeaderboardTable` and the API.
- **Issue**: Memory leaks in `RankCard` subscriptions.
- **Action**: Add cleanup functions to `useEffect` hooks in `RankCard.tsx`.

### 3.3 Data Integration
- **Issue**: Hardcoded user data in `NavigationBar`.
- **Action**: Connect `layout.tsx` to the real auth context.

## Phase 4: Operations & Polish (Priority: Low)
**Objective**: Prepare for deployment and long-term maintenance.

### 4.1 Database Optimization
- **Issue**: Missing indexes for performance.
- **Action**: Add BRIN indexes for timestamps and composite indexes for leaderboard queries.

### 4.2 Production Config
- **Issue**: Missing `next.config.ts`.
- **Action**: Create configuration with security headers and optimization settings.
- **Issue**: No build validation.
- **Action**: Add `validate:build` script to `package.json`.

## Execution Strategy
1.  **Stop Development**: Freeze feature work.
2.  **Security Sweep**: Execute Phase 1 immediately.
3.  **Core Repair**: Execute Phase 2 to get the backend functional.
4.  **Frontend Fix**: Execute Phase 3 to make the UI usable.
5.  **Final Audit**: Re-run the analysis to confirm all critical/high issues are resolved.
