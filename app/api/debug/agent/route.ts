import { NextResponse } from "next/server";
import { WhopServerSdk } from "@whop/api";

export async function GET() {
  const agentId = process.env.WHOP_AGENT_USER_ID;
  const apiKey = process.env.WHOP_API_KEY;
  const appId = process.env.NEXT_PUBLIC_WHOP_APP_ID;

  if (!agentId || !apiKey || !appId) {
    return NextResponse.json(
      {
        error: "Missing configuration",
        missing: {
          agentId: !agentId,
          apiKey: !apiKey,
          appId: !appId,
        },
      },
      { status: 500 }
    );
  }

  try {
    const whopSdk = WhopServerSdk({
      appApiKey: apiKey,
      appId: appId,
    });

    // Try to get agent user info
    const agentUser = await whopSdk.users.retrieve({ id: agentId });

    return NextResponse.json({
      success: true,
      agent: {
        id: agentId,
        username: agentUser.username,
        email: agentUser.email,
        configured: true,
      },
      sdk: {
        apiKey: apiKey.substring(0, 10) + "...",
        appId: appId,
      },
    });
  } catch (error: any) {
    console.error("Agent verification failed:", error);
    return NextResponse.json(
      {
        error: "Agent validation failed",
        details: error.message,
        agentId: agentId,
      },
      { status: 500 }
    );
  }
}