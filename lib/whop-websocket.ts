/**
 * Whop WebSocket Client for Real-Time Event Processing
 * Per Documentation: 01_START HERE.MD, 03_CORE FEATURE.MD, 05_ARCHITECTURE.MD
 * 
 * This implements the real-time XP awarding system using Whop's server WebSocket API
 * with a bot user to receive chat messages and forum posts within 1-2 seconds.
 * 
 * PREREQUISITES:
 * 1. Bot user created in Whop dashboard
 * 2. WHOP_BOT_USER_ID in environment
 * 3. WHOP_BOT_TOKEN (OAuth token) in environment
 * 4. Bot user added to target communities
 */

import WebSocket from 'ws';
import { awardXP } from './xp-logic';
import { createClient } from '@supabase/supabase-js';

// WebSocket connection state
let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 5000; // 5 seconds

// Supabase client for database operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Event types from Whop WebSocket
interface WhopWebSocketEvent {
  type: 'dmsPost' | 'forumPost' | 'reaction' | 'membership';
  data: {
    user_id: string;
    experience_id: string;
    content?: string;
    post_id?: string;
    message_id?: string;
    reaction_type?: string;
    timestamp: string;
  };
}

/**
 * Initialize WebSocket connection to Whop
 * Connects using bot user token for authentication
 */
export function initializeWhopWebSocket() {
  const botToken = process.env.WHOP_BOT_TOKEN;
  const botUserId = process.env.WHOP_BOT_USER_ID;

  if (!botToken || !botUserId) {
    console.error('❌ WHOP_BOT_TOKEN or WHOP_BOT_USER_ID not configured');
    console.error('📝 Please follow UNDERSTANDING_BOTUSER.MD to set up bot user');
    return;
  }

  try {
    // Connect to Whop WebSocket API
    // URL format: wss://ws.whop.com/v5
    ws = new WebSocket('wss://ws.whop.com/v5', {
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'User-Agent': 'WEE5-Bot/1.0',
      },
    });

    ws.on('open', handleWebSocketOpen);
    ws.on('message', handleWebSocketMessage);
    ws.on('error', handleWebSocketError);
    ws.on('close', handleWebSocketClose);

    console.log('🔌 Connecting to Whop WebSocket...');
  } catch (error) {
    console.error('❌ Failed to initialize WebSocket:', error);
  }
}

/**
 * Handle WebSocket connection open
 */
function handleWebSocketOpen() {
  console.log('✅ Connected to Whop WebSocket');
  reconnectAttempts = 0;

  // Subscribe to community events
  if (ws) {
    ws.send(JSON.stringify({
      action: 'subscribe',
      feed: 'community_events',
      types: ['dmsPost', 'forumPost', 'reaction'],
    }));
    console.log('📡 Subscribed to community events');
  }
}

/**
 * Handle incoming WebSocket messages
 * Processes events and awards XP in real-time
 */
async function handleWebSocketMessage(data: WebSocket.Data) {
  try {
    const event: WhopWebSocketEvent = JSON.parse(data.toString());
    
    console.log('📨 Received event:', event.type);

    // Process event based on type
    switch (event.type) {
      case 'dmsPost':
        await handleChatMessage(event);
        break;
      case 'forumPost':
        await handleForumPost(event);
        break;
      case 'reaction':
        await handleReaction(event);
        break;
      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }
  } catch (error) {
    console.error('❌ Error processing WebSocket message:', error);
  }
}

/**
 * Handle chat message event
 * Awards 20 XP per message (with cooldown)
 */
