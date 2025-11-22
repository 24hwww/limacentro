import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const business = await prisma.business.findUnique({
            where: { id: params.id },
        });

        if (!business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }

        return NextResponse.json(business);
    } catch (error) {
        console.error('Error fetching business:', error);
        return NextResponse.json({ error: 'Error fetching business' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { name, category, district, address, description, phone, website, rating, lat, lng, imageUrl } = body;

        const updatedBusiness = await prisma.business.update({
            where: { id: params.id },
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

        return NextResponse.json(updatedBusiness);
    } catch (error) {
        console.error('Error updating business:', error);
        return NextResponse.json({ error: 'Error updating business' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.business.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Business deleted successfully' });
    } catch (error) {
        console.error('Error deleting business:', error);
        return NextResponse.json({ error: 'Error deleting business' }, { status: 500 });
    }
}
