
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const CompanySchema = z.object({
  enterprise_id: z.string().uuid(),
  company_id: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Apply rate limit
    const isRateLimited = await checkRateLimit(`enterprise_companies_add:${authResult.userId}`, 5); // 5 requests per minute
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = CompanySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { enterprise_id, company_id } = validation.data;

    // Check if the user owns the enterprise
    const { data: enterprise, error: enterpriseError } = await supabaseAdmin
      .from('enterprises')
      .select('owner_id')
      .eq('id', enterprise_id)
      .single();

    if (enterpriseError || !enterprise || enterprise.owner_id !== authResult.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this enterprise' },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('enterprise_companies')
      .insert({ enterprise_id, company_id });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('Error adding company to enterprise:', error);
    if (error instanceof Error && 'code' in error && typeof error.code === 'string' && error.code.startsWith('PGRST')) {
        return NextResponse.json({ error: 'A database error occurred while adding the company to the enterprise.' }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred while adding the company to the enterprise.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Apply rate limit
    const isRateLimited = await checkRateLimit(`enterprise_companies_remove:${authResult.userId}`, 5); // 5 requests per minute
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = CompanySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { enterprise_id, company_id } = validation.data;

    // Check if the user owns the enterprise
    const { data: enterprise, error: enterpriseError } = await supabaseAdmin
      .from('enterprises')
      .select('owner_id')
      .eq('id', enterprise_id)
      .single();

    if (enterpriseError || !enterprise || enterprise.owner_id !== authResult.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this enterprise' },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('enterprise_companies')
      .delete()
      .eq('enterprise_id', enterprise_id)
      .eq('company_id', company_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('Error removing company from enterprise:', error);
    if (error instanceof Error && 'code' in error && typeof error.code === 'string' && error.code.startsWith('PGRST')) {
        return NextResponse.json({ error: 'A database error occurred while removing the company from the enterprise.' }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred while removing the company from the enterprise.' },
      { status: 500 }
    );
  }
}
