import { NextResponse } from 'next/server';
import { supabase as supabaseServiceRole } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

// This API allows the Mobile Phone App to dynamically sync a tourist's full profile
// and link it to a specific BLE watch device ID when they log into the app.
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { device_id, name, lat, lng, active } = body;

        // Ensure the absolute bare minimum identity is provided
        if (!device_id) {
            return NextResponse.json({ error: 'Missing required parameters. Need device_id.' }, { status: 400 });
        }

        // Create the payload of everything the app sent over
        // Create the payload of everything the app sent over
        const payload: { device_id: string; name?: string; lat?: number; lng?: number; active?: boolean } = {
            device_id: device_id,
        };
        
        // Optionally attach any extra details the mobile app collected on login
        if (name) payload.name = name;
        if (lat !== undefined) payload.lat = lat;
        if (lng !== undefined) payload.lng = lng;
        if (active !== undefined) payload.active = active;

        // Search for the tourist in the database by their Aadhaar / Unique ID
        const { data: tourists, error: searchError } = await supabaseServiceRole
            .from('tourists')
            .select('*')
            .eq('device_id', device_id);

        if (searchError) throw searchError;

        if (!tourists || tourists.length === 0) {
            // The tourist does not exist yet! The mobile app is logging them in for the very first time.
            // We will INSERT them cleanly into the registry.
            const { error: insertError } = await supabaseServiceRole
                .from('tourists')
                .insert([payload]);
                
            if (insertError) throw insertError;
            return NextResponse.json({ 
                success: true, 
                message: `New tourist registered and paired successfully to hardware ${device_id}!` 
            }, { status: 201 });
        }

        // If they already exist, we UPDATE their existing profile with whatever new data the app passed in.
        const tourist = tourists[0];
        const { error: updateError } = await supabaseServiceRole
            .from('tourists')
            .update(payload)
            .eq('id', tourist.id);

        if (updateError) throw updateError;

        return NextResponse.json({ 
            success: true, 
            message: `Existing tourist profile updated and linked successfully to hardware ${device_id}!` 
        }, { status: 200 });

    } catch (e: unknown) {
        const error = e as Error;
        console.error("BLE PAIRING API ERROR:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
