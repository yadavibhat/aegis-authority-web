import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole, maskData } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await checkRole();
        // Mock query for live data (tourists + locations + alerts + zones)
        const { data: alerts } = await supabase.from('alerts').select('*').limit(50);
        const { data: touristsData } = await supabase.from('tourists').select('*').limit(50);
        const { data: zones } = await supabase.from('zones').select('*');
        const { data: locations } = await supabase.from('locations').select('*').order('created_at', { ascending: false }).limit(200);
        
        const tourists = touristsData?.map(maskData);

        return NextResponse.json({ alerts, tourists, locations, zones });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 403 });
    }
}
