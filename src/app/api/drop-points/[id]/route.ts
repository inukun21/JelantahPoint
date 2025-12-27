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
        const dropPoints = db.dropPoints || [];

        const index = dropPoints.findIndex((dp: any) => dp.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Drop Point not found' }, { status: 404 });
        }

        const updatedPoint = { ...dropPoints[index], ...updates };
        dropPoints[index] = updatedPoint;

        const updatedDB = { ...db, dropPoints };

        if (writeDB(updatedDB)) {
            return NextResponse.json(updatedPoint);
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
        const dropPoints = db.dropPoints || [];

        const filteredPoints = dropPoints.filter((dp: any) => dp.id !== id);

        if (dropPoints.length === filteredPoints.length) {
            return NextResponse.json({ error: 'Drop Point not found' }, { status: 404 });
        }

        const updatedDB = { ...db, dropPoints: filteredPoints };

        if (writeDB(updatedDB)) {
            return NextResponse.json({ message: 'Drop Point deleted' });
        } else {
            return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
