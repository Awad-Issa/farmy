import { z } from 'zod';

// ============================================================================
// WEIGHT & FEED VALIDATORS
// ============================================================================

/**
 * Weight method
 */
export const weightMethodSchema = z.enum(['SCALE', 'TAPE', 'VISUAL_ESTIMATE']);

export type WeightMethod = z.infer<typeof weightMethodSchema>;

/**
 * Lamb feeding method
 */
export const lambFeedingMethodSchema = z.enum(['NURSING', 'MANUFACTURED']);

export type LambFeedingMethod = z.infer<typeof lambFeedingMethodSchema>;

/**
 * Create weight entry input
 */
export const createWeightInputSchema = z.object({
  animalId: z.string().uuid(),
  farmId: z.string().uuid(),
  date: z.coerce.date(),
  kg: z.number().positive('Weight must be positive'),
  method: weightMethodSchema.default('SCALE'),
  notes: z.string().optional(),
});

export type CreateWeightInput = z.infer<typeof createWeightInputSchema>;

/**
 * Batch weight entry input
 */
export const batchWeightInputSchema = z.object({
  farmId: z.string().uuid(),
  date: z.coerce.date(),
  weights: z
    .array(
      z.object({
        animalId: z.string().uuid(),
        kg: z.number().positive(),
        method: weightMethodSchema.optional(),
        notes: z.string().optional(),
      })
    )
    .min(1, 'At least one weight entry required'),
});

export type BatchWeightInput = z.infer<typeof batchWeightInputSchema>;

/**
 * List weights input
 */
export const listWeightsInputSchema = z.object({
  farmId: z.string().uuid(),
  animalId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type ListWeightsInput = z.infer<typeof listWeightsInputSchema>;

/**
 * Create feed plan input
 */
export const createFeedPlanInputSchema = z.object({
  farmId: z.string().uuid(),
  name: z.string().min(1, 'Feed plan name is required'),
  components: z.record(z.any()), // Flexible JSON structure
  ratios: z.record(z.any()),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type CreateFeedPlanInput = z.infer<typeof createFeedPlanInputSchema>;

/**
 * Create lamb feeding record input
 */
export const createLambFeedingInputSchema = z.object({
  lambId: z.string().uuid(),
  farmId: z.string().uuid(),
  method: lambFeedingMethodSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  volumePerDay: z.number().positive().optional(),
  notes: z.string().optional(),
});

export type CreateLambFeedingInput = z.infer<
  typeof createLambFeedingInputSchema
>;

