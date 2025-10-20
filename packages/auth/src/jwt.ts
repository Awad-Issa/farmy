/**
 * JWT utilities for access and refresh tokens
 * 
 * - Access tokens: Short-lived (30 min), used for API authentication
 * - Refresh tokens: Long-lived (30 days), used to get new access tokens
 * - Refresh token rotation: New refresh token issued on each refresh
 */

import type { SignOptions } from 'jsonwebtoken';
import { sign, verify, decode } from 'jsonwebtoken';
import { createHash, randomUUID } from 'crypto';

// Environment variables
const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
const JWT_REFRESH_SECRET: string =
  process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const JWT_ACCESS_EXPIRES_IN: string = process.env.JWT_ACCESS_EXPIRES_IN || '30m';
const JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Payload for JWT tokens
 */
export interface JWTPayload {
  userId: string;
  phone: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

/**
 * Payload for refresh tokens (includes additional metadata)
 */
export interface RefreshTokenPayload extends JWTPayload {
  tokenId: string; // Unique ID for this refresh token
}

/**
 * Sign an access token
 * 
 * @param payload - User data to encode
 * @returns string - Signed JWT
 */
export function signAccessToken(payload: JWTPayload): string {
  return sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);
}

/**
 * Sign a refresh token
 * 
 * @param payload - User data to encode (with tokenId)
 * @returns string - Signed JWT
 */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  return sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
}

/**
 * Verify an access token
 * 
 * @param token - JWT to verify
 * @returns JWTPayload | null - Decoded payload or null if invalid
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return verify(token, JWT_ACCESS_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify a refresh token
 * 
 * @param token - JWT to verify
 * @returns RefreshTokenPayload | null - Decoded payload or null if invalid
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Decode a token without verification (useful for expired tokens)
 * 
 * @param token - JWT to decode
 * @returns JWTPayload | null - Decoded payload or null if invalid format
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate a unique token ID for refresh tokens
 * 
 * @returns string - Random UUID-like string
 */
export function generateTokenId(): string {
  return randomUUID();
}

/**
 * Hash a refresh token for storage
 * Uses SHA-256 for fast hashing (not cryptographic security needed)
 * 
 * @param token - Refresh token to hash
 * @returns string - Hashed token
 */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Get expiration date for refresh token
 * 
 * @returns Date - Expiration date
 */
export function getRefreshTokenExpiration(): Date {
  const expiresIn = JWT_REFRESH_EXPIRES_IN;
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  
  if (!match) {
    // Default to 30 days
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + num * multipliers[unit]);
}

