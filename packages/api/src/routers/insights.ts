/**
 * Insights router - Action events and insight cards
 */

import { TRPCError } from '@trpc/server';
import { router, farmProcedure } from '../trpc';
import {
  createActionEventInputSchema,
  listActionEventsInputSchema,
  listInsightCardsInputSchema,
  updateInsightCardStatusInputSchema,
  getInsightCardInputSchema,
} from '@farmy/validators';

export const insightsRouter = router({
  actionEvents: router({
    /**
     * List action events
     */
    list: farmProcedure
      .input(listActionEventsInputSchema)
      .query(async ({ ctx, input }) => {
        const where: any = { farmId: input.farmId };

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

        const events = await ctx.prisma.actionEvent.findMany({
          where,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { date: 'desc' },
        });

        let nextCursor: string | undefined = undefined;
        if (events.length > input.limit) {
          const nextItem = events.pop();
          nextCursor = nextItem!.id;
        }

        return {
          items: events,
          nextCursor,
        };
      }),

    /**
     * Create action event
     */
    create: farmProcedure
      .input(createActionEventInputSchema)
      .mutation(async ({ ctx, input }) => {
        const event = await ctx.prisma.actionEvent.create({
          data: {
            farmId: input.farmId,
            type: input.type,
            date: input.date,
            affectedAnimalIds: input.affectedAnimalIds,
            payload: input.payload,
            createdBy: ctx.user.userId,
          },
        });

        return event;
      }),
  }),

  cards: router({
    /**
     * List insight cards
     */
    list: farmProcedure
      .input(listInsightCardsInputSchema)
      .query(async ({ ctx, input }) => {
        const where: any = { farmId: input.farmId };

        if (input.status) {
          where.status = input.status;
        }

        const cards = await ctx.prisma.insightCard.findMany({
          where,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { createdAt: 'desc' },
          include: {
            actionEvent: {
              select: { id: true, type: true, date: true },
            },
          },
        });

        let nextCursor: string | undefined = undefined;
        if (cards.length > input.limit) {
          const nextItem = cards.pop();
          nextCursor = nextItem!.id;
        }

        return {
          items: cards,
          nextCursor,
        };
      }),

    /**
     * Get single insight card
     */
    get: farmProcedure
      .input(getInsightCardInputSchema)
      .query(async ({ ctx, input }) => {
        const card = await ctx.prisma.insightCard.findFirst({
          where: {
            id: input.id,
            farmId: input.farmId,
          },
          include: {
            actionEvent: true,
          },
        });

        if (!card) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Insight card not found',
          });
        }

        return card;
      }),

    /**
     * Update insight card status
     */
    updateStatus: farmProcedure
      .input(updateInsightCardStatusInputSchema)
      .mutation(async ({ ctx, input }) => {
        const card = await ctx.prisma.insightCard.update({
          where: { id: input.id },
          data: { status: input.status },
        });

        return card;
      }),
  }),
});

