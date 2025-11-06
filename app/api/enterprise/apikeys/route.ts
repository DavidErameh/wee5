
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { randomBytes } from 'crypto';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const ApiKeySchema = z.object({
  enterprise_id: z.string().uuid(),
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
    const isRateLimited = await checkRateLimit(`enterprise_apikeys_create:${authResult.userId}`, 2); // 2 requests per minute
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = ApiKeySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { enterprise_id } = validation.data;

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

    const key = randomBytes(32).toString('hex');

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .insert({ enterprise_id, key });

    if (error) {
      throw error;
    }

    return NextResponse.json({ apiKey: key });

  } catch (error: unknown) {
    console.error('Error generating API key:', error);
    if (error instanceof Error && 'code' in error && typeof error.code === 'string' && error.code.startsWith('PGRST')) {
        return NextResponse.json({ error: 'A database error occurred while generating the API key.' }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating the API key.' },
      { status: 500 }
    );
  }
}

const ApiKeyGetSchema = z.object({
  enterprise_id: z.string().uuid(),
});

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Apply rate limit
    const isRateLimited = await checkRateLimit(`enterprise_apikeys_get:${authResult.userId}`, 10); // 10 requests per minute
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const validation = ApiKeyGetSchema.safeParse({
      enterprise_id: searchParams.get('enterprise_id'),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { enterprise_id } = validation.data;

    // Check if the user owns the enterprise
    const { data: enterprise, error: enterpriseError } = await supabaseAdmin
      .from('enterprises')
      .select('owner_id')
      .eq('id', enterprise_id)
      .single();

    if (enterpriseError || !enterprise || enterprise.owner_id !== authResult.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to view these API keys' },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('id,created_at')
      .eq('enterprise_id', enterprise_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ apiKeys: data });

  } catch (error: unknown) {
    console.error('Error fetching API keys:', error);
    if (error instanceof Error && 'code' in error && typeof error.code === 'string' && error.code.startsWith('PGRST')) {
        return NextResponse.json({ error: 'A database error occurred while fetching the API keys.' }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the API keys.' },
      { status: 500 }
    );
  }
}

const ApiKeyDeleteSchema = z.object({
  key: z.string().min(1),
});

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
    const isRateLimited = await checkRateLimit(`enterprise_apikeys_delete:${authResult.userId}`, 5); // 5 requests per minute
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = ApiKeyDeleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { key } = validation.data;

    // Get the enterprise_id from the key
    const { data: apiKey, error: apiKeyError } = await supabaseAdmin
      .from('api_keys')
      .select('enterprise_id')
      .eq('key', key)
      .single();

    if (apiKeyError || !apiKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 404 }
      );
    }

    // Check if the user owns the enterprise
    const { data: enterprise, error: enterpriseError } = await supabaseAdmin
      .from('enterprises')
      .select('owner_id')
      .eq('id', apiKey.enterprise_id)
      .single();

    if (enterpriseError || !enterprise || enterprise.owner_id !== authResult.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this API key' },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .delete()
      .eq('key', key);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('Error revoking API key:', error);
    if (error instanceof Error && 'code' in error && typeof error.code === 'string' && error.code.startsWith('PGRST')) {
        return NextResponse.json({ error: 'A database error occurred while revoking the API key.' }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred while revoking the API key.' },
      { status: 500 }
    );
  }
}
