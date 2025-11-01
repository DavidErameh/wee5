# WEE5 - Community Gamification App for Whop

WEE5 is an advanced gamification app for Whop communities, drawing inspiration from Discord's MEE6 bot. It introduces Experience Points (XP), levels, and rewards to boost user engagement, interaction, and retention. By gamifying activities like posting in forums, sending chat messages, and giving reactions, WEE5 transforms passive communities into active, rewarding ecosystems.

## Features

### Core Features
- **XP System**: Earn XP for community activities
  - Forum Posts: 15-25 XP per post (configurable for premium)
  - Chat Messages: 20 XP per message (configurable for premium)
  - Reactions: 5 XP per reaction (configurable for premium)
- **Leveling System**: Based on MEE6's proven formula
- **Anti-Spam Measures**: 60-second cooldown between XP awards
- **Leaderboard**: Public and filtered leaderboards
- **Rank Cards**: Display user progress and achievements

### Premium Features
- **Custom XP Rates**: Set your own XP values for different activities
- **Engagement Analytics**: Track user engagement and growth metrics
- **Advanced Anti-Cheat**: Enhanced measures for fair play
- **Custom Badges**: Personalize your community experience
- **Priority Support**: Dedicated assistance for premium users

### Enterprise Features
- **Multi-Community Support**: Manage multiple communities from one dashboard
- **API Access**: Integrate with external systems
- **Custom Integrations**: Tailored solutions for large communities
- **Dedicated Support**: SLA-backed support for critical issues

## Installation

### Prerequisites
- Node.js 18+ 
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
   Copy `.env.development` to `.env.local` and fill in your credentials:
   ```env
   NEXT_PUBLIC_WHOP_APP_ID=your_app_id
   WHOP_API_KEY=your_api_key
   WHOP_WEBHOOK_SECRET=your_webhook_secret
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   ```

3. **Database Setup**:
   Run the schema from `supabase/schema.sql` in your Supabase database to create all required tables.

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
- URL: `https://yourdomain.com/api/webhooks`
- Events: `membership.activated`, `membership.expired`, `payment.succeeded`

## Usage

### For Community Members
- Participate in chat, forums, and reactions to earn XP
- Check your rank and progress with the `/mylevel` command
- View community leaderboard with the `/leaderboard` command
- Unlock rewards as you level up

### For Community Creators
- Access your dashboard at `/dashboard/[companyId]`
- Configure XP rates for your community (Premium feature)
- View engagement analytics (Premium feature)
- Upgrade to Premium/Enterprise for advanced features

## API Endpoints

### XP System
- `POST /api/xp` - Award XP for activities
- `GET /api/leaderboard` - Fetch community leaderboard

### Configuration
- `GET /api/xp-config` - Get XP configuration
- `POST /api/xp-config` - Update XP configuration

### Analytics
- `GET /api/analytics` - Fetch engagement metrics
- `POST /api/analytics` - Update analytics data

### Commands
- `POST /api/commands` - Handle slash commands

### Webhooks
- `POST /api/webhooks` - Process Whop events

## Database Schema

The application uses Supabase as the primary database with these tables:

- `users` - Stores user XP, level, and activity data
- `xp_configurations` - Custom XP rates for premium communities
- `activity_log` - Tracks all XP-earning activities
- `rewards` - Manages earned rewards and level-ups
- `engagement_analytics` - Daily engagement metrics (Premium feature)

## Architecture

- **Frontend**: Next.js 16 with React and Frosted-UI components
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Caching**: Upstash Redis for cooldown management
- **Real-time**: Whop WebSockets for activity monitoring
- **Authentication**: Whop SDK for user verification

## Environment Variables

- `NEXT_PUBLIC_WHOP_APP_ID` - Your Whop application ID
- `WHOP_API_KEY` - Your Whop API key
- `WHOP_WEBHOOK_SECRET` - Your webhook verification secret
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

## Deployment

### Vercel
1. Fork this repository
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Custom Server
1. Build the application: `pnpm build`
2. Run in production: `pnpm start`

## Troubleshooting

### Common Issues
- **App not loading**: Ensure correct paths are set in Whop developer dashboard
- **XP not updating**: Verify webhook integration and Redis connection
- **Database errors**: Check that schema has been applied to Supabase
- **Authentication failures**: Verify environment variables are correct

### Webhook Issues
- Ensure webhook secret is correctly encoded
- Check that webhook URL matches your domain
- Verify that required events are selected

## Security

- All API routes include authentication validation
- User access is verified against Whop company membership
- Input validation prevents common security vulnerabilities
- XP cooldowns prevent automation abuse

## Development

### Running Tests
```bash
pnpm test
```

### Linting
```bash
pnpm lint
```

## Support

For support, please:
1. Check the troubleshooting section above
2. Review the Whop developer documentation
3. Contact support if issues persist

## Contributing

We welcome contributions! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

For more information about Whop app development, visit [Whop Developer Documentation](https://dev.whop.com/introduction)