/**
 * Real-Time Service Status Endpoint
 *
 * GET /api/debug/realtime
 *
 * Returns the current status of the WebSocket connection and real-time service.
 * Useful for monitoring and debugging.
 */

import { NextResponse } from 'next/server';
import { realtimeService } from '@/services/realtime-service';

export async function GET() {
  try {
    const stats = realtimeService.getStats();

    return NextResponse.json({
      ...stats,
      message: stats.websocket?.connected
        ? 'Real-time service is connected and active'
        : stats.initialized
        ? 'Real-time service is initialized but not connected'
        : 'Real-time service is not initialized',
    });

  } catch (error) {
    console.error('[API /debug/realtime] Error getting stats:', error);

    return NextResponse.json({
      initialized: false,
      active: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to get real-time service stats',
    }, { status: 500 });
  }
}