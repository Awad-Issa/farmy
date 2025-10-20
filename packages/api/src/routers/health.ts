/**
 * Health router - Health events, treatments, and doses
 */

import { TRPCError } from '@trpc/server';
import { router, farmProcedure } from '../trpc';
import {
  createHealthEventInputSchema,
  createTreatmentInputSchema,
  updateTreatmentInputSchema,
  recordDoseInputSchema,
  checkWithdrawalInputSchema,
  listHealthEventsInputSchema,
} from '@farmy/validators';
import { hasPermission, Permission } from '@farmy/auth';

export const healthRouter = router({
  events: router({
    /**
     * List health events
     */
    list: farmProcedure
      .input(listHealthEventsInputSchema)
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

        const events = await ctx.prisma.healthEvent.findMany({
          where,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { date: 'desc' },
          include: {
            animal: {
              select: { id: true, tagNumber: true, type: true },
            },
            treatments: {
              include: {
                doses: {
                  where: { status: { in: ['SCHEDULED', 'OVERDUE'] } },
                },
              },
            },
          },
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
     * Create health event
     */
    create: farmProcedure
      .input(createHealthEventInputSchema)
      .mutation(async ({ ctx, input }) => {
        // Check permission
        if (!hasPermission(ctx.role, Permission.HEALTH_CREATE)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to create health events',
          });
        }

        const event = await ctx.prisma.healthEvent.create({
          data: {
            farmId: input.farmId,
            animalId: input.animalId,
            type: input.type,
            date: input.date,
            diagnosisCode: input.diagnosisCode,
            payload: input.payload,
            createdBy: ctx.user.userId,
          },
        });

        return event;
      }),
  }),

  treatments: router({
    /**
     * Create treatment
     */
    create: farmProcedure
      .input(createTreatmentInputSchema)
      .mutation(async ({ ctx, input }) => {
        // Check permission
        if (!hasPermission(ctx.role, Permission.HEALTH_CREATE)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to create treatments',
          });
        }

        // Create treatment
        const treatment = await ctx.prisma.treatment.create({
          data: {
            farmId: input.farmId,
            animalId: input.animalId,
            healthEventId: input.healthEventId,
            drug: input.drug,
            dose: input.dose,
            route: input.route,
            frequency: input.frequency,
            duration: input.duration,
            startDate: input.startDate,
            withdrawalMilkEnd: input.withdrawalMilkEnd,
            withdrawalMeatEnd: input.withdrawalMeatEnd,
            lot: input.lot,
            expiry: input.expiry,
            createdBy: ctx.user.userId,
          },
        });

        // Create doses based on duration
        if (input.duration) {
          const doses = [];
          for (let i = 0; i < input.duration; i++) {
            const doseDate = new Date(input.startDate);
            doseDate.setDate(doseDate.getDate() + i);
            doses.push({
              treatmentId: treatment.id,
              animalId: input.animalId,
              scheduledAt: doseDate,
              status: 'SCHEDULED' as const,
            });
          }

          await ctx.prisma.dose.createMany({
            data: doses,
          });
        }

        return treatment;
      }),

    /**
     * Update treatment
     */
    update: farmProcedure
      .input(updateTreatmentInputSchema)
      .mutation(async ({ ctx, input }) => {
        // Check permission
        if (!hasPermission(ctx.role, Permission.HEALTH_UPDATE)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update treatments',
          });
        }

        const treatment = await ctx.prisma.treatment.update({
          where: { id: input.id },
          data: {
            drug: input.drug,
            dose: input.dose,
            route: input.route,
            frequency: input.frequency,
            duration: input.duration,
            withdrawalMilkEnd: input.withdrawalMilkEnd,
            withdrawalMeatEnd: input.withdrawalMeatEnd,
          },
        });

        return treatment;
      }),
  }),

  doses: router({
    /**
     * Record dose as given
     */
    record: farmProcedure
      .input(recordDoseInputSchema)
      .mutation(async ({ ctx, input }) => {
        const dose = await ctx.prisma.dose.update({
          where: { id: input.doseId },
          data: {
            givenAt: input.givenAt,
            givenBy: ctx.user.userId,
            notes: input.notes,
            status: 'GIVEN',
          },
        });

        return dose;
      }),
  }),

  withdrawal: router({
    /**
     * Check withdrawal status for animals
     */
    check: farmProcedure
      .input(checkWithdrawalInputSchema)
      .query(async ({ ctx, input }) => {
        const now = new Date();

        const treatments = await ctx.prisma.treatment.findMany({
          where: {
            farmId: input.farmId,
            animalId: { in: input.animalIds },
            OR: [
              { withdrawalMilkEnd: { gte: now } },
              { withdrawalMeatEnd: { gte: now } },
            ],
          },
          include: {
            animal: {
              select: { id: true, tagNumber: true },
            },
          },
        });

        return input.animalIds.map((animalId) => {
          const animalTreatments = treatments.filter(
            (t) => t.animalId === animalId
          );
          
          const milkWithdrawal = animalTreatments.find(
            (t) => t.withdrawalMilkEnd && t.withdrawalMilkEnd >= now
          );
          const meatWithdrawal = animalTreatments.find(
            (t) => t.withdrawalMeatEnd && t.withdrawalMeatEnd >= now
          );

          return {
            animalId,
            inMilkWithdrawal: !!milkWithdrawal,
            milkWithdrawalEnd: milkWithdrawal?.withdrawalMilkEnd,
            inMeatWithdrawal: !!meatWithdrawal,
            meatWithdrawalEnd: meatWithdrawal?.withdrawalMeatEnd,
          };
        });
      }),
  }),
});

