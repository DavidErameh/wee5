# Core Features

WEE5 provides a suite of gamification features designed to enhance community engagement.

## 1. Experience Points (XP) System

The foundation of WEE5 is the XP system, which rewards users for active participation.

### Earning Mechanics
- **Chat Messages**: Users earn XP for sending messages in community channels.
  - *Default*: 20 XP per message.
- **Forum Posts**: Creating new discussions or threads awards higher XP.
  - *Default*: 15-25 XP per post.
- **Reactions**: Reacting to others' content provides a small XP boost.
  - *Default*: 5 XP per reaction.

### Anti-Spam & Cooldowns
To prevent abuse, an intelligent cooldown system is implemented using Redis:
- **Global Cooldown**: A user can only earn XP once every **60 seconds** (default).
- **Validation**: Messages that are too short or repetitive may be ignored (based on configuration).

## 2. Leveling System

As users accumulate XP, they progress through levels. The leveling curve is non-linear, meaning higher levels require more XP to reach, ensuring long-term engagement.

- **Formula**: The XP required for level `L` follows a curve similar to: `XP = 5 * (L ^ 2) + 50 * L + 100` (Example formula, actual implementation in `levelUtils.ts`).
- **Visual Feedback**: Users see a progress bar indicating how close they are to the next level.
- **Celebration**: A "Level Up" toast notification appears instantly when a user crosses a threshold.

## 3. Leaderboards

Competition is a key driver of engagement. WEE5 offers comprehensive leaderboards.

- **Global Leaderboard**: Shows the top users of all time.
- **Period Leaderboards**:
  - **Weekly**: Resets every week to give new members a chance to shine.
  - **Monthly**: Resets every month for medium-term competition.
- **Real-Time Updates**: Leaderboard positions update instantly as users earn XP, powered by Supabase Realtime.

## 4. Rank Cards

A personalized "gamer card" for every user.

- **Components**:
  - User Avatar & Name.
  - Current Level & Rank (e.g., "Rank #5").
  - Current XP / XP to Next Level.
  - Graphical Progress Bar.
- **Usage**: Users can view their own card and potentially view others' cards to compare progress.

## 5. Rewards System

Incentivize leveling with tangible benefits.

- **Role Rewards**: Automatically assign Discord roles or Whop roles when a user reaches a specific level.
- **Badge Rewards**: Unlock custom badges on the user's profile.
- **Custom Rewards**: (Premium) Triggers for external webhooks or custom integrations upon leveling up.

## 6. Premium Features

For communities that need more control and power.

- **Custom XP Rates**: Admins can tweak the XP values for different activities to balance the economy.
- **Analytics Dashboard**:
  - View daily active users (DAU).
  - Track total XP awarded over time.
  - Identify top contributors.
- **Custom Branding**: Options to customize the look of Rank Cards and Leaderboards.
- **Priority Support**: Faster response times for technical issues.

## 7. Enterprise Features

Designed for large-scale organizations managing multiple communities.

- **Multi-Community Management**: A unified dashboard to oversee multiple Whop hubs.
- **Aggregated Analytics**: Cross-community metrics.
- **API Access**: Direct access to the WEE5 API for custom integrations.
