import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    await prisma.activeUser.deleteMany({
      where: {
        lastPing: {
          lt: oneMinuteAgo,
        },
      },
    });

    const count = await prisma.activeUser.count();

    return res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching online users:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
