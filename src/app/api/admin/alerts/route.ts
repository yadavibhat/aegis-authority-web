import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole, maskData } from '@/lib/auth-utils';
import { Alert, Tourist } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request) {
    try {
        await checkRole();
        // Specifically avoid the relational foreign key inner-join since the user's live DB may lack it
        const { data: rawAlerts, error: alertsError } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
        const { data: rawTourists } = await supabase.from('tourists').select('*');
        
        if (alertsError) {
            console.error("Supabase Alerts Query Error:", alertsError);
            return NextResponse.json([]);
        }

        const alerts = (rawAlerts || []).map((alert: Alert) => {
            const tour = (rawTourists || []).find((t: Tourist) => t.id === alert.tourist_id);
            return {
                ...alert,
                tourist: tour ? maskData(tour) : {
                    name: 'UNKNOWN SUBJECT',
                    device_id: 'UNKNOWN'
                }
            };
        });

        return NextResponse.json(alerts);
    } catch {
        return NextResponse.json({ error: 'Auth failed' }, { status: 401 });
    }
}
