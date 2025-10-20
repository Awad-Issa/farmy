import { z } from 'zod';

// ============================================================================
// INVENTORY VALIDATORS
// ============================================================================

/**
 * Inventory category
 */
export const inventoryCategorySchema = z.enum([
  'FEED',
  'MEDICINE',
  'VACCINE',
  'SUPPLEMENT',
  'EQUIPMENT',
  'SUPPLIES',
  'OTHER',
]);

export type InventoryCategory = z.infer<typeof inventoryCategorySchema>;

/**
 * Inventory transaction type
 */
export const inventoryTransactionTypeSchema = z.enum([
  'PURCHASE',
  'USAGE',
  'ADJUSTMENT',
  'WASTE',
]);

export type InventoryTransactionType = z.infer<
  typeof inventoryTransactionTypeSchema
>;

/**
 * Cost source
 */
export const costSourceSchema = z.enum([
  'BATCH',
  'FIFO',
  'LAST_KNOWN',
  'CATALOG',
  'DERIVED',
  'FUZZY',
  'REFERENCE',
  'ZERO',
]);

export type CostSource = z.infer<typeof costSourceSchema>;

/**
 * Cost confidence
 */
export const costConfidenceSchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);

export type CostConfidence = z.infer<typeof costConfidenceSchema>;

/**
 * Create inventory item input
 */
export const createInventoryItemInputSchema = z.object({
  farmId: z.string().uuid(),
  name: z.string().min(1, 'Item name is required'),
  category: inventoryCategorySchema,
  unit: z.string().min(1, 'Unit is required'),
  reorderLevel: z.number().positive().optional(),
  supplierId: z.string().uuid().optional(),
});

export type CreateInventoryItemInput = z.infer<
  typeof createInventoryItemInputSchema
>;

/**
 * Update inventory item input
 */
export const updateInventoryItemInputSchema = z.object({
  id: z.string().uuid(),
  farmId: z.string().uuid(),
  name: z.string().min(1).optional(),
  category: inventoryCategorySchema.optional(),
  unit: z.string().min(1).optional(),
  reorderLevel: z.number().positive().optional(),
  supplierId: z.string().uuid().nullable().optional(),
});

export type UpdateInventoryItemInput = z.infer<
  typeof updateInventoryItemInputSchema
>;

/**
 * Create supplier input
 */
export const createSupplierInputSchema = z.object({
  farmId: z.string().uuid(),
  name: z.string().min(1, 'Supplier name is required'),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierInputSchema>;

/**
 * Create inventory batch input
 */
export const createInventoryBatchInputSchema = z.object({
  itemId: z.string().uuid(),
  farmId: z.string().uuid(),
  batchCode: z.string().min(1, 'Batch code is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitCost: z.number().positive('Unit cost must be positive'),
  purchaseDate: z.coerce.date(),
  supplierId: z.string().uuid().optional(),
  expiryDate: z.coerce.date().optional(),
});

export type CreateInventoryBatchInput = z.infer<
  typeof createInventoryBatchInputSchema
>;

/**
 * Create inventory transaction input
 */
export const createInventoryTransactionInputSchema = z.object({
  itemId: z.string().uuid(),
  farmId: z.string().uuid(),
  type: inventoryTransactionTypeSchema,
  quantity: z.number().positive('Quantity must be positive'),
  batchId: z.string().uuid().optional(),
  costValue: z.number().optional(),
  costSource: costSourceSchema.optional(),
  confidence: costConfidenceSchema.optional(),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

export type CreateInventoryTransactionInput = z.infer<
  typeof createInventoryTransactionInputSchema
>;

/**
 * List inventory items input
 */
export const listInventoryItemsInputSchema = z.object({
  farmId: z.string().uuid(),
  category: inventoryCategorySchema.optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type ListInventoryItemsInput = z.infer<
  typeof listInventoryItemsInputSchema
>;

/**
 * List inventory transactions input
 */
export const listInventoryTransactionsInputSchema = z.object({
  farmId: z.string().uuid(),
  itemId: z.string().uuid().optional(),
  type: inventoryTransactionTypeSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type ListInventoryTransactionsInput = z.infer<
  typeof listInventoryTransactionsInputSchema
>;

