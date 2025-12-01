#!/usr/bin/env tsx
/**
 * Real-Time Service Startup Script
 * 
 * Initializes and runs the real-time WebSocket service.
 * This should be run as a long-running process alongside your Next.js app.
 * 
 * Usage: tsx scripts/start-realtime.ts
 * 
 * Or add to package.json:
 * "scripts": {
 *   "realtime": "tsx scripts/start-realtime.ts"
 * }
 */

import { realtimeService } from '../services/realtime-service';

async function start() {
  console.log('═══════════════════════════════════════');
  console.log('  WEE5 Real-Time Service');
  console.log('═══════════════════════════════════════\n');

  try {
    console.log('🚀 Starting real-time service...\n');
    
    await realtimeService.initialize();
    
    console.log('\n✅ Service started successfully!');
    console.log('\n📊 Status:');
    const status = realtimeService.getStatus();
    console.log(`   Initialized: ${status.initialized}`);
    console.log(`   Connected: ${status.connected}`);
    console.log(`   Timestamp: ${status.timestamp}`);
    
    console.log('\n📡 Now listening for community events...');
    console.log('   (Press Ctrl+C to stop)\n');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n👋 Shutting down gracefully...');
      await realtimeService.shutdown();
      console.log('✅ Shutdown complete\n');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n\n👋 Received SIGTERM, shutting down...');
      await realtimeService.shutdown();
      console.log('✅ Shutdown complete\n');
      process.exit(0);
    });
    
    // Keep process running
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ Failed to start service:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your .env.local file has all required variables');
    console.error('   2. Run: tsx scripts/check-env.ts');
    console.error('   3. Verify Node.js version is 22.4+ or use Bun');
    console.error('   4. Check that WHOP_AGENT_USER_ID is correct\n');
    process.exit(1);
  }
}

start();
