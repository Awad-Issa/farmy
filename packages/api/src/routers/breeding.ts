/**
 * Breeding router - Breeding cycle and event management
 */

import { TRPCError } from '@trpc/server';
import { router, farmProcedure } from '../trpc';
import {
  createBreedingCycleInputSchema,
  updateBreedingCycleInputSchema,
  getBreedingCycleInputSchema,
  listBreedingCyclesInputSchema,
  createBreedingEventInputSchema,
  getDueRemindersInputSchema,
} from '@farmy/validators';
import { hasPermission, Permission } from '@farmy/auth';

export const breedingRouter = router({
  cycles: router({
    /**
     * List breeding cycles
     */
    list: farmProcedure
      .input(listBreedingCyclesInputSchema)
      .query(async ({ ctx, input }) => {
        const where: any = { farmId: input.farmId };

        if (input.status) {
          where.status = input.status;
        }

        const cycles = await ctx.prisma.breedingCycle.findMany({
          where,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { ins1Date: 'desc' },
          include: {
            ewe: {
              select: { id: true, tagNumber: true, type: true },
            },
            events: {
              orderBy: { date: 'asc' },
            },
          },
        });

        let nextCursor: string | undefined = undefined;
        if (cycles.length > input.limit) {
          const nextItem = cycles.pop();
          nextCursor = nextItem!.id;
        }

        return {
          items: cycles,
          nextCursor,
        };
      }),

    /**
     * Get single breeding cycle
     */
    get: farmProcedure
      .input(getBreedingCycleInputSchema)
      .query(async ({ ctx, input }) => {
        const cycle = await ctx.prisma.breedingCycle.findFirst({
          where: {
            id: input.id,
            farmId: input.farmId,
          },
          include: {
            ewe: true,
            events: {
              orderBy: { date: 'asc' },
            },
          },
        });

        if (!cycle) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Breeding cycle not found',
          });
        }

        return cycle;
      }),

    /**
     * Create breeding cycle (INS1)
     */
    create: farmProcedure
      .input(createBreedingCycleInputSchema)
      .mutation(async ({ ctx, input }) => {
        // Check permission
        if (!hasPermission(ctx.role, Permission.BREEDING_CREATE)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to create breeding cycles',
          });
        }

        // Check if ewe exists and is female
        const ewe = await ctx.prisma.animal.findFirst({
          where: {
            id: input.eweId,
            farmId: input.farmId,
            type: 'EWE',
            sex: 'FEMALE',
          },
        });

        if (!ewe) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Ewe not found or invalid type',
          });
        }

        // Create breeding cycle
        const cycle = await ctx.prisma.breedingCycle.create({
          data: {
            farmId: input.farmId,
            eweId: input.eweId,
            ins1Date: input.ins1Date,
            status: 'OPEN',
          },
        });

        // Create INS1 event
        await ctx.prisma.breedingEvent.create({
          data: {
            farmId: input.farmId,
            cycleId: cycle.id,
            eweId: input.eweId,
            type: 'INS1',
            date: input.ins1Date,
            createdBy: ctx.user.userId,
          },
        });

        // Create reminders (INS2 at +17d, CHECK1 at +28d)
        const ins2Date = new Date(input.ins1Date);
        ins2Date.setDate(ins2Date.getDate() + 17);

        const check1Date = new Date(input.ins1Date);
        check1Date.setDate(check1Date.getDate() + 28);

        await ctx.prisma.reminder.createMany({
          data: [
            {
              farmId: input.farmId,
              type: 'BREEDING_INS2',
              dueDate: ins2Date,
              targetEntityId: cycle.id,
              status: 'PENDING',
              createdBy: ctx.user.userId,
            },
            {
              farmId: input.farmId,
              type: 'BREEDING_CHECK1',
              dueDate: check1Date,
              targetEntityId: cycle.id,
              status: 'PENDING',
              createdBy: ctx.user.userId,
            },
          ],
        });

        return cycle;
      }),

    /**
     * Update breeding cycle
     */
    update: farmProcedure
      .input(updateBreedingCycleInputSchema)
      .mutation(async ({ ctx, input }) => {
        // Check permission
        if (!hasPermission(ctx.role, Permission.BREEDING_UPDATE)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update breeding cycles',
          });
        }

        const cycle = await ctx.prisma.breedingCycle.update({
          where: { id: input.id },
          data: {
            ins2Date: input.ins2Date,
            check1Date: input.check1Date,
            check1Result: input.check1Result,
            check2Date: input.check2Date,
            check2Result: input.check2Result,
            status: input.status,
            // Calculate due date if check1 is positive
            ...(input.check1Result === 'POSITIVE' && input.check1Date
              ? {
                  conceptionDate: input.check1Date,
                  estDue: new Date(
                    new Date(input.check1Date).getTime() +
                      150 * 24 * 60 * 60 * 1000
                  ),
                  dueStart: new Date(
                    new Date(input.check1Date).getTime() +
                      143 * 24 * 60 * 60 * 1000
                  ),
                  dueEnd: new Date(
                    new Date(input.check1Date).getTime() +
                      157 * 24 * 60 * 60 * 1000
                  ),
                }
              : {}),
          },
        });

        return cycle;
      }),
  }),

  events: router({
    /**
     * Create breeding event
     */
    create: farmProcedure
      .input(createBreedingEventInputSchema)
      .mutation(async ({ ctx, input }) => {
        // Check permission
        if (!hasPermission(ctx.role, Permission.BREEDING_CREATE)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to create breeding events',
          });
        }

        const event = await ctx.prisma.breedingEvent.create({
          data: {
            farmId: input.farmId,
            cycleId: input.cycleId,
            eweId: input.eweId,
            type: input.type,
            date: input.date,
            payload: input.payload,
            createdBy: ctx.user.userId,
          },
        });

        // Update cycle status based on event type
        if (input.type === 'LAMBING') {
          await ctx.prisma.breedingCycle.update({
            where: { id: input.cycleId },
            data: { status: 'LAMBED' },
          });

          // Create lamb animals automatically with user-provided details
          if (input.payload) {
            const payload = input.payload as any;
            const lambingDate = input.date;
            const lambsData = payload.lambs || [];

            // Get the breeding cycle to find sire information
            const cycle = await ctx.prisma.breedingCycle.findUnique({
              where: { id: input.cycleId },
              include: {
                events: {
                  where: {
                    type: { in: ['INS1', 'INS2'] },
                  },
                  orderBy: { date: 'desc' },
                  take: 1,
                },
              },
            });

            // Get sire ID from the insemination event payload if available
            let sireId: string | undefined = undefined;
            if (cycle?.events[0]?.payload) {
              const insPayload = cycle.events[0].payload as any;
              sireId = insPayload.ramId;
            }

            // Create lamb animals for live lambs (with tag numbers)
            const createdLambs = [];
            for (const lambData of lambsData) {
              // Skip stillborn lambs - they don't get created as animals
              if (lambData.isStillborn) {
                continue;
              }

              // Validate tag number
              if (!lambData.tagNumber || lambData.tagNumber.trim() === '') {
                throw new TRPCError({
                  code: 'BAD_REQUEST',
                  message: 'All live lambs must have a tag number',
                });
              }

              const tagNumber = lambData.tagNumber.trim();

              // Check if tag number already exists
              const existing = await ctx.prisma.animal.findUnique({
                where: {
                  farmId_tagNumber: {
                    farmId: input.farmId,
                    tagNumber: tagNumber,
                  },
                },
              });

              if (existing) {
                throw new TRPCError({
                  code: 'CONFLICT',
                  message: `Tag number ${tagNumber} already exists`,
                });
              }

              // Create the lamb animal
              const lamb = await ctx.prisma.animal.create({
                data: {
                  farmId: input.farmId,
                  tagNumber: tagNumber,
                  type: 'LAMB',
                  sex: lambData.sex,
                  status: 'ACTIVE',
                  dob: lambingDate,
                  damId: input.eweId,
                  sireId: sireId,
                },
              });
              createdLambs.push(lamb);

              // Log audit for each lamb
              await ctx.prisma.auditLog.create({
                data: {
                  userId: ctx.user.userId,
                  farmId: input.farmId,
                  action: 'CREATE_ANIMAL',
                  entityType: 'Animal',
                  entityId: lamb.id,
                },
              });
            }

            // Store created lamb IDs in the event payload
            if (createdLambs.length > 0) {
              await ctx.prisma.breedingEvent.update({
                where: { id: event.id },
                data: {
                  payload: {
                    ...payload,
                    lambIds: createdLambs.map(l => l.id),
                    lambTagNumbers: createdLambs.map(l => l.tagNumber),
                  },
                },
              });
            }
          }
        } else if (input.type === 'ABORTION' || input.type === 'LOSS') {
          await ctx.prisma.breedingCycle.update({
            where: { id: input.cycleId },
            data: { status: 'FAILED' },
          });
        }

        return event;
      }),
  }),

  reminders: router({
    /**
     * Get due reminders
     */
    due: farmProcedure
      .input(getDueRemindersInputSchema)
      .query(async ({ ctx, input }) => {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + input.daysAhead);

        const reminders = await ctx.prisma.reminder.findMany({
          where: {
            farmId: input.farmId,
            status: 'PENDING',
            type: {
              in: [
                'BREEDING_INS2',
                'BREEDING_CHECK1',
                'BREEDING_CHECK2',
                'BREEDING_LAMBING_PREP',
                'BREEDING_OVERDUE',
              ],
            },
            dueDate: {
              lte: endDate,
            },
          },
          orderBy: { dueDate: 'asc' },
        });

        return reminders;
      }),
  }),
});

