
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.success || authResult.tier !== 'enterprise') {
      return NextResponse.json(
        { error: 'You do not have permission to create badges' },
        { status: 403 }
      );
    }

    const { name, image_url, experience_id } = await req.json();

    if (!name || !image_url || !experience_id) {
      return NextResponse.json(
        { error: 'name, image_url, and experience_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('badges')
      .insert({ name, image_url, experience_id });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error creating badge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const experience_id = searchParams.get('experience_id');

    if (!experience_id) {
      return NextResponse.json(
        { error: 'experience_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('badges')
      .select('*')
      .eq('experience_id', experience_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ badges: data });

  } catch (error) {
    console.error('Error fetching badges:', error);
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
        { error: 'You do not have permission to delete badges' },
        { status: 403 }
      );
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('badges')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting badge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
