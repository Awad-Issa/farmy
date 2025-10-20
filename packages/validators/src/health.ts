import { z } from 'zod';

// ============================================================================
// HEALTH VALIDATORS
// ============================================================================

/**
 * Health event type
 */
export const healthEventTypeSchema = z.enum([
  'DIAGNOSIS',
  'TREATMENT',
  'VACCINE',
  'SUPPLEMENT',
  'CHECKUP',
  'INJURY',
  'DEATH',
]);

export type HealthEventType = z.infer<typeof healthEventTypeSchema>;

/**
 * Treatment route
 */
export const treatmentRouteSchema = z.enum([
  'ORAL',
  'INJECTION_IM',
  'INJECTION_IV',
  'INJECTION_SC',
  'TOPICAL',
  'OTHER',
]);

export type TreatmentRoute = z.infer<typeof treatmentRouteSchema>;

/**
 * Dose status
 */
export const doseStatusSchema = z.enum([
  'SCHEDULED',
  'GIVEN',
  'SKIPPED',
  'OVERDUE',
]);

export type DoseStatus = z.infer<typeof doseStatusSchema>;

/**
 * Create health event input
 */
export const createHealthEventInputSchema = z.object({
  animalId: z.string().uuid(),
  farmId: z.string().uuid(),
  type: healthEventTypeSchema,
  date: z.coerce.date(),
  diagnosisCode: z.string().optional(),
  payload: z.record(z.any()).optional(),
});

export type CreateHealthEventInput = z.infer<
  typeof createHealthEventInputSchema
>;

/**
 * Create treatment input
 */
export const createTreatmentInputSchema = z.object({
  healthEventId: z.string().uuid().optional(),
  animalId: z.string().uuid(),
  farmId: z.string().uuid(),
  drug: z.string().min(1, 'Drug name is required'),
  dose: z.string().min(1, 'Dose is required'),
  route: treatmentRouteSchema,
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.number().int().positive().optional(),
  startDate: z.coerce.date(),
  withdrawalMilkEnd: z.coerce.date().optional(),
  withdrawalMeatEnd: z.coerce.date().optional(),
  lot: z.string().optional(),
  expiry: z.coerce.date().optional(),
});

export type CreateTreatmentInput = z.infer<typeof createTreatmentInputSchema>;

/**
 * Update treatment input
 */
export const updateTreatmentInputSchema = z.object({
  id: z.string().uuid(),
  farmId: z.string().uuid(),
  drug: z.string().min(1).optional(),
  dose: z.string().min(1).optional(),
  route: treatmentRouteSchema.optional(),
  frequency: z.string().min(1).optional(),
  duration: z.number().int().positive().optional(),
  withdrawalMilkEnd: z.coerce.date().optional(),
  withdrawalMeatEnd: z.coerce.date().optional(),
});

export type UpdateTreatmentInput = z.infer<typeof updateTreatmentInputSchema>;

/**
 * Record dose input
 */
export const recordDoseInputSchema = z.object({
  doseId: z.string().uuid(),
  givenAt: z.coerce.date(),
  notes: z.string().optional(),
});

export type RecordDoseInput = z.infer<typeof recordDoseInputSchema>;

/**
 * Check withdrawal status input
 */
export const checkWithdrawalInputSchema = z.object({
  farmId: z.string().uuid(),
  animalIds: z.array(z.string().uuid()).min(1),
});

export type CheckWithdrawalInput = z.infer<typeof checkWithdrawalInputSchema>;

/**
 * List health events input
 */
export const listHealthEventsInputSchema = z.object({
  farmId: z.string().uuid(),
  animalId: z.string().uuid().optional(),
  type: healthEventTypeSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type ListHealthEventsInput = z.infer<typeof listHealthEventsInputSchema>;

