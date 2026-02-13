import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.status(410).json({
    error: 'Legacy endpoint removed. Use /api/auth/signin/google (NextAuth).',
  });
}
