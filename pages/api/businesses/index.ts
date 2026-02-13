import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllBusinesses, createBusiness } from '@/services/businessService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/services/db';

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
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const dbUser = await db.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (!dbUser) {
        return res.status(401).json({ error: 'Unauthorized user' });
      }

      const businessData = req.body;

      // Validate required fields
      if (!businessData.name || !businessData.category || !businessData.district || 
          !businessData.address || !businessData.lat || !businessData.lng) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create business
      const business = await createBusiness(dbUser.id, businessData);

      return res.status(201).json(business);
    } catch (error: any) {
      console.error('Create business error:', error);
      return res.status(400).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
