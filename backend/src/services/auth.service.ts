/**
 * ===========================================
 * Authentication Service
 * ===========================================
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../utils/prisma';

export interface RegisterInput {
  email: string;
  password: string;
  role?: 'ADMIN' | 'USER' | 'VIEWER';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * User registration
 */
export async function register(input: RegisterInput): Promise<AuthResponse> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: input.role || 'USER',
    },
  });

  // Generate tokens
  const tokens = generateTokens(user.id, user.email, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    tokens,
  };
}

/**
 * User login
 */
export async function login(input: LoginInput): Promise<AuthResponse> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Account is disabled');
  }

  // Generate tokens
  const tokens = generateTokens(user.id, user.email, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    tokens,
  };
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): {
  id: string;
  email: string;
  role: string;
} {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
    };
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
}

/**
 * Generate access and refresh tokens
 */
function generateTokens(userId: string, email: string, role: string) {
  const payload = { id: userId, email, role };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiration,
  });

  const refreshToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiration,
  });

  return { accessToken, refreshToken };
}

/**
 * Refresh access token
 */
export function refreshToken(refreshToken: string): string {
  const decoded = verifyToken(refreshToken);

  const accessToken = jwt.sign(
    { id: decoded.id, email: decoded.email, role: decoded.role },
    config.jwt.secret,
    {
      expiresIn: config.jwt.accessExpiration,
    }
  );

  return accessToken;
}
