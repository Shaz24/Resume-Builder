// ─── Supabase Browser Client ─────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn('⚠️ Supabase URL not configured. Add VITE_SUPABASE_URL to .env.local — running in offline mode.');
}

// createClient handles missing keys gracefully for offline dev
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_anon_key'
);

// ─── Edge Function caller ─────────────────────────────────────────────────────
export async function callEdgeFunction(name, body) {
  if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
    throw new Error(`Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local`);
  }

  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(error.message || `Edge function ${name} failed`);
  if (data?.error) throw new Error(data.error);
  return data?.data ?? data;
}

// ─── Check if Supabase is configured ─────────────────────────────────────────
export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' && supabaseAnonKey && supabaseAnonKey !== 'your_anon_key_here');
