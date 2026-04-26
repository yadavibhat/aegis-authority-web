import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // Mock Credentials Table
        const validUsers = {
            'admin123': { password: 'password', role: 'admin', name: 'Chief Director' },
            'officer456': { password: 'secure', role: 'police', name: 'S. Rathore' },
            'demo': { password: 'demo', role: 'demo', name: 'Demo User' },
        };

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const user = validUsers[username as keyof typeof validUsers];
        if (user && user.password === password) {
            // Simulated token generation
            return NextResponse.json({
                message: 'Authentication successful',
                token: 'mock_jwt_token_123',
                user: {
                    id: username,
                    name: user.name,
                    role: user.role
                }
            });
        }

        return NextResponse.json({ error: 'Invalid credentials. Please verify your Service ID.' }, { status: 401 });

    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
