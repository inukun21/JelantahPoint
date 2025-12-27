import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/jsonDB';

export async function GET(request: NextRequest) {
  try {
    const db = readDB();
    const dropPoints = db.dropPoints || [];

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    if (search) {
      const searchTerm = search.toLowerCase();
      const filtered = dropPoints.filter((dp: any) =>
        dp.name.toLowerCase().includes(searchTerm) ||
        dp.address.toLowerCase().includes(searchTerm)
      );
      return NextResponse.json(filtered);
    }

    return NextResponse.json(dropPoints);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newPoint = await request.json();
    const db = readDB();
    const dropPoints = db.dropPoints || [];

    if (!newPoint.id) {
      newPoint.id = Date.now();
    }

    const updatedPoints = [...dropPoints, newPoint];
    const updatedDB = { ...db, dropPoints: updatedPoints };

    if (writeDB(updatedDB)) {
      return NextResponse.json(newPoint, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to write to database' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
  }
}