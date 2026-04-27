import { NextResponse, NextRequest } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await checkRole();
        const { id } = await params;
        const { data, error } = await supabaseServiceRole.from('alerts').update({ 
            status: 'RESOLVED',
            resolved: true 
        }).eq('id', id).select();
        
        if (error) {
            console.error("Supabase Resolve Error:", error);
            throw new Error(error.message);
        }
        return NextResponse.json(data);
    } catch (e: unknown) {
        const error = e as Error;
        console.error("Administrative Resolution Failure:", error);
        return NextResponse.json({ error: error.message || 'Forbidden' }, { status: 403 });
    }
}
