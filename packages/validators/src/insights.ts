import { z } from 'zod';

// ============================================================================
// INSIGHTS VALIDATORS
// ============================================================================

/**
 * Action event type
 */
export const actionEventTypeSchema = z.enum([
  'SHEARING',
  'SUPPLIER_CHANGE',
  'RATION_CHANGE',
  'PROTOCOL_SHIFT',
  'PEN_MOVE',
  'OTHER',
]);

export type ActionEventType = z.infer<typeof actionEventTypeSchema>;

/**
 * Metric type
 */
export const metricTypeSchema = z.enum([
  'ADG',
  'MILK_YIELD',
  'CONCEPTION_RATE',
  'SICKNESS_RATE',
  'MORTALITY_RATE',
  'OTHER',
]);

export type MetricType = z.infer<typeof metricTypeSchema>;

/**
 * Insight confidence
 */
export const insightConfidenceSchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);

export type InsightConfidence = z.infer<typeof insightConfidenceSchema>;

/**
 * Insight status
 */
export const insightStatusSchema = z.enum(['ACTIVE', 'CONFIRMED', 'MUTED']);

export type InsightStatus = z.infer<typeof insightStatusSchema>;

/**
 * Create action event input
 */
export const createActionEventInputSchema = z.object({
  farmId: z.string().uuid(),
  type: actionEventTypeSchema,
  date: z.coerce.date(),
  affectedAnimalIds: z.array(z.string().uuid()).min(1),
  payload: z.record(z.any()).optional(),
});

export type CreateActionEventInput = z.infer<
  typeof createActionEventInputSchema
>;

/**
 * List action events input
 */
export const listActionEventsInputSchema = z.object({
  farmId: z.string().uuid(),
  type: actionEventTypeSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type ListActionEventsInput = z.infer<typeof listActionEventsInputSchema>;

/**
 * List insight cards input
 */
export const listInsightCardsInputSchema = z.object({
  farmId: z.string().uuid(),
  status: insightStatusSchema.optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type ListInsightCardsInput = z.infer<typeof listInsightCardsInputSchema>;

/**
 * Update insight card status input
 */
export const updateInsightCardStatusInputSchema = z.object({
  id: z.string().uuid(),
  farmId: z.string().uuid(),
  status: insightStatusSchema,
});

export type UpdateInsightCardStatusInput = z.infer<
  typeof updateInsightCardStatusInputSchema
>;

/**
 * Get insight card input
 */
export const getInsightCardInputSchema = z.object({
  id: z.string().uuid(),
  farmId: z.string().uuid(),
});

export type GetInsightCardInput = z.infer<typeof getInsightCardInputSchema>;

