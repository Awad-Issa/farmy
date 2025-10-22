/**
 * Cost Resolver Service
 * Implements confidence-based cost resolution with fallback chain
 * 
 * CRON SCHEDULE: Nightly (e.g., 2:00 AM)
 * Job: cost:backfill
 * 
 * Per PLAN.md §5.2, §5.7 and System_Technical_Spec §7.7
 * 
 * Resolution Order:
 * 1. Batch/FIFO (HIGH confidence)
 * 2. Last Known Price (MEDIUM confidence)
 * 3. Catalog Default (MEDIUM confidence)
 * 4. Derived from unit conversion (MEDIUM confidence)
 * 5. Fuzzy name match (LOW confidence)
 * 6. Reference price (LOW confidence)
 * 7. Zero (LOW confidence)
 */

import { prisma } from '@farmy/db';

export type CostSource =
  | 'BATCH_FIFO'
  | 'LAST_KNOWN'
  | 'CATALOG'
  | 'DERIVED'
  | 'FUZZY'
  | 'REFERENCE'
  | 'ZERO';

export type CostConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CostResolution {
  costValue: number;
  costSource: CostSource;
  confidence: CostConfidence;
  notes?: string;
}

/**
 * Resolve cost for an inventory transaction
 * Implements the fallback chain per System_Technical_Spec §7.7
 */
export async function resolveCost(
  farmId: string,
  itemId: string,
  quantity: number,
  transactionDate: Date
): Promise<CostResolution> {
  // 1. Try Batch/FIFO
  const batchCost = await resolveBatchFIFO(farmId, itemId, quantity, transactionDate);
  if (batchCost) {
    return {
      costValue: batchCost,
      costSource: 'BATCH_FIFO',
      confidence: 'HIGH',
      notes: 'Resolved from batch FIFO',
    };
  }

  // 2. Try Last Known Price
  const lastKnownCost = await resolveLastKnownPrice(farmId, itemId, transactionDate);
  if (lastKnownCost) {
    return {
      costValue: lastKnownCost * quantity,
      costSource: 'LAST_KNOWN',
      confidence: 'MEDIUM',
      notes: 'Using last known purchase price',
    };
  }

  // 3. Try Catalog Default
  const catalogCost = await resolveCatalogPrice(itemId, quantity);
  if (catalogCost) {
    return {
      costValue: catalogCost,
      costSource: 'CATALOG',
      confidence: 'MEDIUM',
      notes: 'Using catalog default price',
    };
  }

  // 4. Try Derived from unit conversion
  const derivedCost = await resolveDerivedPrice(farmId, itemId, quantity);
  if (derivedCost) {
    return {
      costValue: derivedCost,
      costSource: 'DERIVED',
      confidence: 'MEDIUM',
      notes: 'Derived from unit conversion',
    };
  }

  // 5. Try Fuzzy name match
  const fuzzyCost = await resolveFuzzyMatch(farmId, itemId, quantity);
  if (fuzzyCost) {
    return {
      costValue: fuzzyCost,
      costSource: 'FUZZY',
      confidence: 'LOW',
      notes: 'Fuzzy match from similar items',
    };
  }

  // 6. Try Reference price (industry average)
  const referenceCost = await resolveReferencePrice(itemId, quantity);
  if (referenceCost) {
    return {
      costValue: referenceCost,
      costSource: 'REFERENCE',
      confidence: 'LOW',
      notes: 'Using reference/industry price',
    };
  }

  // 7. Fall back to zero
  return {
    costValue: 0,
    costSource: 'ZERO',
    confidence: 'LOW',
    notes: 'No cost data available',
  };
}

/**
 * Resolve cost using Batch/FIFO method
 * Highest confidence - actual purchase cost
 */
async function resolveBatchFIFO(
  farmId: string,
  itemId: string,
  quantity: number,
  transactionDate: Date
): Promise<number | null> {
  // Get available batches ordered by purchase date (FIFO)
  const batches = await prisma.inventoryBatch.findMany({
    where: {
      farmId,
      itemId,
      purchaseDate: { lte: transactionDate },
      quantity: { gt: 0 },
      deletedAt: null,
    },
    orderBy: { purchaseDate: 'asc' },
  });

  if (batches.length === 0) return null;

  let remainingQty = quantity;
  let totalCost = 0;

  for (const batch of batches) {
    if (remainingQty <= 0) break;

    const qtyFromBatch = Math.min(remainingQty, batch.quantity);
    totalCost += qtyFromBatch * batch.unitCost;
    remainingQty -= qtyFromBatch;
  }

  return remainingQty === 0 ? totalCost : null;
}

/**
 * Resolve cost using last known purchase price
 */
