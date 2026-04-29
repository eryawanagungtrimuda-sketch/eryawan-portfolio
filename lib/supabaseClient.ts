import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseClient =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    throw new Error('Admin system belum dikonfigurasi. Silakan setup Supabase environment variables.');
  }

  return supabaseClient;
}

export const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'eryawanagungtrimuda@gmail.com';
