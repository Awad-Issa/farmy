/**
 * Weights router - Weight and feed management
 */

import { TRPCError } from '@trpc/server';
import { router, farmProcedure } from '../trpc';
import {
  createWeightInputSchema,
  batchWeightInputSchema,
  listWeightsInputSchema,
  createFeedPlanInputSchema,
  createLambFeedingInputSchema,
} from '@farmy/validators';
import { hasPermission, Permission } from '@farmy/auth';

export const weightsRouter = router({
  /**
   * List weights
   */
  list: farmProcedure
    .input(listWeightsInputSchema)
    .query(async ({ ctx, input }) => {
      const where: any = { farmId: input.farmId };

      if (input.animalId) {
        where.animalId = input.animalId;
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

      const weights = await ctx.prisma.weight.findMany({
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
      if (weights.length > input.limit) {
        const nextItem = weights.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: weights,
        nextCursor,
      };
    }),

  /**
   * Create single weight
   */
  create: farmProcedure
    .input(createWeightInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permission
      if (!hasPermission(ctx.role, Permission.WEIGHT_CREATE)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to record weights',
        });
      }

      const weight = await ctx.prisma.weight.create({
        data: {
          farmId: input.farmId,
          animalId: input.animalId,
          date: input.date,
          kg: input.kg,
          method: input.method,
          notes: input.notes,
          recordedBy: ctx.user.userId,
        },
      });

      return weight;
    }),

  /**
   * Batch weight entry
   */
  batchCreate: farmProcedure
    .input(batchWeightInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permission
      if (!hasPermission(ctx.role, Permission.WEIGHT_CREATE)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to record weights',
        });
      }

      const weights = await ctx.prisma.weight.createMany({
        data: input.weights.map((w) => ({
          farmId: input.farmId,
          animalId: w.animalId,
          date: input.date,
          kg: w.kg,
          method: w.method || 'SCALE',
          notes: w.notes,
          recordedBy: ctx.user.userId,
        })),
      });

      return { count: weights.count };
    }),

  feedPlans: router({
    /**
     * Create feed plan
     */
    create: farmProcedure
      .input(createFeedPlanInputSchema)
      .mutation(async ({ ctx, input }) => {
        const plan = await ctx.prisma.feedPlan.create({
          data: {
            farmId: input.farmId,
            name: input.name,
            components: input.components,
            ratios: input.ratios,
            startDate: input.startDate,
            endDate: input.endDate,
            createdBy: ctx.user.userId,
          },
        });

        return plan;
      }),
  }),

  lambFeeding: router({
    /**
     * Create lamb feeding record
     */
    create: farmProcedure
      .input(createLambFeedingInputSchema)
      .mutation(async ({ ctx, input }) => {
        const feeding = await ctx.prisma.lambFeeding.create({
          data: {
            farmId: input.farmId,
            lambId: input.lambId,
            method: input.method,
            startDate: input.startDate,
            endDate: input.endDate,
            volumePerDay: input.volumePerDay,
            notes: input.notes,
          },
        });

        return feeding;
      }),
  }),
});

