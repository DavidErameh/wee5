import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Generic Database interface for basic operations
interface Database {
  public: {
    Tables: Record<string, {
      Row: Record<string, unknown>;
      Insert: Record<string, unknown>;
      Update: Record<string, unknown>;
    }>;
    Functions: Record<string, {
      Args: Record<string, unknown>;
      Returns: unknown;
    }>;
  };
}

// Initialize Supabase clients with lazy loading to avoid module-level errors
// The actual clients will be created when environment variables are available
let _supabaseAdmin: SupabaseClient<Database> | null = null;
let _supabase: SupabaseClient<Database> | null = null;

/**
 * SERVER-ONLY: Use service role key for admin operations
 * This function should only be called on the server-side
 */
export const supabaseAdmin = (): SupabaseClient<Database> => {
  // Runtime check to ensure this function is only called on the server
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin can only be called on the server-side');
  }

  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      throw new Error('Missing SUPABASE_URL environment variable');
    }
    if (!serviceRoleKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    }

    _supabaseAdmin = createClient<Database>(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  return _supabaseAdmin;
};

/**
 * CLIENT-SAFE: Use anonymous key for client operations
 * This function can be safely called on both client and server
 */
export const supabase = (): SupabaseClient<Database> => {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    }
    if (!supabaseAnonKey) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    }

    _supabase = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey
    );
  }
  return _supabase;
};
