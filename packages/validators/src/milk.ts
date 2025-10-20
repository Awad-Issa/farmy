import { z } from 'zod';

// ============================================================================
// MILK VALIDATORS
// ============================================================================

/**
 * Create milk yield input
 */
export const createMilkYieldInputSchema = z.object({
  animalId: z.string().uuid(),
  farmId: z.string().uuid(),
  at: z.coerce.date(),
  liters: z.number().positive('Milk volume must be positive'),
});

export type CreateMilkYieldInput = z.infer<typeof createMilkYieldInputSchema>;

/**
 * Batch milk yield input
 */
export const batchMilkYieldInputSchema = z.object({
  farmId: z.string().uuid(),
  at: z.coerce.date(),
  yields: z
    .array(
      z.object({
        animalId: z.string().uuid(),
        liters: z.number().positive(),
      })
    )
    .min(1, 'At least one yield entry required'),
});

export type BatchMilkYieldInput = z.infer<typeof batchMilkYieldInputSchema>;

/**
 * Create milk sale input
 */
export const createMilkSaleInputSchema = z.object({
  farmId: z.string().uuid(),
  date: z.coerce.date(),
  volumeLiters: z.number().positive('Volume must be positive'),
  pricePerLiter: z.number().positive('Price must be positive'),
  buyerName: z.string().optional(),
});

export type CreateMilkSaleInput = z.infer<typeof createMilkSaleInputSchema>;

/**
 * List milk yields input
 */
export const listMilkYieldsInputSchema = z.object({
  farmId: z.string().uuid(),
  animalId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type ListMilkYieldsInput = z.infer<typeof listMilkYieldsInputSchema>;

/**
 * List milk sales input
 */
export const listMilkSalesInputSchema = z.object({
  farmId: z.string().uuid(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type ListMilkSalesInput = z.infer<typeof listMilkSalesInputSchema>;

