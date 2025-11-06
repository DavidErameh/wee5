// services/realtime-service.ts
// This service manages the real-time functionality for WEE5

import { getWhopWebSocketClient } from '@/lib/whop-websocket';
import { getReactionPoller } from '@/lib/reaction-poller';

class RealtimeService {
  private static instance: RealtimeService;
  private isInitialized = false;
  
  private constructor() {}

  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  /**
   * Initialize all real-time services
   * @param botUserId The user ID of the bot that will receive events
   */
  async initialize(botUserId: string): Promise<void> {
    if (this.isInitialized) {
      console.log('RealtimeService is already initialized');
      return;
    }

    console.log('Initializing real-time services...');
    
    try {
      // Initialize the Whop WebSocket client
      const websocketClient = getWhopWebSocketClient(botUserId);
      await websocketClient.initialize();
      
      // Initialize the reaction polling service
      if (process.env.ENABLE_REACTION_POLLING === 'true') {
        const reactionPoller = getReactionPoller();
        reactionPoller.start();
      } else {
        console.log('Reaction polling is disabled (set ENABLE_REACTION_POLLING=true to enable)');
      }
      
      this.isInitialized = true;
      console.log('All real-time services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize real-time services:', error);
      throw error;
    }
  }

  /**
   * Shutdown all real-time services
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down real-time services...');
    
    // Note: In a real implementation, you would properly disconnect
    // the WebSocket client and stop the reaction poller
    
    this.isInitialized = false;
    console.log('Real-time services shutdown complete');
  }

  /**
   * Check if the service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
export const realtimeService = RealtimeService.getInstance();

// Initialize the service when this module is loaded if properly configured
export async function initRealtimeServices(): Promise<void> {
  const botUserId = process.env.WHOP_BOT_USER_ID;
  
  if (botUserId) {
    try {
      await realtimeService.initialize(botUserId);
    } catch (error) {
      console.error('Failed to initialize real-time services:', error);
      // Don't throw here as it might break the application startup
      // In production, you might want to handle this differently
    }
  } else {
    console.warn('WHOP_BOT_USER_ID not set, real-time services will not start. Create a bot user in Whop and set this environment variable.');
  }
}

// For server-side initialization (e.g., in a Next.js API route or server component)
export function ensureRealtimeServicesInitialized(): void {
  // This is a placeholder for server-side initialization logic
  // In a real implementation, you'd need to handle server-side WebSocket management
  // differently than client-side due to Vercel's serverless function limitations
  console.log('Ensuring real-time services are initialized');
}

// Export for manual initialization if needed
export { RealtimeService };