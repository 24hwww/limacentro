import type { NextApiRequest, NextApiResponse } from 'next';
import { getBusinessesByUserId } from '@/services/businessService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/services/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Get user's businesses
    const businesses = await getBusinessesByUserId(dbUser.id);

    return res.status(200).json(businesses);
  } catch (error: any) {
    console.error('Get user businesses error:', error);
    return res.status(500).json({ error: 'Failed to fetch businesses' });
  }
}
