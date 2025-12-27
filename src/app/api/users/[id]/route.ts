import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/jsonDB';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = Number((await params).id);
        const updates = await request.json();
        const db = readDB();
        const users = db.users || [];

        const index = users.findIndex((u: any) => u.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updatedUser = { ...users[index], ...updates };
        users[index] = updatedUser;

        const updatedDB = { ...db, users };

        if (writeDB(updatedDB)) {
            const { password, ...safeUser } = updatedUser;
            return NextResponse.json(safeUser);
        } else {
            return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = Number((await params).id);
        const db = readDB();
        const users = db.users || [];

        const filteredUsers = users.filter((u: any) => u.id !== id);

        if (users.length === filteredUsers.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updatedDB = { ...db, users: filteredUsers };

        if (writeDB(updatedDB)) {
            return NextResponse.json({ message: 'User deleted' });
        } else {
            return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
