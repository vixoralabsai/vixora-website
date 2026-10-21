import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Client-side Supabase client using Anon public key
// Safe for browser use with Row-Level Security (RLS).
// Service role key must NEVER be used here.

function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

const rawUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  'https://xenjfszsppwqadgwzpxl.supabase.co';

const supabaseUrl = sanitizeSupabaseUrl(rawUrl as string);

const supabaseAnonKey = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_8xjidcETDkXfYSZpQU7t_Q_su_Pmil4').trim();

export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function isClientSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
