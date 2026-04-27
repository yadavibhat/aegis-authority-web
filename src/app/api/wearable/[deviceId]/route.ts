import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
export const dynamic = 'force-dynamic';
import { checkRole } from '@/lib/auth-utils';

export async function GET(req: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
    try {
        await checkRole();
        const { deviceId } = await params;
        const { data: device, error } = await supabase.from('devices').select('*').eq('device_id', deviceId).single();
        if (error) throw new Error(error.message);
        return NextResponse.json(device);
    } catch (e: unknown) {
        const error = e as Error;
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
