# System Architecture

WEE5 is designed as an event-driven, real-time application that bridges the Whop platform with a gamified experience layer.

## High-Level Architecture

```mermaid
graph TD
    User[User on Whop] -->|Interacts| Whop[Whop Platform]
    Whop -->|Webhook| API[Next.js API Routes]
    API -->|Validate| Auth[Auth & Security]
    Auth -->|Check Cooldown| Redis[Upstash Redis]
    Redis -->|Process Event| Logic[XP Logic Service]
    Logic -->|Update Data| DB[Supabase (PostgreSQL)]
    DB -->|Realtime Event| Client[Client UI]
    Client -->|Subscribe| DB
```

## Directory Structure

- **`app/`**: Next.js App Router pages and API endpoints.
  - `api/`: Backend logic exposed as REST endpoints.
  - `dashboard/`: Community creator interface.
  - `experiences/`: Member-facing gamification interface.
- **`components/`**: Reusable UI building blocks.
- **`lib/`**: Core infrastructure code (DB connections, Redis client, Auth wrappers).
- **`services/`**: Business logic layer (XP calculations, Reward processing).
- **`supabase/`**: Database migrations and schema definitions.
- **`types/`**: TypeScript type definitions.

## Data Flow

1. **Activity Detection**:
   - A user performs an action on Whop (e.g., sends a message).
   - Whop sends a webhook to `https://[domain]/api/webhook`.

2. **Event Processing**:
   - **Validation**: The webhook signature is verified (`webhook-security.ts`).
   - **Rate Limiting**: Redis checks if the user is on cooldown for that activity type (`rate-limit.ts`).
   - **XP Calculation**: If valid, XP is calculated based on the community's configuration (`xp-logic.ts`).

3. **State Update**:
   - The user's XP and Level are updated in the `users` table in Supabase.
   - An entry is added to `activity_log`.
   - If a level threshold is crossed, `rewards.ts` processes any unlockables.

4. **Real-Time UI Update**:
   - Supabase detects the database change.
   - A real-time event is broadcast to subscribed clients.
   - The user's browser updates the Rank Card and Leaderboard instantly.

## Database Schema (Supabase)

### `users`
- `id`: Unique identifier (Whop User ID).
- `community_id`: Whop Company ID.
- `xp`: Total experience points.
- `level`: Current level.
- `last_active`: Timestamp of last activity.

### `xp_configurations`
- `community_id`: Foreign key.
- `chat_xp`: XP per message.
- `reply_xp`: XP per reply.
- `reaction_xp`: XP per reaction.
- `cooldown_seconds`: Time between valid XP gains.

### `activity_log`
- `id`: UUID.
- `user_id`: Foreign key.
- `activity_type`: Enum (chat, reply, reaction).
- `xp_awarded`: Amount given.
- `created_at`: Timestamp.

### `rewards`
- `id`: UUID.
- `community_id`: Foreign key.
- `level_requirement`: Level needed to unlock.
- `reward_type`: Type (role, badge, custom).
- `metadata`: JSON payload for reward details.

## Security

- **Webhook Verification**: All incoming webhooks are verified using the `WHOP_WEBHOOK_SECRET` to prevent spoofing.
- **Row Level Security (RLS)**: Supabase RLS policies ensure users can only read their own sensitive data or public leaderboard data.
- **Environment Variables**: Sensitive keys (API secrets, DB credentials) are stored in `.env` and never exposed to the client.
