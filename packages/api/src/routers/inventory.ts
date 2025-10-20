/**
 * Inventory router - Inventory management
 */

import { TRPCError } from '@trpc/server';
import { router, farmProcedure } from '../trpc';
import {
  createInventoryItemInputSchema,
  updateInventoryItemInputSchema,
  createSupplierInputSchema,
  createInventoryBatchInputSchema,
  createInventoryTransactionInputSchema,
  listInventoryItemsInputSchema,
  listInventoryTransactionsInputSchema,
} from '@farmy/validators';
import { hasPermission, Permission } from '@farmy/auth';

export const inventoryRouter = router({
  items: router({
    /**
     * List inventory items
     */
    list: farmProcedure
      .input(listInventoryItemsInputSchema)
      .query(async ({ ctx, input }) => {
        const where: any = { farmId: input.farmId };

        if (input.category) {
          where.category = input.category;
        }

        const items = await ctx.prisma.inventoryItem.findMany({
          where,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { name: 'asc' },
          include: {
            supplier: {
              select: { id: true, name: true },
            },
          },
        });

        let nextCursor: string | undefined = undefined;
        if (items.length > input.limit) {
          const nextItem = items.pop();
          nextCursor = nextItem!.id;
        }

        return {
          items,
          nextCursor,
        };
      }),

    /**
     * Create inventory item
     */
    create: farmProcedure
      .input(createInventoryItemInputSchema)
      .mutation(async ({ ctx, input }) => {
        // Check permission
        if (!hasPermission(ctx.role, Permission.INVENTORY_CREATE)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to create inventory items',
          });
        }

        const item = await ctx.prisma.inventoryItem.create({
          data: {
            farmId: input.farmId,
            name: input.name,
            category: input.category,
            unit: input.unit,
            reorderLevel: input.reorderLevel,
            supplierId: input.supplierId,
          },
        });

        return item;
      }),

    /**
     * Update inventory item
     */
    update: farmProcedure
      .input(updateInventoryItemInputSchema)
      .mutation(async ({ ctx, input }) => {
        // Check permission
        if (!hasPermission(ctx.role, Permission.INVENTORY_UPDATE)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update inventory items',
          });
        }

        const item = await ctx.prisma.inventoryItem.update({
          where: { id: input.id },
          data: {
            name: input.name,
            category: input.category,
            unit: input.unit,
            reorderLevel: input.reorderLevel,
            supplierId: input.supplierId === null ? null : input.supplierId,
          },
        });

        return item;
      }),
  }),

  suppliers: router({
    /**
     * Create supplier
     */
    create: farmProcedure
      .input(createSupplierInputSchema)
      .mutation(async ({ ctx, input }) => {
        const supplier = await ctx.prisma.supplier.create({
          data: {
            farmId: input.farmId,
            name: input.name,
            phone: input.phone,
            notes: input.notes,
          },
        });

        return supplier;
      }),
  }),

  batches: router({
    /**
     * Create inventory batch
     */
    create: farmProcedure
      .input(createInventoryBatchInputSchema)
      .mutation(async ({ ctx, input }) => {
        const batch = await ctx.prisma.inventoryBatch.create({
          data: {
            farmId: input.farmId,
            itemId: input.itemId,
            batchCode: input.batchCode,
            quantity: input.quantity,
            unitCost: input.unitCost,
            purchaseDate: input.purchaseDate,
            supplierId: input.supplierId,
            expiryDate: input.expiryDate,
          },
        });

        return batch;
      }),
  }),

  transactions: router({
    /**
     * List transactions
     */
    list: farmProcedure
      .input(listInventoryTransactionsInputSchema)
      .query(async ({ ctx, input }) => {
        const where: any = { farmId: input.farmId };

        if (input.itemId) {
          where.itemId = input.itemId;
        }
        if (input.type) {
          where.type = input.type;
        }
        if (input.startDate || input.endDate) {
          where.date = {};
          if (input.startDate) {
            where.date.gte = input.startDate;
          }
          if (input.endDate) {
            where.date.lte = input.endDate;
          }
        }

        const transactions = await ctx.prisma.inventoryTransaction.findMany({
          where,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { date: 'desc' },
          include: {
            item: {
              select: { id: true, name: true, unit: true },
            },
          },
        });

        let nextCursor: string | undefined = undefined;
        if (transactions.length > input.limit) {
          const nextItem = transactions.pop();
          nextCursor = nextItem!.id;
        }

        return {
          items: transactions,
          nextCursor,
        };
      }),

    /**
     * Create transaction
     */
    create: farmProcedure
      .input(createInventoryTransactionInputSchema)
      .mutation(async ({ ctx, input }) => {
        const transaction = await ctx.prisma.inventoryTransaction.create({
          data: {
            farmId: input.farmId,
            itemId: input.itemId,
            type: input.type,
            quantity: input.quantity,
            batchId: input.batchId,
            costValue: input.costValue,
            costSource: input.costSource,
            confidence: input.confidence,
            date: input.date,
            notes: input.notes,
            createdBy: ctx.user.userId,
          },
        });

        return transaction;
      }),
  }),
});

