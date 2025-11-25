import { NextApiRequest, NextApiResponse } from 'next';
import { getOnlineUserCount } from '@/services/onlineUsers';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const count = getOnlineUserCount();

  res.status(200).json({ onlineUsers: count });
}
