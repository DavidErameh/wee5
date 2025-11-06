import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const experienceId = searchParams.get('experienceId');

    if (!experienceId) {
      return NextResponse.json({ error: 'experienceId is required' }, { status: 400 });
    }

    // Get Supabase client
    const supabaseClient = supabase();

    // Try to fetch users
    const { data, error, count } = await supabaseClient
      .from('users')
      .select('*', { count: 'exact' })
      .eq('experience_id', experienceId)
      .limit(10);

    return NextResponse.json({
      success: !error,
      error: error ? {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      } : null,
      data: data || [],
      count: count || 0,
      experienceId,
      timestamp: new Date().toISOString(),
    });

  } catch (error: unknown) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
