import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

let supabaseInstance: SupabaseClient | null = null;
let supabaseServiceRoleInstance: SupabaseClient | null = null;

// Default client for public/semi-public browser-like queries (honors RLS)
export const getSupabase = () => {
    if (!supabaseInstance) {
        // Ensure valid URL format for createClient to avoid "supabaseUrl is required" error
        const url = (supabaseUrl && supabaseUrl.startsWith('http')) ? supabaseUrl : 'https://placeholder.supabase.co';
        const key = supabaseKey || 'placeholder';
        
        if (url === 'https://placeholder.supabase.co') {
            console.warn("Supabase credentials missing or invalid. Returning placeholder client for build/SSR.");
        }
        
        supabaseInstance = createClient(url, key);
    }
    return supabaseInstance;
};

// Administrative client for backend-only master operations (bypasses RLS)
export const getSupabaseServiceRole = () => {
    if (!supabaseServiceRoleInstance) {
        const url = (supabaseUrl && supabaseUrl.startsWith('http')) ? supabaseUrl : 'https://placeholder.supabase.co';
        const key = serviceRoleKey || 'placeholder';

        if (url === 'https://placeholder.supabase.co' || key === 'placeholder') {
            console.warn("Supabase Service Role credentials missing or invalid. Returning placeholder client for build/SSR.");
        }

        supabaseServiceRoleInstance = createClient(url, key);
    }
    return supabaseServiceRoleInstance;
};

// For backward compatibility with existing imports where possible,
// we export Proxy objects that behave like the clients but initialize on first method call.
export const supabase = new Proxy({} as SupabaseClient, {
    get: (target, prop) => {
        const client = getSupabase();
        return (client as any)[prop];
    }
});

export const supabaseServiceRole = new Proxy({} as SupabaseClient, {
    get: (target, prop) => {
        const client = getSupabaseServiceRole();
        return (client as any)[prop];
    }
});
