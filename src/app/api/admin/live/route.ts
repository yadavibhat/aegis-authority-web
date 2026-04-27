import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole, maskData } from '@/lib/auth-utils';
import { Alert, Tourist, Location, Zone } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await checkRole();
        
        // 1. Fetch alerts and normalize them
        const { data: rawAlerts, error: alertsError } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
        if (alertsError) {
            console.error("Alerts Query Error:", alertsError);
            throw new Error(`Failed to fetch alerts: ${alertsError.message}`);
        }

        const alerts: Alert[] = (rawAlerts || []).map(a => {
            const typeUpper = (a.type || '').toUpperCase();
            const isPanic = ['PANIC', 'SOS', 'FALL_DETECTED', 'FALL'].includes(typeUpper);
            const isOpen = a.resolved === false || a.resolved === null;
            const status = isOpen ? 'OPEN' : 'RESOLVED';
            
            return {
                ...a,
                status,
                isPanic
            } as Alert;
        });

        // 2. Fetch tourists and their latest locations
        const { data: touristsData, error: touristsError } = await supabase.from('tourists').select('*');
        if (touristsError) {
            console.error("Tourists Query Error:", touristsError);
            throw new Error(`Failed to fetch tourists: ${touristsError.message}`);
        }

        const { data: locations, error: locationsError } = await supabase.from('locations').select('*').order('created_at', { ascending: false });
        if (locationsError) {
            console.warn("Locations Query Error (Non-critical):", locationsError);
            // We can continue even if breadcrumbs fail
        }
        
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
        const { data: zones, error: zonesError } = await supabase.from('zones').select('*');
        if (zonesError) {
            console.warn("Zones Query Error (Non-critical):", zonesError);
        }

        return NextResponse.json({ 
            alerts, 
            tourists: tourists.filter((t: Tourist) => t.latitude && t.longitude),
            zones: (zones || []).map((z: Zone) => ({
                ...z,
                center_lat: z.center_lat || 28.6149,
                center_lng: z.center_lng || 77.2100
            }))
        });
    } catch (e: unknown) {
        console.error("LIVE API CRITICAL FAILURE:", e);
        const message = e instanceof Error ? e.message : 'Unknown internal error';
        return NextResponse.json({ error: message }, { status: 500 }); // Return 500 for actual errors
    }
}
