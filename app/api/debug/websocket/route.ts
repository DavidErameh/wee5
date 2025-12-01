import { NextResponse } from "next/server";
import { realtimeService } from "@/services/realtime-service";

export async function GET() {
  const stats = realtimeService.getStats();

  return NextResponse.json({
    ...stats,
    environment: {
      agentUserId: process.env.WHOP_AGENT_USER_ID,
      appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
      hasApiKey: !!process.env.WHOP_API_KEY,
    },
    timestamp: new Date().toISOString(),
  });
}

// Restart WebSocket connection
export async function POST() {
  try {
    console.log("[Debug] Restarting WebSocket connection...");

    await realtimeService.shutdown();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
    await realtimeService.initialize();

    return NextResponse.json({
      success: true,
      message: "WebSocket restarted",
      stats: realtimeService.getStats(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}