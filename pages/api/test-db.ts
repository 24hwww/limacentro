import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/services/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`;
    
    // Test user table
    const userCount = await db.user.count();
    
    // Test business table
    const businessCount = await db.business.count();

    res.status(200).json({
      status: 'success',
      database: 'connected',
      tables: {
        users: userCount,
        businesses: businessCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