async function handleChatMessage(event: WhopWebSocketEvent) {
  const { user_id, experience_id } = event.data;

  try {
    // Award XP for chat message (20 XP)
    const result = await awardXP({
      userId: user_id,
      experienceId: experience_id,
      activityType: 'message',
    });

    if (result.success) {
      console.log(`✅ Awarded ${result.xpAwarded} XP to ${user_id} for chat message`);
      
      if (result.leveledUp) {
        console.log(`🎉 User ${user_id} leveled up to ${result.newLevel}!`);
        // Level-up notification will be handled by the reward system
      }
    } else {
      console.log(`⏳ User ${user_id} on cooldown, skipping XP award`);
    }
  } catch (error) {
    console.error('❌ Error awarding XP for chat message:', error);
  }
}

/**
 * Handle forum post event
 * Awards 15-25 XP per post (randomized, with cooldown)
 */
async function handleForumPost(event: WhopWebSocketEvent) {
  const { user_id, experience_id } = event.data;

  try {
    // Award XP for forum post (15-25 XP, randomized)
    const result = await awardXP({
      userId: user_id,
      experienceId: experience_id,
      activityType: 'post',
    });

    if (result.success) {
      console.log(`✅ Awarded ${result.xpAwarded} XP to ${user_id} for forum post`);
      
      if (result.leveledUp) {
        console.log(`🎉 User ${user_id} leveled up to ${result.newLevel}!`);
      }
    } else {
      console.log(`⏳ User ${user_id} on cooldown, skipping XP award`);
    }
  } catch (error) {
    console.error('❌ Error awarding XP for forum post:', error);
  }
}

/**
 * Handle reaction event
 * Awards 5 XP per reaction (with cooldown)
 */
async function handleReaction(event: WhopWebSocketEvent) {
  const { user_id, experience_id } = event.data;

  try {
    // Award XP for reaction (5 XP)
    const result = await awardXP({
      userId: user_id,
      experienceId: experience_id,
      activityType: 'reaction',
    });

    if (result.success) {
      console.log(`✅ Awarded ${result.xpAwarded} XP to ${user_id} for reaction`);
      
      if (result.leveledUp) {
        console.log(`🎉 User ${user_id} leveled up to ${result.newLevel}!`);
      }
    } else {
      console.log(`⏳ User ${user_id} on cooldown, skipping XP award`);
    }
  } catch (error) {
    console.error('❌ Error awarding XP for reaction:', error);
  }
}

/**
 * Handle WebSocket errors
 */
function handleWebSocketError(error: Error) {
  console.error('❌ WebSocket error:', error);
}

/**
 * Handle WebSocket connection close
 * Implements automatic reconnection with exponential backoff
 */
function handleWebSocketClose(code: number, reason: string) {
  console.log(`🔌 WebSocket closed: ${code} - ${reason}`);

  // Attempt to reconnect
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1);
    
    console.log(`🔄 Reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
    
    setTimeout(() => {
      initializeWhopWebSocket();
    }, delay);
  } else {
    console.error('❌ Max reconnection attempts reached. Please restart the service.');
  }
}

/**
 * Close WebSocket connection gracefully
 */
export function closeWhopWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
    console.log('🔌 WebSocket connection closed');
  }
}

/**
 * Get WebSocket connection status
 */
export function getWebSocketStatus(): 'connected' | 'connecting' | 'disconnected' {
  if (!ws) return 'disconnected';
  
  switch (ws.readyState) {
    case WebSocket.OPEN:
      return 'connected';
    case WebSocket.CONNECTING:
      return 'connecting';
    default:
      return 'disconnected';
  }
}

// Auto-initialize on module load (server-side only)
if (typeof window === 'undefined') {
  // Only initialize if bot credentials are configured
  if (process.env.WHOP_BOT_TOKEN && process.env.WHOP_BOT_USER_ID) {
    initializeWhopWebSocket();
  } else {
    console.warn('⚠️ Whop WebSocket not initialized: Bot credentials missing');
    console.warn('📝 Set WHOP_BOT_TOKEN and WHOP_BOT_USER_ID to enable real-time features');
  }
}

export default {
  initialize: initializeWhopWebSocket,
  close: closeWhopWebSocket,
  getStatus: getWebSocketStatus,
};
