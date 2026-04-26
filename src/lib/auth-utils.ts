import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function checkRole() {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as any)?.role;
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
