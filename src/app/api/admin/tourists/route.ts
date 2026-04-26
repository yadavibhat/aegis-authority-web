import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
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
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 403 });
    }
}
