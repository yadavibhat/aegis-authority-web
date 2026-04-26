import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const active = url.searchParams.get('active');
        let query = supabase.from('zones').select('*');
        if (active === 'true') {
            query = query.eq('active', true);
        }
        const { data: zones } = await query;
        return NextResponse.json(zones);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 403 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await checkRole(); // Admin role required to create zone
        const body = await req.json();
        const { data, error } = await supabase.from('zones').insert(body).select();
        if (error) throw new Error(error.message);
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 403 });
    }
}
