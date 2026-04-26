import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
    try {
        await checkRole();
        const body = await req.json();
        const { data, error } = await supabase.from('efirs').insert(body).select();
        if (error) throw new Error(error.message);
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 403 });
    }
}
