import { NextResponse } from 'next/server';
import { getStackUser } from '@/lib/stackAuth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const stackUser = await getStackUser(request);
        if (!stackUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await prisma.User.findUnique({
            where: { stackId: stackUser.id },
        });

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(dbUser);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
