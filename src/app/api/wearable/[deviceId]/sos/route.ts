import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
    try {
        // Resolve associated tourist via simulated DB logic
        const { deviceId } = await params;
        let { data: tourist, error: tourError } = await supabase.from('tourists').select('*').eq('device_id', deviceId).single();
        
        // VERCEL LAMBDA BYPASS: If the pairing API fired on a different serverless instance, 
        // the memory cache will be empty. We auto-generate the profile here to ensure stateless persistence!
        if (tourError || !tourist) {
            const { data: newTourist } = await supabase.from('tourists').insert({
                aadhaar: '3456-7890-1234', device_id: deviceId, name: 'DEMO TOURIST', active: true, lat: 28.6149, lng: 77.2100
            }).select('*');
            tourist = newTourist[0];
        }

        // Insert new emergency alert for the dashboard to scoop up!
        await supabase.from('alerts').insert({
            tourist_id: tourist.id,
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
