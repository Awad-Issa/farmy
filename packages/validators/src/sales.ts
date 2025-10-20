import { z } from 'zod';

// ============================================================================
// SALES VALIDATORS
// ============================================================================

/**
 * Animal sale type
 */
export const animalSaleTypeSchema = z.enum(['LIVE', 'SLAUGHTER', 'CULL']);

export type AnimalSaleType = z.infer<typeof animalSaleTypeSchema>;

/**
 * Create animal sale input
 */
export const createAnimalSaleInputSchema = z.object({
  animalId: z.string().uuid(),
  farmId: z.string().uuid(),
  date: z.coerce.date(),
  type: animalSaleTypeSchema,
  weightKg: z.number().positive().optional(),
  price: z.number().positive('Price must be positive'),
  buyerName: z.string().optional(),
});

export type CreateAnimalSaleInput = z.infer<typeof createAnimalSaleInputSchema>;

/**
 * List animal sales input
 */
export const listAnimalSalesInputSchema = z.object({
  farmId: z.string().uuid(),
  animalId: z.string().uuid().optional(),
  type: animalSaleTypeSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type ListAnimalSalesInput = z.infer<typeof listAnimalSalesInputSchema>;

/**
 * Get sale input
 */
export const getAnimalSaleInputSchema = z.object({
  id: z.string().uuid(),
  farmId: z.string().uuid(),
});

export type GetAnimalSaleInput = z.infer<typeof getAnimalSaleInputSchema>;

