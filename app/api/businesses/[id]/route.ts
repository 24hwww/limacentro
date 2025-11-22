import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { emailService } from '@/lib/emailService';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const business = await prisma.Business.findUnique({
            where: { id },
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, category, district, address, description, phone, website, rating, lat, lng, imageUrl, status } = body;

        const updatedBusiness = await prisma.Business.update({
            where: { id },
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
                status, // Allow updating status
            },
        });

        // Notify User if approved
        if (updatedBusiness.status === 'APPROVED' && updatedBusiness.ownerId) {
            const owner = await prisma.User.findUnique({ where: { id: updatedBusiness.ownerId } });
            if (owner?.email) {
                await emailService.notifyUserBusinessApproved(owner.email, updatedBusiness.name);
            }
        }

        return NextResponse.json(updatedBusiness);
    } catch (error) {
        console.error('Error updating business:', error);
        return NextResponse.json({ error: 'Error updating business' }, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.Business.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Business deleted successfully' });
    } catch (error) {
        console.error('Error deleting business:', error);
        return NextResponse.json({ error: 'Error deleting business' }, { status: 500 });
    }
}
