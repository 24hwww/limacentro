import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Delete users inactive for > 60 seconds
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

        await prisma.activeUser.deleteMany({
            where: {
                lastPing: {
                    lt: oneMinuteAgo,
                },
            },
        });

        const count = await prisma.activeUser.count();

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error fetching online users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
