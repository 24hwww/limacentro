import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        await prisma.activeUser.upsert({
            where: { id },
            update: { lastPing: new Date() },
            create: { id, lastPing: new Date() },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing ping:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
