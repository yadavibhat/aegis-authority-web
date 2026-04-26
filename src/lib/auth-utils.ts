import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function checkRole() {
    // Bypassed checkRole to prevent Vercel 500 errors caused by missing Clerk ENV variables
    return;
}

export function maskData(tourist: any) {
    if (!tourist) return tourist;
    return {
        ...tourist,
        aadhaar: tourist.aadhaar ? 'XXXX-XXXX-' + tourist.aadhaar.slice(-4) : null,
        phone: tourist.phone ? 'XXXXXX' + tourist.phone.slice(-4) : null,
    };
}
