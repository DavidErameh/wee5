// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {
      database: 'unknown',
      redis: 'unknown',
      whop: 'unknown',
    },
    version: process.env.npm_package_version || '1.0.0',
  };

  try {
    // Check database
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    checks.services.database = dbError ? 'unhealthy' : 'healthy';

    // Check Redis
    try {
      await redis().ping();
      checks.services.redis = 'healthy';
    } catch {
      checks.services.redis = 'unhealthy';
    }

    // Check Whop API
    try {
      const whopResponse = await fetch('https://api.whop.com/v5/me', {
        headers: {
          'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
        },
      });
      checks.services.whop = whopResponse.ok ? 'healthy' : 'unhealthy';
    } catch {
      checks.services.whop = 'unhealthy';
    }

    // Overall status
    const allHealthy = Object.values(checks.services).every(s => s === 'healthy');
    checks.status = allHealthy ? 'healthy' : 'degraded';

    return NextResponse.json(checks, {
      status: allHealthy ? 200 : 503,
    });

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { ...checks, status: 'unhealthy', error: 'Health check failed' },
      { status: 503 }
    );
  }
}