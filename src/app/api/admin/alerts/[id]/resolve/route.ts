import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await checkRole();
        const { id } = await params;
        const { data, error } = await supabase.from('alerts').update({ status: 'RESOLVED' }).eq('id', id).select();
        if (error) throw new Error(error.message);
        return NextResponse.json(data);
    } catch (e: unknown) {
        const error = e as Error;
        return NextResponse.json({ error: error.message || 'Forbidden' }, { status: 403 });
    }
}
