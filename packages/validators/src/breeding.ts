import { z } from 'zod';

// ============================================================================
// BREEDING VALIDATORS
// ============================================================================

/**
 * Breeding cycle status
 */
export const breedingCycleStatusSchema = z.enum([
  'OPEN',
  'PREGNANT',
  'LAMBED',
  'FAILED',
  'ABORTED',
]);

export type BreedingCycleStatus = z.infer<typeof breedingCycleStatusSchema>;

/**
 * Pregnancy check result
 */
export const pregnancyCheckResultSchema = z.enum([
  'POSITIVE',
  'NEGATIVE',
  'UNCERTAIN',
]);

export type PregnancyCheckResult = z.infer<typeof pregnancyCheckResultSchema>;

/**
 * Breeding event type
 */
export const breedingEventTypeSchema = z.enum([
  'INS1',
  'INS2',
  'CHECK1',
  'CHECK2',
  'LAMBING',
  'LOSS',
  'ABORTION',
]);

export type BreedingEventType = z.infer<typeof breedingEventTypeSchema>;

/**
 * Create breeding cycle input (INS1)
 */
export const createBreedingCycleInputSchema = z.object({
  eweId: z.string().uuid(),
  farmId: z.string().uuid(),
  ins1Date: z.coerce.date(),
});

export type CreateBreedingCycleInput = z.infer<
  typeof createBreedingCycleInputSchema
>;

/**
 * Update breeding cycle input
 */
export const updateBreedingCycleInputSchema = z.object({
  id: z.string().uuid(),
  farmId: z.string().uuid(),
  ins2Date: z.coerce.date().optional(),
  check1Date: z.coerce.date().optional(),
  check1Result: pregnancyCheckResultSchema.optional(),
  check2Date: z.coerce.date().optional(),
  check2Result: pregnancyCheckResultSchema.optional(),
  status: breedingCycleStatusSchema.optional(),
});

export type UpdateBreedingCycleInput = z.infer<
  typeof updateBreedingCycleInputSchema
>;

/**
 * Get breeding cycle input
 */
export const getBreedingCycleInputSchema = z.object({
  id: z.string().uuid(),
  farmId: z.string().uuid(),
});

export type GetBreedingCycleInput = z.infer<typeof getBreedingCycleInputSchema>;

/**
 * List breeding cycles input
 */
export const listBreedingCyclesInputSchema = z.object({
  farmId: z.string().uuid(),
  status: breedingCycleStatusSchema.optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type ListBreedingCyclesInput = z.infer<
  typeof listBreedingCyclesInputSchema
>;

/**
 * Create breeding event input
 */
export const createBreedingEventInputSchema = z.object({
  cycleId: z.string().uuid(),
  eweId: z.string().uuid(),
  farmId: z.string().uuid(),
  type: breedingEventTypeSchema,
  date: z.coerce.date(),
  payload: z.record(z.any()).optional(), // Event-specific data
});

export type CreateBreedingEventInput = z.infer<
  typeof createBreedingEventInputSchema
>;

/**
 * Get due reminders input
 */
export const getDueRemindersInputSchema = z.object({
  farmId: z.string().uuid(),
  daysAhead: z.number().min(1).max(90).default(7),
});

export type GetDueRemindersInput = z.infer<typeof getDueRemindersInputSchema>;

