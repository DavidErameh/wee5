# WEE5 - Community Gamification App for Whop

WEE5 is an advanced gamification app for Whop communities, drawing inspiration from Discord's MEE6 bot. It introduces Experience Points (XP), levels, and rewards to boost user engagement, interaction, and retention. By gamifying activities like posting in forums, sending chat messages, and giving reactions, WEE5 transforms passive communities into active, rewarding ecosystems.

## Features

### Real-Time Architecture
- **Supabase Real-Time Subscriptions**: Live UI updates via PostgreSQL real-time functionality
- **Reaction Polling Fallback**: Backup system for platforms where reactions aren't available in real-time events
- **Redis Cooldown Management**: Fast, distributed cooldown enforcement for spam prevention
- **Event Processing Pipeline**: Automated validation, cooldown checking, and XP awarding
- **Instant Rewards**: Automated milestone rewards processed within milliseconds of level-up
- **Live Progress Tracking**: Real-time progress bars and level indicators across all UI components
- **Real-Time Error Handling**: Comprehensive error tracking and recovery with Sentry integration

### Core Features
- **XP System**: Earn XP for community activities
  - Forum Posts: 15-25 XP per post (configurable for Premium)
  - Chat Messages: 20 XP per message (configurable for Premium)
  - Reactions: 5 XP per reaction (configurable for Premium)
- **Leveling System**: Based on MEE6's proven formula
- **Anti-Spam Measures**: 60-second cooldown between XP awards with Redis-powered prevention
- **Leaderboard**: Real-time updating leaderboards with instant position changes (all-time, weekly, monthly)
- **Rank Cards**: Live progress updates with Supabase real-time subscriptions
- **Real-Time Processing**: Webhook-based activity detection with reaction polling fallback
- **Live UI Updates**: Real-time progress bars and level indicators via PostgreSQL subscriptions
- **Automated Event Processing**: Complete pipeline from activity detection to reward delivery

### Premium Features
- **Custom XP Rates**: Set your own XP values for different activities
- **Real-Time Engagement Analytics**: Live dashboards with real-time engagement metrics
- **Custom Badges**: Create and award custom badges to community members
- **Enhanced Anti-Cheat**: Advanced real-time measures for fair play
- **Priority Support**: Dedicated assistance for premium users
- **Live Configuration**: Real-time XP rate updates that apply instantly
- **Advanced Metrics**: Live user behavior tracking and retention analytics

### Enterprise Features
- **Multi-Community Support**: Manage multiple communities from one dashboard
- **Cross-Community Analytics**: Real-time aggregated metrics across all communities
- **Real-Time API Access**: Live data integration with external systems
- **Custom Integrations**: Tailored solutions for large communities
- **Dedicated Support**: SLA-backed support for critical issues
- **API Webhooks**: Real-time event streaming to external systems
- **Bulk Operations**: Real-time processing for large-scale community management

## Installation

### Prerequisites
- Node.js 22.4+ 
- pnpm package manager
- Whop Developer Account
- Supabase account
- Upstash Redis account

### Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment Variables**:
   Copy `.env.development` to `.env.local` and fill in your credentials including real-time services:
   ```env
   NEXT_PUBLIC_WHOP_APP_ID=your_app_id
   WHOP_API_KEY=your_api_key

   WHOP_WEBHOOK_SECRET=your_webhook_secret
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   SENTRY_DSN=your_sentry_dsn (optional)
   NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn (optional)
   ENABLE_REACTION_POLLING=true (optional, defaults to false)
   ```


3. **Database Setup**:
   Run the schema from `supabase/schema.sql` in your Supabase database to create all required tables, or use the migration system:

   ### Database Migrations
   WEE5 uses Supabase CLI for migration management.

   #### Running Migrations
   ```bash
   # Apply all pending migrations
   pnpm run migrate:up

   # Check migration status
   pnpm run migrate:status
   ```

   #### Creating New Migrations
   ```bash
   # Generate a new migration file (replace 'migration_name' with your descriptive name)
   supabase migration new migration_name

   # This creates a new file in supabase/migrations/ with timestamp prefix
   ```

   #### Migration Best Practices
   - Always test migrations on local instance first
   - Include rollback SQL in migration comments
   - Never modify existing migrations after deployment
   - Keep migrations small and focused on single changes

4. **Start Development Server**:
   ```bash
   pnpm dev
   ```

## Configuration

### Whop Integration
Ensure your Whop app settings are configured as follows:
- Base URL: Your deployment domain
- App path: `/experiences/[experienceId]`
- Dashboard path: `/dashboard/[companyId]`
- Discover path: `/discover`

### Webhooks
Configure webhook URL in your Whop developer dashboard to handle membership events:
- URL: `https://yourdomain.com/api/webhook` (Note: Updated from /webhooks)
- Events: `membership.created`, `membership.updated`, `membership.canceled`, `payment.succeeded`

