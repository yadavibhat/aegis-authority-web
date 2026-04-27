import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
export const dynamic = 'force-dynamic';
import { checkRole, maskData } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
    try {
        await checkRole();
        const url = new URL(req.url);
        const q = url.searchParams.get('q');
        let query = supabase.from('tourists').select('*');
        if (q) {
            query = query.ilike('name', `%${q}%`);
        }
        const { data: tourists } = await query;
        return NextResponse.json((tourists || []).map(maskData));
    } catch (e: unknown) {
        const error = e as Error;
        return NextResponse.json({ error: error.message }, { status: 403 });
    }
}
