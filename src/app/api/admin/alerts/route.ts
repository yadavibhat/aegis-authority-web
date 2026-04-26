import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole, maskData } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
    try {
        await checkRole();
        const { data: alerts } = await supabase.from('alerts').select('*, tourist:tourists(*)');
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
