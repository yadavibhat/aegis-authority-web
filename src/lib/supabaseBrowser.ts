import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// A real Supabase client for frontend real-time subscriptions.
// Returns a placeholder if credentials are missing to avoid build errors.
const getBrowserClient = (): SupabaseClient => {
    const url = (supabaseUrl && supabaseUrl.startsWith('http')) ? supabaseUrl : 'https://placeholder.supabase.co';
    const key = supabaseAnonKey || 'placeholder';
    return createClient(url, key);
};

export const supabaseBrowser = getBrowserClient();
