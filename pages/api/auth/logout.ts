import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clear auth token cookie
    res.setHeader('Set-Cookie', 'auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
}
