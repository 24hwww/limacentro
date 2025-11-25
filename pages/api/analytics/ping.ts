import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id: userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    await prisma.activeUser.upsert({
      where: { id: userId },
      update: { lastPing: new Date() },
      create: { id: userId, lastPing: new Date() },
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Ping error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
