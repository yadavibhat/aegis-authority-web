import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole, maskData } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await checkRole();
        // Specifically avoid the relational foreign key inner-join since the user's live DB may lack it
        const { data: rawAlerts, error: alertsError } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
        const { data: rawTourists } = await supabase.from('tourists').select('*');
        
        if (alertsError) {
            console.error("Supabase Alerts Query Error:", alertsError);
            return NextResponse.json([]);
        }

        const alerts = (rawAlerts || []).map((alert: any) => ({
            ...alert,
            tourist: (rawTourists || []).find((t: any) => t.id === alert.tourist_id) || {
                name: 'UNKNOWN SUBJECT',
                device_id: 'UNKNOWN'
            }
        }));

        if (alerts) {
            alerts.forEach((a: any) => {
                if (a.tourist) { 
                    if (Array.isArray(a.tourist)) {
                        a.tourist = a.tourist.map(maskData);
                    } else {
                        a.tourist = maskData(a.tourist);
                    }
                }
            });
        }
        return NextResponse.json(alerts);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 403 });
    }
}
