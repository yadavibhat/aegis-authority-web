import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Default client for public/semi-public browser-like queries (honors RLS)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Administrative client for backend-only master operations (bypasses RLS)
export const supabaseServiceRole = createClient(supabaseUrl, serviceRoleKey);
