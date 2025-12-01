#!/usr/bin/env tsx
/**
 * WebSocket Connection Test Script
 *
 * Tests the WebSocket connection to Whop and logs all received events.
 * Useful for debugging and verifying that events are being received.
 *
 * Usage: tsx scripts/test-websocket.ts
 *
 * Press Ctrl+C to stop.
 */

import { WhopWebSocketClient } from '../lib/whop-websocket';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testWebSocket() {
  console.log("=== WEE5 WebSocket Test ===\n");

  // Validate configuration
  console.log("Configuration:");
  console.log("- Agent User ID:", process.env.WHOP_AGENT_USER_ID);
  console.log("- App ID:", process.env.NEXT_PUBLIC_WHOP_APP_ID);
  console.log("- Has API Key:", !!process.env.WHOP_API_KEY);
  console.log("");

  // Create WebSocket client
  const client = new WhopWebSocketClient({
    agentUserId: process.env.WHOP_AGENT_USER_ID!,
    apiKey: process.env.WHOP_API_KEY!,
    appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
    onMessage: async (message) => {
      console.log("\n🎉 Message Received!");
      console.log("Timestamp:", new Date().toISOString());
      console.log("Has Chat:", !!message.feedEntity?.dmsPost);
      console.log("Has Forum:", !!message.feedEntity?.forumPost);

      // Process the event
      const { processWebSocketEvent } = await import('../lib/event-processor');
      await processWebSocketEvent(message);
      console.log("✅ Event processed successfully\n");
    },
    onError: (error) => {
      console.error("❌ Error:", error);
    },
  });

  try {
    // Connect
    console.log("Connecting to WebSocket...");
    await client.connect();

    console.log("\n✅ WebSocket connected successfully!");
    console.log("Listening for events... (Press Ctrl+C to stop)\n");
    console.log("To test:");
    console.log("1. Go to a Whop community where your app is installed");
    console.log("2. Send a message in chat or create a forum post");
    console.log("3. Watch for events here\n");

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\n\nShutting down...");
      await client.disconnect();
      process.exit(0);
    });

    // Keep running
    await new Promise(() => {});
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testWebSocket();