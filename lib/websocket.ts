import { io, Socket } from 'socket.io-client';
import { awardXP } from './xp-logic';
import { handleLevelUp } from './rewards';
import * as Sentry from '@sentry/nextjs';

interface WhopActivityEvent {
  userId: string;
  experienceId: string;
  activityType: 'message' | 'post' | 'reaction';
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  /**
   * Initialize WebSocket connection for real-time event listening
   * @param userId User ID to listen for events
   */
  public initialize(userId: string): void {
    try {
      // In a real implementation, we would connect to Whop's WebSocket service
      // For now, we'll create a placeholder that demonstrates the pattern
      // This would be replaced with actual Whop WebSocket connection
      
      // For demonstration purposes, let's create a mock WebSocket connection
      this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        
        // Join user-specific room for targeted events
        if (this.socket) {
          this.socket.emit('join-room', userId);
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        Sentry.captureException(error);
      });

      // Listen for activity events from Whop
      this.socket.on('activity', async (event: WhopActivityEvent) => {
        try {
          console.log('Received activity event:', event);
          
          // Award XP for the activity
          const result = await awardXP(
            event.userId,
            event.experienceId,
            event.activityType as 'message' | 'post' | 'reaction'
          );

          if (result.success) {
            console.log(`XP awarded: ${result.xpAwarded} for ${event.activityType}`);

            // Handle level-up if applicable
            if (result.leveledUp && result.newLevel) {
              await handleLevelUp(event.userId, event.experienceId, result.newLevel);
            }
          } else if (result.error) {
            console.log(`XP award skipped: ${result.error}`);
          }
        } catch (error) {
          console.error('Error processing activity event:', error);
          Sentry.captureException(error);
        }
      });

      // Listen for other relevant events
      this.socket.on('level-up', (data) => {
        console.log('Level up notification received:', data);
        // Handle level-up notifications if sent by server
      });

    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      Sentry.captureException(error);
    }
  }

  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  public isConnectedToWebSocket(): boolean {
    return this.isConnected && this.socket !== null && this.socket.connected;
  }

  /**
   * Send custom event to WebSocket server
   */
  public sendEvent(event: string, data: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }
}

// Singleton instance
export const websocketService = new WebSocketService();

// For real Whop integration, we would need to use Whop's specific WebSocket API
// Below is a placeholder for what that might look like:

interface WhopWebSocketOptions {
  userId?: string;
  companyId?: string;
  apiKey: string;
}

/**
 * Alternative approach using Whop's real-time capabilities
 * This would be the proper way to connect to Whop's event system
 */
export class WhopWebSocketClient {
  private socket: Socket | null = null;
  private initialized: boolean = false;

  constructor(private options: WhopWebSocketOptions) {}

  public async initialize(): Promise<void> {
    try {
      // This is a placeholder - in reality, you'd use Whop's specific WebSocket endpoint
      // which would require their SDK or API documentation
      const whopWebSocketUrl = process.env.WHOP_WEBSOCKET_URL || 'wss://events.whop.com';
      
      this.socket = io(whopWebSocketUrl, {
        auth: {
          token: this.options.apiKey,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('Connected to Whop WebSocket');
        this.initialized = true;

        // Subscribe to relevant channels based on options
        if (this.options.userId) {
          this.socket?.emit('subscribe-user', this.options.userId);
        }
        if (this.options.companyId) {
          this.socket?.emit('subscribe-company', this.options.companyId);
        }
      });

      this.socket.on('activity', this.handleActivity.bind(this));
      this.socket.on('membership', this.handleMembership.bind(this));
      this.socket.on('error', this.handleError.bind(this));
      this.socket.on('disconnect', this.handleDisconnect.bind(this));

    } catch (error) {
      console.error('Failed to initialize Whop WebSocket:', error);
      Sentry.captureException(error);
    }
  }

  private async handleActivity(data: any): Promise<void> {
    try {
      // Process activity event
      const activityData = {
        userId: data.userId || data.user_id,
        experienceId: data.experienceId || data.product_id,
        activityType: data.activityType || data.type,
      };

      console.log('Processing activity event:', activityData);
      
      const result = await awardXP(
        activityData.userId,
        activityData.experienceId,
        activityData.activityType as 'message' | 'post' | 'reaction'
      );

      if (result.success) {
        console.log(`XP awarded: ${result.xpAwarded} for ${activityData.activityType}`);

        if (result.leveledUp && result.newLevel) {
          await handleLevelUp(activityData.userId, activityData.experienceId, result.newLevel);
        }
      }
    } catch (error) {
      console.error('Error handling activity event:', error);
      Sentry.captureException(error);
    }
  }

  private handleMembership(data: any): void {
    console.log('Membership event received:', data);
    // Handle membership events like joins, cancellations, etc.
  }

  private handleError(error: any): void {
    console.error('WebSocket error:', error);
    Sentry.captureException(error);
  }

  private handleDisconnect(reason: string): void {
    console.log('WebSocket disconnected:', reason);
    this.initialized = false;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.initialized = false;
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }
}