import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { emailService } from '@/lib/emailService';

export async function GET(request: Request) {
    try {
        const session = await auth();
        const { searchParams } = new URL(request.url);
        const showAll = searchParams.get('admin') === 'true';
        const myBusiness = searchParams.get('my_business') === 'true';

        let whereClause: any = { status: 'APPROVED' };

        // Admin can see all
        // @ts-ignore
        if (showAll && session?.user?.role === 'ADMIN') {
            whereClause = {};
        }

        // User can see their own
        if (myBusiness && session?.user?.id) {
            whereClause = { ownerId: session.user.id };
        }

        const businesses = await prisma.business.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(businesses);
    } catch (error) {
        console.error('Error fetching businesses:', error);
        return NextResponse.json({ error: 'Error fetching businesses' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, category, district, address, description, phone, website, rating, lat, lng, imageUrl } = body;

        const newBusiness = await prisma.business.create({
            data: {
                name,
                category,
                district,
                address,
                description,
                phone,
                website,
                rating,
                lat,
                lng,
                imageUrl,
                ownerId: session.user.id,
                status: 'PENDING', // Default status
            },
        });

        // Notify Admin
        await emailService.notifyAdminNewBusiness(newBusiness.name);

        return NextResponse.json(newBusiness, { status: 201 });
    } catch (error) {
        console.error('Error creating business:', error);
        return NextResponse.json({ error: 'Error creating business' }, { status: 500 });
    }
}
