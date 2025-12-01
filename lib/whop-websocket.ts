import { WhopServerSdk } from "@whop/api";
import * as Sentry from "@sentry/nextjs";

export interface WebSocketConfig {
  agentUserId: string;
  apiKey: string;
  appId: string;
  onMessage: (message: any) => Promise<void>;
  onError?: (error: any) => void;
}

export class WhopWebSocketClient {
  private websocket: any;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 2000; // Start with 2 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(private config: WebSocketConfig) {
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const { agentUserId, apiKey, appId } = this.config;

    if (!agentUserId?.startsWith('user_')) {
      throw new Error('Invalid agent user ID format. Must start with "user_"');
    }

    if (!apiKey) {
      throw new Error('API key is required');
    }

    if (!appId?.startsWith('app_')) {
      throw new Error('Invalid app ID format. Must start with "app_"');
    }
  }

  /**
   * Initialize and connect to Whop WebSocket
   */
  async connect(): Promise<void> {
    try {
      console.log(`[WebSocket] Connecting as agent: ${this.config.agentUserId}...`);

      const whopApi = WhopServerSdk({
        appApiKey: this.config.apiKey,
        appId: this.config.appId,
      });

      // Create WebSocket client for the agent user
      // IMPORTANT: The agent user receives events from communities where the app is installed
      this.websocket = whopApi
        .withUser(this.config.agentUserId)
        .websockets.client();

      // Set up event handlers BEFORE connecting
      this.setupEventHandlers();

      // Connect to WebSocket
      await this.websocket.connect();

      console.log("[WebSocket] Connection initiated");

    } catch (error) {
      console.error("[WebSocket] Connection error:", error);
      this.handleError(error);
      this.scheduleReconnect();
    }
  }

  /**
   * Set up WebSocket event handlers
   */
  private setupEventHandlers(): void {
    // Connection opened
    this.websocket.on("connect", () => {
      console.log("✅ [WebSocket] Connected successfully!");
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Clear any pending reconnect timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    });

    // Connection closed
    this.websocket.on("disconnect", () => {
      console.log("❌ [WebSocket] Disconnected");
      this.isConnected = false;
      this.scheduleReconnect();
    });

    // Connection status changes
    this.websocket.on("connectionStatus", (status: string) => {
      console.log(`[WebSocket] Status: ${status}`);
      this.isConnected = status === "connected";
    });

    // Message received (THIS IS WHERE ACTIVITY EVENTS COME IN)
    this.websocket.on("message", async (message: any) => {
      try {
        const hasChat = !!message.feedEntity?.dmsPost;
        const hasForum = !!message.feedEntity?.forumPost;

        if (!hasChat && !hasForum) {
          console.log("[WebSocket] Received non-activity message, skipping");
          return;
        }

        console.log("[WebSocket] Received activity event:", {
          type: hasChat ? "chat" : "forum",
          timestamp: new Date().toISOString(),
        });

        // Process the message asynchronously
        await this.config.onMessage(message);

      } catch (error) {
        console.error("[WebSocket] Message processing error:", error);
        this.handleError(error);
      }
    });

    // Error handling
    this.websocket.on("error", (error: any) => {
      console.error("[WebSocket] Connection error:", error);
      this.handleError(error);
    });
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    // Clear any existing timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      const error = new Error(`WebSocket failed after ${this.maxReconnectAttempts} attempts`);
      console.error("[WebSocket] Max reconnection attempts reached");
      this.handleError(error);
      return;
    }

    this.reconnectAttempts++;

    // Exponential backoff: 2s, 4s, 8s, 16s, 32s, max 60s
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      60000
    );

    console.log(
      `[WebSocket] Reconnecting in ${delay / 1000}s ` +
      `(attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Handle errors
   */
  private handleError(error: any): void {
    // Call custom error handler if provided
    if (this.config.onError) {
      this.config.onError(error);
    }

    // Report to Sentry
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: {
          service: 'websocket',
          agentUserId: this.config.agentUserId,
        },
        contexts: {
          websocket: {
            connected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
          },
        },
      });
    }
  }

  /**
   * Gracefully disconnect
   */
  async disconnect(): Promise<void> {
    console.log("[WebSocket] Disconnecting...");

    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Disconnect websocket
    if (this.websocket && this.isConnected) {
      try {
        await this.websocket.disconnect();
      } catch (error) {
        console.error("[WebSocket] Error during disconnect:", error);
      }
    }

    this.isConnected = false;
    this.reconnectAttempts = 0;
    console.log("[WebSocket] Disconnected");
  }

  /**
   * Check connection status
   */
  isActive(): boolean {
    return this.isConnected;
  }

  /**
   * Get connection stats
   */
  getStats() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      agentUserId: this.config.agentUserId,
    };
  }
}