import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllBusinesses, createBusiness } from '@/services/businessService';
import { verifyToken } from '@/services/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const businesses = await getAllBusinesses();
      return res.status(200).json(businesses);
    } catch (error: any) {
      console.error('Get businesses error:', error);
      return res.status(500).json({ error: 'Failed to fetch businesses' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Get token from cookie or header
      const token = req.cookies.auth_token || req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify token
      const user = verifyToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const businessData = req.body;

      // Validate required fields
      if (!businessData.name || !businessData.category || !businessData.district || 
          !businessData.address || !businessData.lat || !businessData.lng) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create business
      const business = await createBusiness(user.id, businessData);

      return res.status(201).json(business);
    } catch (error: any) {
      console.error('Create business error:', error);
      return res.status(400).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
