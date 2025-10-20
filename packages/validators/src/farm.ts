import { z } from 'zod';

// ============================================================================
// FARM VALIDATORS
// ============================================================================

/**
 * Farm roles
 */
export const roleSchema = z.enum(['OWNER', 'ADMIN', 'WORKER', 'VET']);

export type Role = z.infer<typeof roleSchema>;

/**
 * Create farm input
 */
export const createFarmInputSchema = z.object({
  name: z.string().min(1, 'Farm name is required').max(100),
  settings: z.record(z.any()).optional(),
});

export type CreateFarmInput = z.infer<typeof createFarmInputSchema>;

/**
 * Update farm input
 */
export const updateFarmInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  settings: z.record(z.any()).optional(),
});

export type UpdateFarmInput = z.infer<typeof updateFarmInputSchema>;

/**
 * Get farm input
 */
export const getFarmInputSchema = z.object({
  id: z.string().uuid(),
});

export type GetFarmInput = z.infer<typeof getFarmInputSchema>;

/**
 * List farms input (for pagination)
 */
export const listFarmsInputSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type ListFarmsInput = z.infer<typeof listFarmsInputSchema>;

/**
 * Invite farm member input
 */
export const inviteFarmMemberInputSchema = z.object({
  farmId: z.string().uuid(),
  phone: z.string().min(1),
  role: roleSchema,
});

export type InviteFarmMemberInput = z.infer<typeof inviteFarmMemberInputSchema>;

/**
 * Update farm member role input
 */
export const updateFarmMemberRoleInputSchema = z.object({
  farmId: z.string().uuid(),
  userId: z.string().uuid(),
  role: roleSchema,
});

export type UpdateFarmMemberRoleInput = z.infer<
  typeof updateFarmMemberRoleInputSchema
>;

/**
 * Remove farm member input
 */
export const removeFarmMemberInputSchema = z.object({
  farmId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type RemoveFarmMemberInput = z.infer<
  typeof removeFarmMemberInputSchema
>;

/**
 * List farm members input
 */
export const listFarmMembersInputSchema = z.object({
  farmId: z.string().uuid(),
});

export type ListFarmMembersInput = z.infer<typeof listFarmMembersInputSchema>;

