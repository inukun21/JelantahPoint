import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(
    request: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        const code = params.code;
        const transactions = readTransactions();

        const transaction = transactions.find((t: any) => t.id === code);

        if (!transaction) {
            return NextResponse.json(
                { error: 'Kode transaksi tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('GET /api/transactions/[code] error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        const code = params.code;
        const updates = await request.json();
        const transactions = readTransactions();

        const index = transactions.findIndex((t: any) => t.id === code);

        if (index === -1) {
            return NextResponse.json(
                { error: 'Kode transaksi tidak ditemukan' },
                { status: 404 }
            );
        }

        // Check if already completed or cancelled
        if (transactions[index].status === 'completed' || transactions[index].status === 'cancelled') {
            return NextResponse.json(
                { error: `Transaksi sudah ${transactions[index].status === 'completed' ? 'dikonfirmasi' : 'dibatalkan'} sebelumnya` },
                { status: 400 }
            );
        }

        // Update transaction
        transactions[index] = {
            ...transactions[index],
            ...updates,
            confirmedAt: new Date().toISOString()
        };

        // If cancelling, refund points to user
        if (updates.status === 'cancelled') {
            try {
                // Read users database
                const usersPath = path.join(process.cwd(), 'src', 'database', 'users.json');
                const usersData = fs.readFileSync(usersPath, 'utf-8');
                const users = JSON.parse(usersData);

                // Find user
                const userIndex = users.findIndex((u: any) => u.id === transactions[index].userId);

                if (userIndex !== -1) {
                    // Refund points
                    users[userIndex].points += transactions[index].totalPoints;

                    // Add refund entry to point history
                    if (!users[userIndex].pointHistory) {
                        users[userIndex].pointHistory = [];
                    }

                    users[userIndex].pointHistory.unshift({
                        id: Date.now(),
                        date: new Date().toISOString().split('T')[0],
                        description: `Pengembalian - ${transactions[index].id}`,
                        amount: transactions[index].totalPoints,
                        type: 'earn'
                    });

                    // Save updated users
                    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
                }
            } catch (error) {
                console.error('Error refunding points:', error);
            }
        }

        if (writeTransactions(transactions)) {
            return NextResponse.json(transactions[index]);
        } else {
            return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
        }
    } catch (error) {
        console.error('PATCH /api/transactions/[code] error:', error);
        return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
}
