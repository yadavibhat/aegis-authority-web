import { NextResponse, NextRequest } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
    try {
        const { deviceId } = await params;
        const { data: tourist, error: tourError } = await supabaseServiceRole.from('tourists').select('*').eq('device_id', deviceId).single();
        
        let targetTouristId: string;

        if (tourError || !tourist) {
            // Auto-fallback for demo
            const { data: newTourists } = await supabaseServiceRole.from('tourists').insert({
                device_id: deviceId, 
                name: 'DEMO TOURIST', 
                active: true, 
                lat: 28.6149, 
                lng: 77.2100
            }).select('*');
            
            if (!newTourists || newTourists.length === 0) throw new Error("Failed to resolve tourist.");
            targetTouristId = newTourists[0].id;
        } else {
            targetTouristId = tourist.id;
        }

        await supabaseServiceRole.from('alerts').insert({
            tourist_id: targetTouristId,
            status: 'OPEN',
            type: 'PANIC',
            latitude: 28.6149,
            longitude: 77.2100,
            resolved: false
        });

        return NextResponse.json({ success: true, message: 'Hardware ping successful.' });
    } catch (e: unknown) {
        const error = e as Error;
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