### Real-time Features
WEE5 uses webhooks for activity detection. Configure webhooks in your Whop dashboard to enable XP awarding.

## Usage

### For Community Members
- Participate in chat, forums, and reactions to earn XP
- Check your rank and progress via the web dashboard
- View community leaderboard in real-time
- Unlock rewards as you level up
- See real-time progress updates with rank cards

### For Community Creators
- Access your dashboard at `/dashboard/[companyId]`
- Configure XP rates for your community (Premium feature)
- View engagement analytics (Premium feature)
- Award custom badges (Premium feature)
- Upgrade to Premium/Enterprise for advanced features

## API Endpoints

### Core System
- `POST /api/xp` - Award XP for activities
- `GET /api/leaderboard` - Fetch community leaderboard
- `GET /api/xp?userId=X&experienceId=Y` - Fetch user XP/level

### Configuration
- `GET /api/xp-config` - Get XP configuration (requires auth)
- `POST /api/xp-config` - Update XP configuration (requires auth)

### Analytics
- `GET /api/analytics` - Fetch engagement metrics (Premium only)
- `POST /api/analytics` - Custom analytics queries (Premium only)

### Webhooks
- `POST /api/webhook` - Process Whop events with signature verification

### Enterprise
- `GET /api/enterprise` - List enterprise communities
- `POST /api/enterprise` - Enterprise-specific operations

### Checkout
- `GET /api/checkout` - Fetch available plans
- `POST /api/checkout` - Create checkout configuration

## Database Schema

The application uses Supabase as the primary database with these tables:

- `users` - Stores user XP, level, activity data, and tier
- `xp_configurations` - Custom XP rates for Premium communities
- `activity_log` - Tracks all XP-earning activities
- `rewards` - Manages earned rewards and level-ups
- `engagement_analytics` - Daily engagement metrics (Premium feature)

## Architecture

- **Frontend**: Next.js 16 with React and Frosted-UI components
- **Backend**: Next.js API routes with TypeScript
- **Database**: Supabase (PostgreSQL) with Row Level Security and Real-Time subscriptions
- **Caching**: Upstash Redis for cooldowns and leaderboard caching
- **Real-time Processing**: Webhook integration for event detection + reaction polling fallback
- **Real-time UI**: Supabase PostgreSQL real-time subscriptions for live updates
- **Authentication**: Whop SDK for user verification
- **Monitoring**: Sentry for error tracking and performance monitoring
- **Event Processing**: Automated pipeline from activity detection to reward delivery
- **Cooldown Management**: Redis-powered 60-second spam prevention


## Environment Variables

- `NEXT_PUBLIC_WHOP_APP_ID` - Your Whop application ID
- `WHOP_API_KEY` - Your Whop API key
- `WHOP_WEBHOOK_SECRET` - Your webhook verification secret
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token
- `SENTRY_DSN` - Sentry DSN for server-side error tracking
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for client-side error tracking

## Deployment

### Vercel
1. Fork this repository
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Custom Server
1. Build the application: `pnpm build`
2. Run in production: `pnpm start`

## Testing

### Running Tests
```bash
pnpm test
```

### Test Coverage
The application includes unit tests for:
- XP calculation logic
- Reward system
- API route functionality
- Premium access controls

## Security

- All API routes include authentication validation
- Webhook signature verification prevents unauthorized events
- User access is verified against Whop company membership
- Input validation prevents common security vulnerabilities
- Rate limiting prevents abuse
- XP cooldowns prevent automation abuse
- Database RLS prevents unauthorized data access

## Development

### Linting
```bash
pnpm lint
```

### Type Checking
```bash
pnpm type-check
```

## Troubleshooting

### Common Issues
- **App not loading**: Ensure correct paths are set in Whop developer dashboard
- **XP not updating**: Verify webhook integration and Redis connection
- **Database errors**: Check that schema has been applied to Supabase
- **Authentication failures**: Verify environment variables are correct
- **WebSocket errors**: Check for CORS issues and ensure proper URL configuration

### Webhook Issues
- Ensure webhook secret is correctly encoded
- Check that webhook URL matches your domain
- Verify signature verification is working (see security section)

## Support

For support, please:
1. Check the troubleshooting section above
2. Review the Whop developer documentation
3. Ensure Sentry monitoring is configured to catch errors
4. Verify webhook configuration is correct
5. Contact support if issues persist

## Real-Time Functionality

To ensure real-time features work properly:
1. Configure webhooks in your Whop dashboard
2. Verify webhook URL is accessible
3. Leaderboards and rank cards update in real-time via Supabase subscriptions
4. Monitor Sentry logs for any processing errors

## Contributing

We welcome contributions! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

For more information about Whop app development, visit [Whop Developer Documentation](https://dev.whop.com/introduction)