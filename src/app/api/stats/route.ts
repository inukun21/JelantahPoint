
import { NextResponse } from 'next/server';
import { readDB } from '@/lib/jsonDB';

export async function GET() {
    try {
        const db = readDB();
        const users = db.users || [];

        const activeUsers = users.length;

        const totalCollectedLiter = users.reduce((sum: number, user: any) => {
            return sum + (Number(user.totalDeposited) || 0);
        }, 0);

        const co2Saved = users.reduce((sum: number, user: any) => {
            return sum + (Number(user.co2Saved) || 0);
        }, 0);

        const rewardsExchanged = users.reduce((sum: number, user: any) => {
            const history = user.pointHistory || [];
            const redeemedPoints = history
                .filter((h: any) => h.type === 'redeem')
                .reduce((pSum: number, h: any) => pSum + (Number(h.amount) || 0), 0);
            return sum + redeemedPoints;
        }, 0);

        return NextResponse.json({
            activeUsers,
            totalCollectedLiter,
            co2Saved,
            rewardsExchanged
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
