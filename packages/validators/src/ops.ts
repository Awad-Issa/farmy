import { z } from 'zod';

// ============================================================================
// OPS (SUPER ADMIN) VALIDATORS
// ============================================================================

/**
 * Create farm for user input (super admin)
 */
export const createFarmForUserInputSchema = z.object({
  userId: z.string().uuid(),
  farmName: z.string().min(1, 'Farm name is required'),
});

export type CreateFarmForUserInput = z.infer<
  typeof createFarmForUserInputSchema
>;

/**
 * Create user input (super admin)
 */
export const createUserInputSchema = z.object({
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

/**
 * Assign role input (super admin)
 */
export const assignRoleInputSchema = z.object({
  userId: z.string().uuid(),
  farmId: z.string().uuid(),
  role: z.enum(['OWNER', 'ADMIN', 'WORKER', 'VET']),
});

export type AssignRoleInput = z.infer<typeof assignRoleInputSchema>;

/**
 * Grant super admin input
 */
export const grantSuperAdminInputSchema = z.object({
  userId: z.string().uuid(),
});

export type GrantSuperAdminInput = z.infer<typeof grantSuperAdminInputSchema>;

/**
 * Revoke super admin input
 */
export const revokeSuperAdminInputSchema = z.object({
  userId: z.string().uuid(),
});

export type RevokeSuperAdminInput = z.infer<
  typeof revokeSuperAdminInputSchema
>;

/**
 * List all farms input (super admin)
 */
export const listAllFarmsInputSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
  search: z.string().optional(),
});

export type ListAllFarmsInput = z.infer<typeof listAllFarmsInputSchema>;

/**
 * List all users input (super admin)
 */
export const listAllUsersInputSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
  search: z.string().optional(),
});

export type ListAllUsersInput = z.infer<typeof listAllUsersInputSchema>;

/**
 * Get audit logs input
 */
export const getAuditLogsInputSchema = z.object({
  farmId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type GetAuditLogsInput = z.infer<typeof getAuditLogsInputSchema>;

/**
 * Impersonate user input (view-only)
 */
export const impersonateUserInputSchema = z.object({
  userId: z.string().uuid(),
  farmId: z.string().uuid().optional(),
});

export type ImpersonateUserInput = z.infer<typeof impersonateUserInputSchema>;

