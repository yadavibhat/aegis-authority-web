import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
    try {
        // Resolve associated tourist via simulated DB logic
        const { deviceId } = await params;
        const { data: device, error: devError } = await supabase.from('devices').select('*').eq('device_id', deviceId).single();
        
        if (devError || !device) {
            return NextResponse.json({ error: "Device hardware not registered" }, { status: 404 });
        }

        // Insert new emergency alert for the dashboard to scoop up!
        await supabase.from('alerts').insert({
            tourist_id: device.tourist_id,
            status: 'OPEN',
            type: 'WEARABLE MOCK SOS',
            latitude: 28.6149,
            longitude: 77.2100
        });

        return NextResponse.json({ success: true, message: 'Hardware ping successful.' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
