import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, queryMany } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface AuthToken {
  token: string;
  user: AuthUser;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Register a new user
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<AuthToken> {
  try {
    // Check if user already exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await queryOne(
      `INSERT INTO users (email, password_hash, name, avatar_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, avatar_url as "avatarUrl"`,
      [email, passwordHash, name, `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`]
    );

    // Generate token
    const token = generateToken(user);

    return { token, user };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Login a user
 */
export async function loginUser(email: string, password: string): Promise<AuthToken> {
  try {
    // Find user
    const user = await queryOne(
      'SELECT id, email, name, avatar_url as "avatarUrl", password_hash FROM users WHERE email = $1',
      [email]
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Remove password hash from user object
    delete user.password_hash;

    // Generate token
    const token = generateToken(user);

    return { token, user };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<AuthUser | null> {
  try {
    const user = await queryOne(
      'SELECT id, email, name, avatar_url as "avatarUrl" FROM users WHERE id = $1',
      [userId]
    );
    return user || null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  try {
    const user = await queryOne(
      'SELECT id, email, name, avatar_url as "avatarUrl" FROM users WHERE email = $1',
      [email]
    );
    return user || null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: number,
  updates: Partial<{ name: string; avatarUrl: string }>
): Promise<AuthUser> {
  try {
    const user = await queryOne(
      `UPDATE users 
       SET name = COALESCE($2, name), 
           avatar_url = COALESCE($3, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, name, avatar_url as "avatarUrl"`,
      [userId, updates.name || null, updates.avatarUrl || null]
    );

    return user;
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
}
