import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
    try {
        const { deviceId } = await params;
        const { data: tourist, error } = await supabase.from('tourists').select('*').eq('device_id', deviceId).single();
        
        if (error || !tourist) {
            return NextResponse.json({ error: "No tourist linked to this device" }, { status: 404 });
        }

        return NextResponse.json({ tourist });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
