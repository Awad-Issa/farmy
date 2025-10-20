/**
 * Milk router - Milk yields and sales
 */

import { TRPCError } from '@trpc/server';
import { router, farmProcedure } from '../trpc';
import {
  createMilkYieldInputSchema,
  batchMilkYieldInputSchema,
  createMilkSaleInputSchema,
  listMilkYieldsInputSchema,
  listMilkSalesInputSchema,
} from '@farmy/validators';
import { hasPermission, Permission } from '@farmy/auth';

export const milkRouter = router({
  yields: router({
    /**
     * List milk yields
     */
    list: farmProcedure
      .input(listMilkYieldsInputSchema)
      .query(async ({ ctx, input }) => {
        const where: any = { farmId: input.farmId };

        if (input.animalId) {
          where.animalId = input.animalId;
        }
        if (input.startDate || input.endDate) {
          where.at = {};
          if (input.startDate) {
            where.at.gte = input.startDate;
          }
          if (input.endDate) {
            where.at.lte = input.endDate;
          }
        }

        const yields = await ctx.prisma.milkYield.findMany({
          where,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { at: 'desc' },
          include: {
            animal: {
              select: { id: true, tagNumber: true },
            },
          },
        });

        let nextCursor: string | undefined = undefined;
        if (yields.length > input.limit) {
          const nextItem = yields.pop();
          nextCursor = nextItem!.id;
        }

        return {
          items: yields,
          nextCursor,
        };
      }),

    /**
     * Create milk yield
     */
    create: farmProcedure
      .input(createMilkYieldInputSchema)
      .mutation(async ({ ctx, input }) => {
        // Check permission
        if (!hasPermission(ctx.role, Permission.MILK_CREATE)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to record milk yields',
          });
        }

        const yield_ = await ctx.prisma.milkYield.create({
          data: {
            farmId: input.farmId,
            animalId: input.animalId,
            at: input.at,
            liters: input.liters,
            recordedBy: ctx.user.userId,
          },
        });

        return yield_;
      }),

    /**
     * Batch milk yield entry
     */
    batchCreate: farmProcedure
      .input(batchMilkYieldInputSchema)
      .mutation(async ({ ctx, input }) => {
        // Check permission
        if (!hasPermission(ctx.role, Permission.MILK_CREATE)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to record milk yields',
          });
        }

        const yields = await ctx.prisma.milkYield.createMany({
          data: input.yields.map((y) => ({
            farmId: input.farmId,
            animalId: y.animalId,
            at: input.at,
            liters: y.liters,
            recordedBy: ctx.user.userId,
          })),
        });

        return { count: yields.count };
      }),
  }),

  sales: router({
    /**
     * List milk sales
     */
    list: farmProcedure
      .input(listMilkSalesInputSchema)
      .query(async ({ ctx, input }) => {
        const where: any = { farmId: input.farmId };

        if (input.startDate || input.endDate) {
          where.date = {};
          if (input.startDate) {
            where.date.gte = input.startDate;
          }
          if (input.endDate) {
            where.date.lte = input.endDate;
          }
        }

        const sales = await ctx.prisma.milkSale.findMany({
          where,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { date: 'desc' },
        });

        let nextCursor: string | undefined = undefined;
        if (sales.length > input.limit) {
          const nextItem = sales.pop();
          nextCursor = nextItem!.id;
        }

        return {
          items: sales,
          nextCursor,
        };
      }),

    /**
     * Create milk sale
     */
    create: farmProcedure
      .input(createMilkSaleInputSchema)
      .mutation(async ({ ctx, input }) => {
        // Check permission
        if (!hasPermission(ctx.role, Permission.MILK_CREATE)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to record milk sales',
          });
        }

        const totalRevenue = input.volumeLiters * input.pricePerLiter;

        const sale = await ctx.prisma.milkSale.create({
          data: {
            farmId: input.farmId,
            date: input.date,
            volumeLiters: input.volumeLiters,
            pricePerLiter: input.pricePerLiter,
            buyerName: input.buyerName,
            totalRevenue,
            createdBy: ctx.user.userId,
          },
        });

        return sale;
      }),
  }),
});

