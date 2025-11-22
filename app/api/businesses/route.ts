import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const businesses = await prisma.business.findMany({
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
            },
        });

        return NextResponse.json(newBusiness, { status: 201 });
    } catch (error) {
        console.error('Error creating business:', error);
        return NextResponse.json({ error: 'Error creating business' }, { status: 500 });
    }
}
