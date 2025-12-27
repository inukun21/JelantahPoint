import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('admin_session');

        if (!sessionToken) {
            return NextResponse.json(
                { authenticated: false },
                { status: 401 }
            );
        }

        // Verify session token
        try {
            const sessionData = JSON.parse(
                Buffer.from(sessionToken.value, 'base64').toString()
            );

            // Check if session is still valid (24 hours)
            const sessionAge = Date.now() - sessionData.timestamp;
            const maxAge = 60 * 60 * 24 * 1000; // 24 hours in milliseconds

            if (sessionAge > maxAge) {
                cookieStore.delete('admin_session');
                return NextResponse.json(
                    { authenticated: false, error: 'Session expired' },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                {
                    authenticated: true,
                    username: sessionData.username,
                    role: sessionData.role
                },
                { status: 200 }
            );
        } catch (error) {
            cookieStore.delete('admin_session');
            return NextResponse.json(
                { authenticated: false, error: 'Invalid session' },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
