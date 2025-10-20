/**
 * Sync router - Offline sync (pull/push)
 */

// import { TRPCError } from '@trpc/server';
import { router, farmProcedure } from '../trpc';
import {
  pullChangesInputSchema,
  pushMutationInputSchema,
  batchPushMutationsInputSchema,
  getTombstonesInputSchema,
} from '@farmy/validators';

export const syncRouter = router({
  /**
   * Pull changes since last sync
   */
  pull: farmProcedure
    .input(pullChangesInputSchema)
    .query(async ({ ctx, input }) => {
      const { farmId, since, entities } = input;

      const changes: Record<string, any[]> = {};

      // Helper to fetch entity changes
      const fetchEntityChanges = async (entityName: string, model: any) => {
        if (!entities || entities.includes(entityName as any)) {
          const records = await model.findMany({
            where: {
              farmId,
              updatedAt: { gt: since },
            },
            orderBy: { updatedAt: 'asc' },
          });
          changes[entityName] = records;
        }
      };

      // Fetch changes for each entity
      await Promise.all([
        fetchEntityChanges('Animal', ctx.prisma.animal),
        fetchEntityChanges('BreedingCycle', ctx.prisma.breedingCycle),
        fetchEntityChanges('BreedingEvent', ctx.prisma.breedingEvent),
        fetchEntityChanges('HealthEvent', ctx.prisma.healthEvent),
        fetchEntityChanges('Treatment', ctx.prisma.treatment),
        fetchEntityChanges('Dose', ctx.prisma.dose),
        fetchEntityChanges('Weight', ctx.prisma.weight),
        fetchEntityChanges('MilkYield', ctx.prisma.milkYield),
        fetchEntityChanges('MilkSale', ctx.prisma.milkSale),
        fetchEntityChanges('AnimalSale', ctx.prisma.animalSale),
        fetchEntityChanges('InventoryItem', ctx.prisma.inventoryItem),
        fetchEntityChanges('InventoryBatch', ctx.prisma.inventoryBatch),
        fetchEntityChanges('InventoryTransaction', ctx.prisma.inventoryTransaction),
        fetchEntityChanges('Reminder', ctx.prisma.reminder),
        fetchEntityChanges('NotificationInbox', ctx.prisma.notificationInbox),
      ]);

      // Get tombstones (deleted records)
      const tombstones = await ctx.prisma.tombstone.findMany({
        where: {
          farmId,
          deletedAt: { gt: since },
        },
      });

      return {
        changes,
        tombstones,
        serverTime: new Date(),
      };
    }),

  /**
   * Push single mutation
   */
  push: farmProcedure
    .input(pushMutationInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check for duplicate clientMutationId (idempotency)
      const existing = await ctx.prisma.auditLog.findFirst({
        where: {
          farmId: input.farmId,
          action: `SYNC_${input.operation}`,
          entityType: input.entity,
          entityId: input.clientMutationId,
        },
      });

      if (existing) {
        // Already processed
        return { success: true, serverId: existing.entityId };
      }

      // Process mutation based on operation
      let serverId: string | null = null;

      // This is a simplified implementation
      // In production, would need proper mapping for each entity type
      if (input.operation === 'CREATE') {
        // Create entity
        // Would need proper entity-specific logic here
      } else if (input.operation === 'UPDATE') {
        // Update entity
      } else if (input.operation === 'DELETE') {
        // Delete entity
      }

      // Log mutation
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.user.userId,
          farmId: input.farmId,
          action: `SYNC_${input.operation}`,
          entityType: input.entity,
          entityId: input.clientMutationId,
        },
      });

      return { success: true, serverId };
    }),

  /**
   * Push batch of mutations
   */
  pushBatch: farmProcedure
    .input(batchPushMutationsInputSchema)
    .mutation(async ({ ctx: _ctx, input }) => {
      const results = [];

      for (const mutation of input.mutations) {
        try {
          // Process each mutation
          // This would use the same logic as push()
          results.push({
            clientMutationId: mutation.clientMutationId,
            success: true,
            serverId: null,
          });
        } catch (error) {
          results.push({
            clientMutationId: mutation.clientMutationId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return { results };
    }),

  /**
   * Get tombstones (deleted records)
   */
  tombstones: farmProcedure
    .input(getTombstonesInputSchema)
    .query(async ({ ctx, input }) => {
      const where: any = {
        farmId: input.farmId,
        deletedAt: { gt: input.since },
      };

      if (input.entity) {
        where.entity = input.entity;
      }

      const tombstones = await ctx.prisma.tombstone.findMany({
        where,
        orderBy: { deletedAt: 'asc' },
      });

      return tombstones;
    }),
});

