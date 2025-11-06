
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.success || authResult.tier !== 'enterprise') {
      return NextResponse.json(
        { error: 'You do not have permission to assign badges' },
        { status: 403 }
      );
    }

    const { user_id, badge_id, experience_id } = await req.json();

    if (!user_id || !badge_id || !experience_id) {
      return NextResponse.json(
        { error: 'user_id, badge_id, and experience_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('user_badges')
      .insert({ user_id, badge_id, experience_id });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error assigning badge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.success || authResult.tier !== 'enterprise') {
      return NextResponse.json(
        { error: 'You do not have permission to remove badges' },
        { status: 403 }
      );
    }

    const { user_id, badge_id, experience_id } = await req.json();

    if (!user_id || !badge_id || !experience_id) {
      return NextResponse.json(
        { error: 'user_id, badge_id, and experience_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('user_badges')
      .delete()
      .eq('user_id', user_id)
      .eq('badge_id', badge_id)
      .eq('experience_id', experience_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error removing badge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
