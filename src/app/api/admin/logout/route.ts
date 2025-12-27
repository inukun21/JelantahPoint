import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('admin_session');

        return NextResponse.json(
            { success: true, message: 'Logout berhasil' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
