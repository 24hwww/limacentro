import type { NextApiRequest, NextApiResponse } from 'next';
import { loginUser } from '@/services/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // Login user
    const { token, user } = await loginUser(email, password);

    // Set token in cookie
    res.setHeader('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict`);

    return res.status(200).json({ token, user });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(401).json({ error: error.message });
  }
}
