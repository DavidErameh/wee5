// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users navigates to a page.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV === "production") {
	Sentry.init({
		dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

		// Adjust this value in production, or use tracesSampler for greater control
		tracesSampleRate: 0.1, // Reduced from 1 to 0.1 (10%) to control costs

		// Setting this option to true will print useful information to the console while you're setting up Sentry.
		debug: false,

		replaysOnErrorSampleRate: 1.0, // Keep 100% for error samples as they're more valuable

		// This sets the sample rate to be 10%. You may want this to be 100% while
		// in development and sample at a lower rate in production
		replaysSessionSampleRate: 0.05, // Reduced from 0.1 to 0.05 (5%) to control costs

		// You can remove this option if you're not planning to use the Sentry Session Replay feature:
		integrations: [
			Sentry.replayIntegration({
				// Additional Replay configuration goes in here, for example:
				maskAllText: true,
				blockAllMedia: true,
			}),
		],
	});
}
