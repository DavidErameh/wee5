// app/api/cron/maintenance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Clean old activity logs (keep 90 days)
    const { count: deletedLogs } = await supabaseAdmin
      .from('activity_log')
      .delete()
      .lt('timestamp', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .select('count');

    // Clean old cron logs (keep 30 days)
    await supabaseAdmin
      .from('cron_logs')
      .delete()
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Update statistics
    await supabaseAdmin.rpc('maintain_database');

    // Log success
    await supabaseAdmin.from('cron_logs').insert({
      job_name: 'database_maintenance',
      status: 'success',
      last_executed: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      deletedLogs,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Maintenance job failed:', error);

    await supabaseAdmin.from('cron_logs').insert({
      job_name: 'database_maintenance',
      status: 'error',
      last_executed: new Date().toISOString(),
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { success: false, error: 'Maintenance failed' },
      { status: 500 }
    );
  }
}