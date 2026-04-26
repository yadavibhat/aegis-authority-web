import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

export async function GET(req: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
    try {
        await checkRole();
        const { deviceId } = await params;
        const { data: device, error } = await supabase.from('devices').select('*').eq('device_id', deviceId).single();
        if (error) throw new Error(error.message);
        return NextResponse.json(device);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 403 });
    }
}
