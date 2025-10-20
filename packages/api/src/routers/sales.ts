/**
 * Sales router - Animal sales
 */

import { TRPCError } from '@trpc/server';
import { router, farmProcedure } from '../trpc';
import {
  createAnimalSaleInputSchema,
  listAnimalSalesInputSchema,
  getAnimalSaleInputSchema,
} from '@farmy/validators';
import { hasPermission, Permission } from '@farmy/auth';

export const salesRouter = router({
  /**
   * List animal sales
   */
  list: farmProcedure
    .input(listAnimalSalesInputSchema)
    .query(async ({ ctx, input }) => {
      const where: any = { farmId: input.farmId };

      if (input.animalId) {
        where.animalId = input.animalId;
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

      const sales = await ctx.prisma.animalSale.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { date: 'desc' },
        include: {
          animal: {
            select: { id: true, tagNumber: true, type: true },
          },
        },
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
   * Get single animal sale
   */
  get: farmProcedure
    .input(getAnimalSaleInputSchema)
    .query(async ({ ctx, input }) => {
      const sale = await ctx.prisma.animalSale.findFirst({
        where: {
          id: input.id,
          farmId: input.farmId,
        },
        include: {
          animal: true,
        },
      });

      if (!sale) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sale not found',
        });
      }

      return sale;
    }),

  /**
   * Create animal sale
   */
  create: farmProcedure
    .input(createAnimalSaleInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permission
      if (!hasPermission(ctx.role, Permission.SALES_CREATE)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to record sales',
        });
      }

      // Create sale
      const sale = await ctx.prisma.animalSale.create({
        data: {
          farmId: input.farmId,
          animalId: input.animalId,
          date: input.date,
          type: input.type,
          weightKg: input.weightKg,
          price: input.price,
          buyerName: input.buyerName,
          createdBy: ctx.user.userId,
        },
      });

      // Update animal status to SOLD
      await ctx.prisma.animal.update({
        where: { id: input.animalId },
        data: { status: 'SOLD' },
      });

      return sale;
    }),
});

