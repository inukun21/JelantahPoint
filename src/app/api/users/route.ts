import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/jsonDB';

export async function GET() {
    try {
        const db = readDB();
        const users = db.users || [];
        // Return users without passwords for security
        const safeUsers = users.map((u: any) => {
            const { password, ...rest } = u;
            return rest;
        });
        return NextResponse.json(safeUsers);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const newUser = await request.json();
        const db = readDB();
        const users = db.users || [];

        // Check for duplicates
        if (users.some((u: any) => u.username === newUser.username || u.email === newUser.email)) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        // Assign ID if not present
        if (!newUser.id) {
            newUser.id = Date.now();
        }

        const updatedUsers = [...users, newUser];
        const updatedDB = { ...db, users: updatedUsers };

        if (writeDB(updatedDB)) {
            // Remove password from response
            const { password, ...safeUser } = newUser;
            return NextResponse.json(safeUser, { status: 201 });
        } else {
            return NextResponse.json({ error: 'Failed to write to database' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
}
