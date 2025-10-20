/**
 * Password utilities using Argon2id
 * 
 * Argon2id is the recommended password hashing algorithm:
 * - Resistant to GPU cracking attacks
 * - Memory-hard algorithm
 * - Winner of Password Hashing Competition (2015)
 */

import * as argon2 from 'argon2';

/**
 * Hash a password using Argon2id
 * 
 * @param password - Plain text password
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3, // Number of iterations
    parallelism: 1, // Number of threads
  });
}

/**
 * Verify a password against a hash
 * 
 * @param hash - Hashed password from database
 * @param password - Plain text password to verify
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    // Invalid hash format or other error
    return false;
  }
}

/**
 * Check if a hash needs rehashing (parameters changed)
 * 
 * @param hash - Hashed password from database
 * @returns boolean - True if rehash recommended
 */
export function needsRehash(hash: string): boolean {
  return argon2.needsRehash(hash, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
}

