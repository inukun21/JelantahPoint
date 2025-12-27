import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/jsonDB';
import { cookies } from 'next/headers';

export async function GET() {
    const data = readDB();
    return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
    try {
        const newData = await request.json();
        const currentDB = readDB();

        // RBAC Check
        // products, dropPoints: Admin only
        const restrictedKeys = ['products', 'dropPoints'];
        const keysToUpdate = Object.keys(newData);
        const requiresAdmin = keysToUpdate.some(key => restrictedKeys.includes(key));

        if (requiresAdmin) {
            const cookieStore = await cookies(); // cookieStore is a Promise in Next 15/latest, await it just in case or use it if already awaited
            // Check if using next/headers cookies() which returns a ReadonlyRequestCookies
            // In some versions cookies() is async.
            const sessionToken = (await cookies()).get('admin_session');

            let isAdmin = false;
            if (sessionToken) {
                try {
                    const sessionData = JSON.parse(
                        Buffer.from(sessionToken.value, 'base64').toString()
                    );
                    if (sessionData.role === 'admin') {
                        isAdmin = true;
                    }
                } catch (e) {
                    // ignore invalid token
                }
            }

            if (!isAdmin) {
                return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 403 });
            }
        }

        // Simple deep merge or replacement based on keys
        const updatedDB = { ...currentDB, ...newData };

        if (writeDB(updatedDB)) {
            return NextResponse.json({ success: true, data: updatedDB });
        } else {
            return NextResponse.json({ success: false, error: 'Failed to write to DB' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
    }
}
