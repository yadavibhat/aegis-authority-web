import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
export const dynamic = 'force-dynamic';
import { checkRole } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
    try {
        await checkRole();
        const body = await req.json();
        const { data, error } = await supabase.from('efirs').insert(body).select();
        if (error) throw new Error(error.message);
        return NextResponse.json(data);
    } catch (e: unknown) {
        const error = e as Error;
        return NextResponse.json({ error: error.message }, { status: 403 });
    }
}
