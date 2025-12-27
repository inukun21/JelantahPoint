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
        const products = db.products || [];

        const index = products.findIndex((p: any) => p.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const updatedProduct = { ...products[index], ...updates };
        products[index] = updatedProduct;

        const updatedDB = { ...db, products };

        if (writeDB(updatedDB)) {
            return NextResponse.json(updatedProduct);
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
        const products = db.products || [];

        const filteredProducts = products.filter((p: any) => p.id !== id);

        if (products.length === filteredProducts.length) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const updatedDB = { ...db, products: filteredProducts };

        if (writeDB(updatedDB)) {
            return NextResponse.json({ message: 'Product deleted' });
        } else {
            return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
