# Technology Stack

WEE5 is built on a modern, high-performance stack designed for scalability, real-time interactivity, and developer experience.

## Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) - The core React framework for production.
- **Library**: [React 19](https://react.dev/) - The latest version of the UI library.
- **Styling**: 
  - [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development.
  - [Frosted UI](https://github.com/whop-apps/frosted-ui) - Whop's design system components.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) - For smooth transitions and micro-interactions.
- **Visualization**: [Recharts](https://recharts.org/) - For rendering analytics charts and graphs.
- **Icons**: [Lucide React](https://lucide.dev/) - Consistent and clean icon set.

## Backend
- **Runtime**: Node.js (via Next.js API Routes).
- **Language**: [TypeScript](https://www.typescriptlang.org/) - For type safety and better developer tooling.
- **API**: Next.js Server Actions and API Routes.
- **Real-Time**: 
  - **Supabase Realtime**: For database subscriptions and live UI updates.
  - **Socket.IO**: For specific real-time event handling (if applicable).

## Database & Storage
- **Primary Database**: [Supabase](https://supabase.com/) (PostgreSQL) - Relational data storage with built-in real-time capabilities.
- **Caching & Rate Limiting**: [Upstash Redis](https://upstash.com/) - Serverless Redis for high-performance caching, session management, and spam prevention (cooldowns).

## Infrastructure & Services
- **Authentication**: [Whop SDK](https://docs.whop.com/) - Integrated authentication and user verification.
- **Event Processing**: Webhook-based architecture handling events from Whop.
- **Monitoring**: [Sentry](https://sentry.io/) - For error tracking and performance monitoring (Client & Server).
- **Hosting**: Vercel (Recommended) or any Node.js compatible hosting.

## Development Tools
- **Package Manager**: [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager.
- **Linting & Formatting**: [Biome](https://biomejs.dev/) - Fast toolchain for web projects.
- **Testing**: [Jest](https://jestjs.io/) - JavaScript testing framework.
- **Type Checking**: TypeScript `tsc`.

## Key Libraries
- `@whop/api`: Official Whop API client.
- `@supabase/supabase-js`: Supabase client.
- `@upstash/redis` & `@upstash/ratelimit`: Redis client and rate limiting logic.
- `zod`: Schema validation for API inputs and environment variables.
- `@tanstack/react-query`: For efficient data fetching and state management.
