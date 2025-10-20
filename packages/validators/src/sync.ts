import { z } from 'zod';

// ============================================================================
// SYNC VALIDATORS
// ============================================================================

/**
 * Entity type for sync
 */
export const syncEntityTypeSchema = z.enum([
  'Animal',
  'BreedingCycle',
  'BreedingEvent',
  'HealthEvent',
  'Treatment',
  'Dose',
  'Weight',
  'FeedPlan',
  'LambFeeding',
  'MilkYield',
  'MilkSale',
  'AnimalSale',
  'InventoryItem',
  'InventoryBatch',
  'InventoryTransaction',
  'Supplier',
  'Reminder',
  'NotificationInbox',
  'ActionEvent',
  'MetricSnapshot',
  'InsightCard',
]);

export type SyncEntityType = z.infer<typeof syncEntityTypeSchema>;

/**
 * Pull changes input
 */
export const pullChangesInputSchema = z.object({
  farmId: z.string().uuid(),
  since: z.coerce.date(), // Last sync timestamp
  entities: z.array(syncEntityTypeSchema).optional(), // Optional entity filter
});

export type PullChangesInput = z.infer<typeof pullChangesInputSchema>;

/**
 * Push mutation input
 */
export const pushMutationInputSchema = z.object({
  farmId: z.string().uuid(),
  clientMutationId: z.string().uuid(), // For idempotency
  entity: syncEntityTypeSchema,
  operation: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  data: z.record(z.any()), // Entity data
  localId: z.string().optional(), // Local temporary ID
  timestamp: z.coerce.date(),
});

export type PushMutationInput = z.infer<typeof pushMutationInputSchema>;

/**
 * Batch push mutations input
 */
export const batchPushMutationsInputSchema = z.object({
  farmId: z.string().uuid(),
  mutations: z.array(pushMutationInputSchema).min(1).max(100),
});

export type BatchPushMutationsInput = z.infer<
  typeof batchPushMutationsInputSchema
>;

/**
 * Get tombstones input
 */
export const getTombstonesInputSchema = z.object({
  farmId: z.string().uuid(),
  since: z.coerce.date(),
  entity: syncEntityTypeSchema.optional(),
});

export type GetTombstonesInput = z.infer<typeof getTombstonesInputSchema>;

