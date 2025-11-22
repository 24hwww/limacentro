import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStackUser } from '@/lib/stackAuth';
import { emailService } from '@/lib/emailService';

export async function GET(request: Request) {
    try {
        const stackUser = await getStackUser(request);
        const { searchParams } = new URL(request.url);
        const showAll = searchParams.get('admin') === 'true';
        const myBusiness = searchParams.get('my_business') === 'true';

        let whereClause: any = { status: 'APPROVED' };

        // Get user from database to check role
        let dbUser = null;
        if (stackUser) {
            dbUser = await prisma.user.findUnique({
                where: { stackId: stackUser.id },
            });
        }

        // Admin can see all
        if (showAll && dbUser?.role === 'ADMIN') {
            whereClause = {};
        }

        // User can see their own
        if (myBusiness && dbUser?.id) {
            whereClause = { ownerId: dbUser.id };
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
        const stackUser = await getStackUser(request);
        if (!stackUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Sync user to database (prefer email to preserve pre-seeded role)
        const primaryEmail = stackUser.primaryEmail || '';

        // If there's a user with this email, update its stackId and profile, preserving role
        const existingByEmail = primaryEmail
            ? await prisma.user.findUnique({ where: { email: primaryEmail } })
            : null;

        let dbUser = null as any;
        if (existingByEmail) {
            dbUser = await prisma.user.update({
                where: { email: primaryEmail },
                data: {
                    stackId: stackUser.id,
                    name: stackUser.displayName,
                    image: stackUser.profileImageUrl,
                },
            });
        } else {
            // Fallback: upsert by stackId
            dbUser = await prisma.user.upsert({
                where: { stackId: stackUser.id },
                update: {
                    email: primaryEmail,
                    name: stackUser.displayName,
                    image: stackUser.profileImageUrl,
                },
                create: {
                    stackId: stackUser.id,
                    email: primaryEmail,
                    name: stackUser.displayName,
                    image: stackUser.profileImageUrl,
                },
            });
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
                ownerId: dbUser.id,
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
