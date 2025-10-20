/**
 * @farmy/auth - Authentication and authorization utilities
 * 
 * This package contains:
 * - JWT helpers: sign, verify, decode tokens
 * - Password utilities: Argon2id hash and verify
 * - RBAC helpers: Role-based access control policies
 * 
 * Authentication flow:
 * 1. Register: Hash password with Argon2id, store User with phone
 * 2. Login: Verify password, issue JWT access (30min) + refresh (30d) tokens
 * 3. Refresh: Rotate refresh token on each use
 * 4. Authorization: Validate JWT, check farm membership and role
 */

// Password utilities (Argon2id)
export * from './password';

// JWT utilities
export * from './jwt';

// RBAC (Role-Based Access Control)
export * from './rbac';

