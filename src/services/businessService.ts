import { db } from '@/lib/db';
import type { Business } from '@/types';
import type { Prisma } from '@/generated/prisma/client';
import type { BusinessInput } from '@/lib/validation';

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
    source: b.source || undefined,
  };
}

/**
 * Get all businesses
 */
export async function getAllBusinesses(): Promise<Business[]> {
  const businesses = await db.business.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5000,
  });
  return businesses.map(mapPrismaBusiness);
}

/**
 * Get businesses by user ID
 */
export async function getBusinessesByUserId(userId: number): Promise<Business[]> {
  const businesses = await db.business.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return businesses.map(mapPrismaBusiness);
}

/**
 * Get business by ID
 */
export async function getBusinessById(businessId: number): Promise<Business | null> {
  const business = await db.business.findUnique({
    where: { id: businessId },
  });
  return business ? mapPrismaBusiness(business) : null;
}

/**
 * Create a new business
 */
export async function createBusiness(
  userId: number,
  businessData: BusinessInput
): Promise<Business> {
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
      rating: businessData.rating ?? 5.0,
      lat: businessData.lat,
      lng: businessData.lng,
      imageUrl: businessData.imageUrl,
      source: 'user',
    },
  });

  return mapPrismaBusiness(business);
}

/**
 * Update a business (only the owner can update)
 */
export async function updateBusiness(
  businessId: number,
  userId: number,
  updates: Partial<BusinessInput>
): Promise<Business> {
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
}

/**
 * Delete a business (only the owner can delete)
 */
export async function deleteBusiness(businessId: number, userId: number): Promise<void> {
  const existingBusiness = await db.business.findUnique({
    where: { id: businessId },
  });

  if (!existingBusiness || existingBusiness.userId !== userId) {
    throw new Error('Unauthorized');
  }

  await db.business.delete({
    where: { id: businessId },
  });
}

/**
 * Search businesses
 */
export async function searchBusinesses(
  query: string,
  district?: string,
  category?: string
): Promise<Business[]> {
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
    take: 500,
  });

  return businesses.map(mapPrismaBusiness);
}
