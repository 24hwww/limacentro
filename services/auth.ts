import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string | null;
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
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await db.user.create({
      data: {
        email,
        passwordHash,
        name,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      },
    });

    const user: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatarUrl: newUser.avatarUrl,
    };

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
    const userRecord = await db.user.findUnique({
      where: { email },
    });

    if (!userRecord) {
      throw new Error('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, userRecord.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const user: AuthUser = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      avatarUrl: userRecord.avatarUrl,
    };

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
    const userRecord = await db.user.findUnique({
      where: { id: userId },
    });

    if (!userRecord) return null;

    return {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      avatarUrl: userRecord.avatarUrl,
    };
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
    const userRecord = await db.user.findUnique({
      where: { email },
    });

    if (!userRecord) return null;

    return {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      avatarUrl: userRecord.avatarUrl,
    };
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
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name: updates.name,
        avatarUrl: updates.avatarUrl,
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatarUrl: updatedUser.avatarUrl,
    };
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
}
