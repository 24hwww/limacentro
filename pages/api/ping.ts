import { NextApiRequest, NextApiResponse } from 'next';
import { recordUserPing } from '@/services/onlineUsers';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Use IP address as a simple way to identify a user session.
  // This is not foolproof but good enough for this purpose.
  const userId = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  recordUserPing(userId);

  // Respond with 204 No Content as we don't need to send anything back.
  return res.status(204).end();
}
