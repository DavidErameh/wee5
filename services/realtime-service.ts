import { WhopWebSocketClient } from "@/lib/whop-websocket";
import { processWebSocketEvent } from "@/lib/event-processor";
import * as Sentry from "@sentry/nextjs";

class RealtimeService {
  private websocketClient: WhopWebSocketClient | null = null;
  private isInitialized: boolean = false;
  private startTime: number = 0;

  /**
   * Initialize the real-time service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("[Realtime Service] Already initialized");
      return;
    }

    try {
      console.log("[Realtime Service] Initializing...");
      this.startTime = Date.now();

      // Validate environment
      this.validateEnvironment();

      // Create WebSocket client with agent user
      this.websocketClient = new WhopWebSocketClient({
        agentUserId: process.env.WHOP_AGENT_USER_ID!,
        apiKey: process.env.WHOP_API_KEY!,
        appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
        onMessage: this.handleMessage.bind(this),
        onError: this.handleError.bind(this),
      });

      // Connect
      await this.websocketClient.connect();

      this.isInitialized = true;

      const duration = Date.now() - this.startTime;
      console.log(`✅ [Realtime Service] Initialized in ${duration}ms`);

    } catch (error) {
      console.error("❌ [Realtime Service] Initialization failed:", error);

      Sentry.captureException(error, {
        tags: { service: 'realtime-init' },
      });

      throw error;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private async handleMessage(message: any): Promise<void> {
    const messageStart = Date.now();

    try {
      await processWebSocketEvent(message);

      const duration = Date.now() - messageStart;
      if (duration > 1000) {
        console.warn(`[Realtime Service] Slow message processing: ${duration}ms`);
      }
    } catch (error) {
      console.error("[Realtime Service] Message processing error:", error);
      this.handleError(error);
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: any): void {
    console.error("[Realtime Service] Error:", error);

    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: {
          service: 'realtime',
        },
        contexts: {
          service: {
            initialized: this.isInitialized,
            uptime_ms: Date.now() - this.startTime,
          },
        },
      });
    }
  }

  /**
   * Validate required environment variables
   */
  private validateEnvironment(): void {
    const required = [
      'WHOP_AGENT_USER_ID',
      'WHOP_API_KEY',
      'NEXT_PUBLIC_WHOP_APP_ID',
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate formats
    if (!process.env.WHOP_AGENT_USER_ID?.startsWith('user_')) {
      throw new Error('WHOP_AGENT_USER_ID must start with "user_"');
    }

    if (!process.env.NEXT_PUBLIC_WHOP_APP_ID?.startsWith('app_')) {
      throw new Error('NEXT_PUBLIC_WHOP_APP_ID must start with "app_"');
    }
  }

  /**
   * Gracefully shut down
   */
  async shutdown(): Promise<void> {
    console.log("[Realtime Service] Shutting down...");

    if (this.websocketClient) {
      await this.websocketClient.disconnect();
    }

    this.isInitialized = false;
    const uptime = Date.now() - this.startTime;
    console.log(`[Realtime Service] Shut down after ${uptime}ms uptime`);
  }

  /**
   * Check if service is running
   */
  isActive(): boolean {
    return this.isInitialized && (this.websocketClient?.isActive() ?? false);
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      initialized: this.isInitialized,
      active: this.isActive(),
      uptime_ms: this.isInitialized ? Date.now() - this.startTime : 0,
      websocket: this.websocketClient?.getStats() || null,
    };
  }
}

// Singleton instance
export const realtimeService = new RealtimeService();