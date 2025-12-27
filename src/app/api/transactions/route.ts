import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/jsonDB';
import path from 'path';
import fs from 'fs';

const TRANSACTIONS_DB_PATH = path.join(process.cwd(), 'src', 'database', 'transactions.json');

// Helper to read transactions
function readTransactions() {
    try {
        const data = fs.readFileSync(TRANSACTIONS_DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Helper to write transactions
function writeTransactions(transactions: any[]) {
    try {
        fs.writeFileSync(TRANSACTIONS_DB_PATH, JSON.stringify(transactions, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Failed to write transactions:', error);
        return false;
    }
}

export async function GET() {
    try {
        const transactions = readTransactions();
        return NextResponse.json(transactions);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const newTransaction = await request.json();
        const transactions = readTransactions();

        // Ensure unique transaction code
        const codeExists = transactions.some((t: any) => t.id === newTransaction.id);
        if (codeExists) {
            // Generate new code
            newTransaction.id = `JB-${Math.floor(Math.random() * 1000000)}`;
        }

        // Set default values
        if (!newTransaction.status) {
            newTransaction.status = 'pending';
        }
        if (!newTransaction.date) {
            newTransaction.date = new Date().toISOString();
        }

        const updatedTransactions = [...transactions, newTransaction];

        if (writeTransactions(updatedTransactions)) {
            return NextResponse.json(newTransaction, { status: 201 });
        } else {
            return NextResponse.json({ error: 'Failed to write to database' }, { status: 500 });
        }
    } catch (error) {
        console.error('POST /api/transactions error:', error);
        return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
}
