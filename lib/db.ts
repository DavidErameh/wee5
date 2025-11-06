import { createClient } from '@supabase/supabase-js';

// Initialize Supabase clients with lazy loading to avoid module-level errors
// The actual clients will be created when environment variables are available
let _supabaseAdmin: any = null;
let _supabase: any = null;

export const supabaseAdmin = () => {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl) {
      throw new Error('Missing SUPABASE_URL environment variable');
    }
    if (!serviceRoleKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    }
    
    _supabaseAdmin = createClient(
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

export const supabase = () => {
  if (!_supabase) {
    // Support both NEXT_PUBLIC_ prefixed (client-side) and non-prefixed (server-side) variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable');
    }
    if (!supabaseAnonKey) {
      throw new Error('Missing SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    }
    
    _supabase = createClient(
      supabaseUrl,
      supabaseAnonKey
    );
  }
  return _supabase;
};
