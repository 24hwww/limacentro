import type { NextApiRequest, NextApiResponse } from 'next';
import { getBusinessesByUserId } from '@/services/businessService';
import { verifyToken } from '@/services/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Get user's businesses
    const businesses = await getBusinessesByUserId(user.id);

    return res.status(200).json(businesses);
  } catch (error: any) {
    console.error('Get user businesses error:', error);
    return res.status(500).json({ error: 'Failed to fetch businesses' });
  }
}
