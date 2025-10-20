import { z } from 'zod';

// ============================================================================
// ANIMAL VALIDATORS
// ============================================================================

/**
 * Animal types
 */
export const animalTypeSchema = z.enum(['RAM', 'EWE', 'LAMB']);

export type AnimalType = z.infer<typeof animalTypeSchema>;

/**
 * Animal sex
 */
export const animalSexSchema = z.enum(['MALE', 'FEMALE']);

export type AnimalSex = z.infer<typeof animalSexSchema>;

/**
 * Animal status
 */
export const animalStatusSchema = z.enum([
  'ACTIVE',
  'SOLD',
  'DEAD',
  'CULLED',
]);

export type AnimalStatus = z.infer<typeof animalStatusSchema>;

/**
 * Tag number validation (alphanumeric, 1-20 chars)
 */
export const tagNumberSchema = z
  .string()
  .min(1, 'Tag number is required')
  .max(20, 'Tag number must not exceed 20 characters')
  .regex(/^[A-Za-z0-9\-]+$/, 'Tag number must be alphanumeric');

/**
 * RFID validation (15 digits)
 */
export const rfidSchema = z
  .string()
  .length(15, 'RFID must be exactly 15 digits')
  .regex(/^\d{15}$/, 'RFID must contain only digits')
  .optional();

/**
 * Create animal input
 */
export const createAnimalInputSchema = z.object({
  farmId: z.string().uuid(),
  tagNumber: tagNumberSchema,
  rfid: rfidSchema,
  type: animalTypeSchema,
  sex: animalSexSchema,
  dob: z.coerce.date().optional(),
  sireId: z.string().uuid().optional(),
  damId: z.string().uuid().optional(),
});

export type CreateAnimalInput = z.infer<typeof createAnimalInputSchema>;

/**
 * Update animal input
 */
export const updateAnimalInputSchema = z.object({
  id: z.string().uuid(),
  farmId: z.string().uuid(),
  tagNumber: tagNumberSchema.optional(),
  rfid: rfidSchema,
  type: animalTypeSchema.optional(),
  sex: animalSexSchema.optional(),
  status: animalStatusSchema.optional(),
  dob: z.coerce.date().optional(),
  sireId: z.string().uuid().nullable().optional(),
  damId: z.string().uuid().nullable().optional(),
});

export type UpdateAnimalInput = z.infer<typeof updateAnimalInputSchema>;

/**
 * Get animal input
 */
export const getAnimalInputSchema = z.object({
  id: z.string().uuid(),
  farmId: z.string().uuid(),
});

export type GetAnimalInput = z.infer<typeof getAnimalInputSchema>;

/**
 * List animals input
 */
export const listAnimalsInputSchema = z.object({
  farmId: z.string().uuid(),
  q: z.string().optional(), // Search query
  status: animalStatusSchema.optional(),
  type: animalTypeSchema.optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type ListAnimalsInput = z.infer<typeof listAnimalsInputSchema>;

/**
 * Delete animal input (soft delete)
 */
export const deleteAnimalInputSchema = z.object({
  id: z.string().uuid(),
  farmId: z.string().uuid(),
});

export type DeleteAnimalInput = z.infer<typeof deleteAnimalInputSchema>;

/**
 * Search animals input
 */
export const searchAnimalsInputSchema = z.object({
  farmId: z.string().uuid(),
  q: z.string().min(1, 'Search query is required'),
  limit: z.number().min(1).max(50).default(20),
});

export type SearchAnimalsInput = z.infer<typeof searchAnimalsInputSchema>;

