import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client using Service Role Key
// Gives full access on backend for API endpoints, bypassing public RLS safely.
// Never expose this key or client to the browser/client-side bundles.

function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  // Strip trailing /rest/v1 or /rest/v1/ or trailing slashes to prevent 404s
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

let supabaseAdminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAdminClient;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}
