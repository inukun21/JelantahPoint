import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/jsonDB';

export async function GET(request: NextRequest) {
  try {
    const db = readDB();
    const depositRequests = db.depositRequests || [];

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (userId) {
      const filtered = depositRequests.filter((d: any) => d.userId === Number(userId));
      return NextResponse.json(filtered);
    }

    return NextResponse.json(depositRequests);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newRequest = await request.json();
    const db = readDB();
    const depositRequests = db.depositRequests || [];

    if (!newRequest.id) {
      newRequest.id = Date.now();
    }

    const updatedRequests = [newRequest, ...depositRequests]; // Prepend new requests
    const updatedDB = { ...db, depositRequests: updatedRequests };

    if (writeDB(updatedDB)) {
      return NextResponse.json(newRequest, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to write to database' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
  }
}