import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole, maskData } from '@/lib/auth-utils';
import { Alert, Tourist, Location, Zone } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await checkRole();
        
        // 1. Fetch alerts and normalize them
        const { data: rawAlerts } = await supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(100);
        const alerts: Alert[] = (rawAlerts || []).map(a => {
            const typeUpper = (a.type || '').toUpperCase();
            const isPanic = ['PANIC', 'SOS', 'FALL_DETECTED', 'FALL'].includes(typeUpper);
            // The DB column is actually 'resolved' (boolean)
            const isOpen = a.resolved === false || a.resolved === null;
            const status = isOpen ? 'OPEN' : 'RESOLVED';
            
            return {
                ...a,
                status,
                isPanic
            } as Alert;
        });

        // 2. Fetch tourists and their latest locations
        const { data: touristsData } = await supabase.from('tourists').select('*');
        const { data: locations } = await supabase.from('locations').select('*').order('created_at', { ascending: false });
        
        const tourists: Tourist[] = (touristsData || []).map(t => {
            const latestLoc = (locations || []).find((l: Location) => l.tourist_id === t.id);
            return maskData({
                ...t,
                latitude: latestLoc?.latitude || t.lat || null,
                longitude: latestLoc?.longitude || t.lng || null,
                hasActivePanic: alerts.some((a: Alert) => a.tourist_id === t.id && a.status === 'OPEN' && a.isPanic)
            }) as Tourist;
        });

        // 3. Fetch zones
        const { data: zones } = await supabase.from('zones').select('*');

        return NextResponse.json({ 
            alerts, 
            tourists: tourists.filter((t: Tourist) => t.latitude && t.longitude), // Only return tourists with real coordinates
            zones: (zones || []).map((z: Zone) => ({
                ...z,
                center_lat: z.center_lat || 28.6149, // Fallback to New Delhi if missing
                center_lng: z.center_lng || 77.2100
            }))
        });
    } catch (e: unknown) {
        console.error("Live API Error:", e);
        const message = e instanceof Error ? e.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 403 });
    }
}
