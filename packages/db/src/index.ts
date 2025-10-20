/**
 * @farmy/db - Prisma database client
 * 
 * This package contains the Prisma schema and generated client.
 * Schema includes 30+ models:
 * - Identity: User, Farm, FarmMember, SuperAdmin
 * - Animals: Animal, BreedingCycle, BreedingEvent
 * - Health: HealthEvent, Treatment, Dose
 * - Weight: Weight, FeedPlan, LambFeeding
 * - Milk & Sales: MilkYield, MilkSale, AnimalSale
 * - Inventory: InventoryItem, InventoryBatch, InventoryTransaction, Supplier
 * - Insights: ActionEvent, MetricSnapshot, InsightCard
 * - System: Reminder, NotificationInbox, DeviceToken, Tombstone, AuditLog, Attachment
 */

import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma client
// Prevents multiple instances in development (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Re-export Prisma types
export * from '@prisma/client';

