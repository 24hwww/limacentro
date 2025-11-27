import { db } from './db';
import { Business } from '../types';
import { Prisma } from '@prisma/client';

// Helper to map Prisma result to Business interface
function mapPrismaBusiness(b: any): Business {
  return {
    id: b.id,
    ownerId: b.userId,
    name: b.name,
    category: b.category,
    district: b.district,
    address: b.address,
    description: b.description || '',
    phone: b.phone || '',
    website: b.website || '',
    rating: b.rating ? Number(b.rating) : 5.0,
    lat: Number(b.lat),
    lng: Number(b.lng),
    imageUrl: b.imageUrl || undefined,
  };
}

/**
 * Get all businesses
 */
export async function getAllBusinesses(): Promise<Business[]> {
  try {
    const businesses = await db.business.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return businesses.map(mapPrismaBusiness);
  } catch (error) {
    console.error('Get all businesses error:', error);
    throw error;
  }
}

/**
 * Get businesses by user ID
 */
export async function getBusinessesByUserId(userId: number): Promise<Business[]> {
  try {
    const businesses = await db.business.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return businesses.map(mapPrismaBusiness);
  } catch (error) {
    console.error('Get businesses by user error:', error);
    throw error;
  }
}

/**
 * Get business by ID
 */
export async function getBusinessById(businessId: number): Promise<Business | null> {
  try {
    const business = await db.business.findUnique({
      where: { id: businessId },
    });
    return business ? mapPrismaBusiness(business) : null;
  } catch (error) {
    console.error('Get business error:', error);
    throw error;
  }
}

/**
 * Create a new business
 */
export async function createBusiness(
  userId: number,
  businessData: Omit<Business, 'id' | 'ownerId'>
): Promise<Business> {
  try {
    const business = await db.business.create({
      data: {
        userId,
        name: businessData.name,
        category: businessData.category,
        district: businessData.district,
        address: businessData.address,
        description: businessData.description,
        phone: businessData.phone,
        website: businessData.website,
        rating: businessData.rating || 5.0,
        lat: businessData.lat,
        lng: businessData.lng,
        imageUrl: businessData.imageUrl,
      },
    });

    return mapPrismaBusiness(business);
  } catch (error) {
    console.error('Create business error:', error);
    throw error;
  }
}

/**
 * Update a business
 */
export async function updateBusiness(
  businessId: number,
  userId: number,
  updates: Partial<Business>
): Promise<Business> {
  try {
    // Verify ownership
    const existingBusiness = await db.business.findUnique({
      where: { id: businessId },
    });

    if (!existingBusiness || existingBusiness.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const updated = await db.business.update({
      where: { id: businessId },
      data: {
        name: updates.name,
        category: updates.category,
        district: updates.district,
        address: updates.address,
        description: updates.description,
        phone: updates.phone,
        website: updates.website,
        rating: updates.rating,
        lat: updates.lat,
        lng: updates.lng,
        imageUrl: updates.imageUrl,
      },
    });

    return mapPrismaBusiness(updated);
  } catch (error) {
    console.error('Update business error:', error);
    throw error;
  }
}

/**
 * Delete a business
 */
export async function deleteBusiness(businessId: number, userId: number): Promise<void> {
  try {
    // Verify ownership
    const existingBusiness = await db.business.findUnique({
      where: { id: businessId },
    });

    if (!existingBusiness || existingBusiness.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await db.business.delete({
      where: { id: businessId },
    });
  } catch (error) {
    console.error('Delete business error:', error);
    throw error;
  }
}

/**
 * Search businesses
 */
export async function searchBusinesses(
  query: string,
  district?: string,
  category?: string
): Promise<Business[]> {
  try {
    const where: Prisma.BusinessWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (district) {
      where.district = district;
    }

    if (category) {
      where.category = category;
    }

    const businesses = await db.business.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return businesses.map(mapPrismaBusiness);
  } catch (error) {
    console.error('Search businesses error:', error);
    throw error;
  }
}
