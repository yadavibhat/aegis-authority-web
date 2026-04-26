import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content.strip() + '\n')

auth_utils = """
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function checkRole(req: NextRequest) {
    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role;
    if (role !== 'admin' && role !== 'police') {
        throw new Error("Unauthorized");
    }
}

export function maskData(tourist: any) {
    if (!tourist) return tourist;
    return {
        ...tourist,
        aadhaar: tourist.aadhaar ? 'XXXX-XXXX-' + tourist.aadhaar.slice(-4) : null,
        phone: tourist.phone ? 'XXXXXX' + tourist.phone.slice(-4) : null,
    };
}
"""

write_file('src/lib/auth-utils.ts', auth_utils)

route_admin_live = """
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole, maskData } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
    try {
        await checkRole(req);
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
"""
write_file('src/app/api/admin/live/route.ts', route_admin_live)


route_admin_alerts = """
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole, maskData } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
    try {
        await checkRole(req);
        const { data: alerts } = await supabase.from('alerts').select('*, tourist:tourists(*)');
        if (alerts) {
            alerts.forEach(a => {
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
"""
write_file('src/app/api/admin/alerts/route.ts', route_admin_alerts)


route_admin_tourists = """
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole, maskData } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
    try {
        await checkRole(req);
        const url = new URL(req.url);
        const q = url.searchParams.get('q');
        let query = supabase.from('tourists').select('*');
        if (q) {
            query = query.ilike('name', `%${q}%`);
        }
        const { data: tourists } = await query;
        return NextResponse.json((tourists || []).map(maskData));
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 403 });
    }
}
"""
write_file('src/app/api/admin/tourists/route.ts', route_admin_tourists)


route_admin_alerts_resolve = """
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await checkRole(req);
        const { id } = params;
        const { data, error } = await supabase.from('alerts').update({ status: 'RESOLVED' }).eq('id', id).select();
        if (error) throw new Error(error.message);
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 403 });
    }
}
"""
write_file('src/app/api/admin/alerts/[id]/resolve/route.ts', route_admin_alerts_resolve)


route_admin_efirs = """
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
    try {
        await checkRole(req);
        const body = await req.json();
        const { data, error } = await supabase.from('efirs').insert(body).select();
        if (error) throw new Error(error.message);
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 403 });
    }
}
"""
write_file('src/app/api/admin/efirs/route.ts', route_admin_efirs)


route_zones = """
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const active = url.searchParams.get('active');
        let query = supabase.from('zones').select('*');
        if (active === 'true') {
            query = query.eq('active', true);
        }
        const { data: zones } = await query;
        return NextResponse.json(zones);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 403 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await checkRole(req); // Admin role required to create zone
        const body = await req.json();
        const { data, error } = await supabase.from('zones').insert(body).select();
        if (error) throw new Error(error.message);
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 403 });
    }
}
"""
write_file('src/app/api/zones/route.ts', route_zones)


route_wearable = """
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

export async function GET(req: NextRequest, { params }: { params: { deviceId: string } }) {
    try {
        await checkRole(req);
        const { deviceId } = params;
        const { data: device, error } = await supabase.from('devices').select('*').eq('device_id', deviceId).single();
        if (error) throw new Error(error.message);
        return NextResponse.json(device);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 403 });
    }
}
"""
write_file('src/app/api/wearable/[deviceId]/route.ts', route_wearable)

print("Generated API endpoints successfully.")