async function resolveLastKnownPrice(
  farmId: string,
  itemId: string,
  transactionDate: Date
): Promise<number | null> {
  const lastPurchase = await prisma.inventoryTransaction.findFirst({
    where: {
      farmId,
      itemId,
      type: 'PURCHASE',
      date: { lte: transactionDate },
      costValue: { not: null },
      deletedAt: null,
    },
    orderBy: { date: 'desc' },
  });

  if (!lastPurchase || !lastPurchase.costValue) return null;

  // Calculate unit cost
  return lastPurchase.costValue / lastPurchase.quantity;
}

/**
 * Resolve cost from catalog/default price
 * (This would be a separate catalog table in production)
 */
async function resolveCatalogPrice(
  itemId: string,
  quantity: number
): Promise<number | null> {
  // TODO: Implement catalog price lookup
  // For now, return null
  // In production, this would query a price catalog table
  return null;
}

/**
 * Resolve cost by deriving from unit conversions
 * E.g., if we know price per kg, derive price per ton
 */
async function resolveDerivedPrice(
  farmId: string,
  itemId: string,
  quantity: number
): Promise<number | null> {
  // TODO: Implement unit conversion logic
  // For now, return null
  return null;
}

/**
 * Resolve cost using fuzzy name matching
 * Find similar items and use their average cost
 */
async function resolveFuzzyMatch(
  farmId: string,
  itemId: string,
  quantity: number
): Promise<number | null> {
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
  });

  if (!item) return null;

  // Find similar items by name (simple contains match)
  const similarItems = await prisma.inventoryItem.findMany({
    where: {
      farmId,
      category: item.category,
      name: { contains: item.name.split(' ')[0] }, // Match first word
      id: { not: itemId },
      deletedAt: null,
    },
    take: 5,
  });

  if (similarItems.length === 0) return null;

  // Get average cost from similar items
  let totalCost = 0;
  let count = 0;

  for (const similar of similarItems) {
    const lastPrice = await resolveLastKnownPrice(farmId, similar.id, new Date());
    if (lastPrice) {
      totalCost += lastPrice;
      count++;
    }
  }

  return count > 0 ? (totalCost / count) * quantity : null;
}

/**
 * Resolve cost using reference/industry prices
 * (This would be a reference price table in production)
 */
async function resolveReferencePrice(
  itemId: string,
  quantity: number
): Promise<number | null> {
  // TODO: Implement reference price lookup
  // For now, return null
  // In production, this would query a reference price table
  return null;
}

/**
 * Backfill costs for transactions with low confidence
 * Attempts to upgrade confidence level using newer data
 * 
 * CRON: Nightly at 2:00 AM
 */
export async function backfillCosts(): Promise<{
  transactionsProcessed: number;
  transactionsUpgraded: number;
}> {
  console.log('[Cost Backfill] Starting nightly backfill...');

  // Get transactions with LOW confidence or ZERO cost
  const transactions = await prisma.inventoryTransaction.findMany({
    where: {
      OR: [
        { confidence: 'LOW' },
        { costSource: 'ZERO' },
        { costValue: 0 },
      ],
      type: 'USAGE', // Focus on usage transactions
      deletedAt: null,
    },
    orderBy: { date: 'asc' },
    take: 1000, // Process in batches
  });

  let upgraded = 0;

  for (const transaction of transactions) {
    try {
      // Re-resolve cost with current data
      const resolution = await resolveCost(
        transaction.farmId,
        transaction.itemId,
        transaction.quantity,
        new Date(transaction.date)
      );

      // Only update if confidence improved
      const currentConfidenceScore = getConfidenceScore(transaction.confidence as CostConfidence);
      const newConfidenceScore = getConfidenceScore(resolution.confidence);

      if (newConfidenceScore > currentConfidenceScore) {
        await prisma.inventoryTransaction.update({
          where: { id: transaction.id },
          data: {
            costValue: resolution.costValue,
            costSource: resolution.costSource,
            confidence: resolution.confidence,
            updatedAt: new Date(),
          },
        });
        upgraded++;
      }
    } catch (error) {
      console.error(`[Cost Backfill] Error processing transaction ${transaction.id}:`, error);
    }
  }

  console.log(
    `[Cost Backfill] Complete: ${transactions.length} processed, ${upgraded} upgraded`
  );

  return {
    transactionsProcessed: transactions.length,
    transactionsUpgraded: upgraded,
  };
}

/**
 * Helper to compare confidence levels
 */
function getConfidenceScore(confidence: CostConfidence): number {
  switch (confidence) {
    case 'HIGH':
      return 3;
    case 'MEDIUM':
      return 2;
    case 'LOW':
      return 1;
    default:
      return 0;
  }
}

/**
 * CRON JOB SETUP NOTES:
 * 
 * Using node-cron:
 * 
 * ```typescript
 * import cron from 'node-cron';
 * import { backfillCosts } from './services/cost-resolver.service';
 * 
 * // Run nightly at 2:00 AM
 * cron.schedule('0 2 * * *', async () => {
 *   await backfillCosts();
 * });
 * ```
 */


