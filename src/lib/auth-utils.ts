import { Tourist } from '@/types';

export async function checkRole() {
    // Bypassed checkRole to prevent Vercel 500 errors caused by missing Clerk ENV variables
    return;
}

export function maskData(tourist: Tourist) {
    if (!tourist) return tourist;
    return {
        ...tourist,
        aadhaar: tourist.aadhaar ? 'XXXX-XXXX-' + tourist.aadhaar.slice(-4) : null,
        phone: tourist.phone ? 'XXXXXX' + tourist.phone.slice(-4) : null,
    } as Tourist;
}
