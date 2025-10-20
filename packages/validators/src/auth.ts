import { z } from 'zod';

// ============================================================================
// AUTH VALIDATORS
// ============================================================================

/**
 * Phone number validation (Palestinian format)
 * Accepts: +970591234567, 0591234567, 591234567
 */
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .transform((val) => {
    // Normalize phone number
    let normalized = val.replace(/[\s\-\(\)]/g, '');
    if (normalized.startsWith('0')) {
      normalized = '+970' + normalized.slice(1);
    }
    if (!normalized.startsWith('+')) {
      normalized = '+970' + normalized;
    }
    return normalized;
  })
  .refine(
    (val) => /^\+970[52]\d{8}$/.test(val),
    'Invalid Palestinian phone number format'
  );

/**
 * Password validation
 * Minimum 8 characters, letters and numbers recommended
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must not exceed 100 characters');

/**
 * Register input
 */
export const registerInputSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
  name: z.string().min(1).max(100).optional(),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

/**
 * Login input
 */
export const loginInputSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

/**
 * Refresh token input
 */
export const refreshTokenInputSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenInputSchema>;

/**
 * Logout input
 */
export const logoutInputSchema = z.object({
  refreshToken: z.string().optional(),
});

export type LogoutInput = z.infer<typeof logoutInputSchema>;

