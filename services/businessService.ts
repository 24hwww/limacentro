import { queryOne, queryMany } from './db';
import { Business } from '../types';

/**
 * Get all businesses
 */
export async function getAllBusinesses(): Promise<Business[]> {
  try {
    const businesses = await queryMany(
      `SELECT 
        id, user_id as "ownerId", name, category, district, address, 
        description, phone, website, rating, lat, lng, image_url as "imageUrl"
       FROM businesses
       ORDER BY created_at DESC`
    );
    return businesses;
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
    const businesses = await queryMany(
      `SELECT 
        id, user_id as "ownerId", name, category, district, address, 
        description, phone, website, rating, lat, lng, image_url as "imageUrl"
       FROM businesses
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return businesses;
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
    const business = await queryOne(
      `SELECT 
        id, user_id as "ownerId", name, category, district, address, 
        description, phone, website, rating, lat, lng, image_url as "imageUrl"
       FROM businesses
       WHERE id = $1`,
      [businessId]
    );
    return business || null;
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
    const business = await queryOne(
      `INSERT INTO businesses 
        (user_id, name, category, district, address, description, phone, website, rating, lat, lng, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING 
        id, user_id as "ownerId", name, category, district, address, 
        description, phone, website, rating, lat, lng, image_url as "imageUrl"`,
      [
        userId,
        businessData.name,
        businessData.category,
        businessData.district,
        businessData.address,
        businessData.description,
        businessData.phone,
        businessData.website,
        businessData.rating || 5,
        businessData.lat,
        businessData.lng,
        businessData.imageUrl,
      ]
    );

    return business;
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
    const business = await getBusinessById(businessId);
    if (!business || business.ownerId !== userId) {
      throw new Error('Unauthorized');
    }

    const updated = await queryOne(
      `UPDATE businesses 
       SET 
        name = COALESCE($2, name),
        category = COALESCE($3, category),
        district = COALESCE($4, district),
        address = COALESCE($5, address),
        description = COALESCE($6, description),
        phone = COALESCE($7, phone),
        website = COALESCE($8, website),
        rating = COALESCE($9, rating),
        lat = COALESCE($10, lat),
        lng = COALESCE($11, lng),
        image_url = COALESCE($12, image_url),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING 
        id, user_id as "ownerId", name, category, district, address, 
        description, phone, website, rating, lat, lng, image_url as "imageUrl"`,
      [
        businessId,
        updates.name || null,
        updates.category || null,
        updates.district || null,
        updates.address || null,
        updates.description || null,
        updates.phone || null,
        updates.website || null,
        updates.rating || null,
        updates.lat || null,
        updates.lng || null,
        updates.imageUrl || null,
      ]
    );

    return updated;
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
    const business = await getBusinessById(businessId);
    if (!business || business.ownerId !== userId) {
      throw new Error('Unauthorized');
    }

    await queryOne(
      'DELETE FROM businesses WHERE id = $1',
      [businessId]
    );
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
    let sql = `
      SELECT 
        id, user_id as "ownerId", name, category, district, address, 
        description, phone, website, rating, lat, lng, image_url as "imageUrl"
       FROM businesses
       WHERE (name ILIKE $1 OR description ILIKE $1)
    `;
    const params: any[] = [`%${query}%`];

    if (district) {
      sql += ` AND district = $${params.length + 1}`;
      params.push(district);
    }

    if (category) {
      sql += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    sql += ' ORDER BY created_at DESC';

    const businesses = await queryMany(sql, params);
    return businesses;
  } catch (error) {
    console.error('Search businesses error:', error);
    throw error;
  }
}
