import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/jsonDB';

export async function GET() {
    try {
        const db = readDB();
        const products = db.products || [];
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const newProduct = await request.json();
        const db = readDB();

        // Ensure products array exists
        const products = db.products || [];

        // Assign ID if not present
        if (!newProduct.id) {
            newProduct.id = Date.now();
        }

        const updatedProducts = [...products, newProduct];
        const updatedDB = { ...db, products: updatedProducts };

        if (writeDB(updatedDB)) {
            return NextResponse.json(newProduct, { status: 201 });
        } else {
            return NextResponse.json({ error: 'Failed to write to database' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
}
