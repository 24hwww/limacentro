import type { NextApiRequest, NextApiResponse } from 'next';
import { registerUser } from '@/services/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Register user
    const { token, user } = await registerUser(email, password, name);

    // Set token in cookie
    res.setHeader('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict`);

    return res.status(201).json({ token, user });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(400).json({ error: error.message });
  }
}
