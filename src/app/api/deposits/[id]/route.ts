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
        const depositRequests = db.depositRequests || [];

        const index = depositRequests.findIndex((d: any) => d.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Deposit Request not found' }, { status: 404 });
        }

        const updatedRequest = { ...depositRequests[index], ...updates };
        depositRequests[index] = updatedRequest;

        const updatedDB = { ...db, depositRequests };

        if (writeDB(updatedDB)) {
            return NextResponse.json(updatedRequest);
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
        const depositRequests = db.depositRequests || [];

        const filteredRequests = depositRequests.filter((d: any) => d.id !== id);

        if (depositRequests.length === filteredRequests.length) {
            return NextResponse.json({ error: 'Deposit Request not found' }, { status: 404 });
        }

        const updatedDB = { ...db, depositRequests: filteredRequests };

        if (writeDB(updatedDB)) {
            return NextResponse.json({ message: 'Deposit Request deleted' });
        } else {
            return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
