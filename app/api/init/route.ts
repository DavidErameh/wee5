/**
 * Real-Time Service Initialization Endpoint
 *
 * GET /api/init
 *
 * Initializes the WebSocket connection and starts real-time event processing.
 * Should be called once after deployment or server restart.
 */

import { NextRequest, NextResponse } from 'next/server';
import { realtimeService } from '@/services/realtime-service';

let initializationPromise: Promise<void> | null = null;

export async function GET() {
  // Check if already initialized
  if (realtimeService.isActive()) {
    return NextResponse.json({
      status: "already_running",
      stats: realtimeService.getStats(),
    });
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    try {
      await initializationPromise;
      return NextResponse.json({
        status: "initialized",
        stats: realtimeService.getStats(),
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          status: "error",
          message: error.message,
        },
        { status: 500 }
      );
    }
  }

  // Start initialization
  try {
    initializationPromise = realtimeService.initialize();
    await initializationPromise;
    initializationPromise = null;

    return NextResponse.json({
      status: "initialized",
      message: "Real-time service started successfully",
      stats: realtimeService.getStats(),
    });
  } catch (error: any) {
    initializationPromise = null;
    console.error("Failed to initialize real-time service:", error);

    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to initialize",
      },
      { status: 500 }
    );
  }
}

// Health check
export async function POST(req: NextRequest) {
  return NextResponse.json({
    status: realtimeService.isActive() ? "healthy" : "inactive",
    stats: realtimeService.getStats(),
  });
}