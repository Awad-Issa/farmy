/**
 * Animals router - Animal management
 */

import { TRPCError } from '@trpc/server';
import { router, farmProcedure } from '../trpc';
import {
  createAnimalInputSchema,
  updateAnimalInputSchema,
  getAnimalInputSchema,
  listAnimalsInputSchema,
  deleteAnimalInputSchema,
  searchAnimalsInputSchema,
} from '@farmy/validators';
import { hasPermission, Permission } from '@farmy/auth';

export const animalsRouter = router({
  /**
   * List animals
   */
  list: farmProcedure
    .input(listAnimalsInputSchema)
    .query(async ({ ctx, input }) => {
      const where: any = { farmId: input.farmId };

      // Apply filters
      if (input.status) {
        where.status = input.status;
      }
      if (input.type) {
        where.type = input.type;
      }
      if (input.q) {
        where.OR = [
          { tagNumber: { contains: input.q, mode: 'insensitive' } },
          { rfid: { contains: input.q } },
        ];
      }

      const animals = await ctx.prisma.animal.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { tagNumber: 'asc' },
        include: {
          sire: {
            select: { id: true, tagNumber: true },
          },
          dam: {
            select: { id: true, tagNumber: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (animals.length > input.limit) {
        const nextItem = animals.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: animals,
        nextCursor,
      };
    }),

  /**
   * Get single animal
   */
  get: farmProcedure
    .input(getAnimalInputSchema)
    .query(async ({ ctx, input }) => {
      const animal = await ctx.prisma.animal.findFirst({
        where: {
          id: input.id,
          farmId: input.farmId,
        },
        include: {
          sire: {
            select: { id: true, tagNumber: true, type: true },
          },
          dam: {
            select: { id: true, tagNumber: true, type: true },
          },
          offspringAsSire: {
            select: { id: true, tagNumber: true, type: true, dob: true },
          },
          offspringAsDam: {
            select: { id: true, tagNumber: true, type: true, dob: true },
          },
          weights: {
            orderBy: { date: 'desc' },
            take: 10,
          },
          healthEvents: {
            orderBy: { date: 'desc' },
            take: 10,
          },
          breedingCyclesAsEwe: {
            orderBy: { ins1Date: 'desc' },
            take: 5,
          },
        },
      });

      if (!animal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Animal not found',
        });
      }

      return animal;
    }),

  /**
   * Create animal
   */
  create: farmProcedure
    .input(createAnimalInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permission
      if (!hasPermission(ctx.role, Permission.ANIMAL_CREATE)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create animals',
        });
      }

      // Check if tag number already exists
      const existing = await ctx.prisma.animal.findUnique({
        where: {
          farmId_tagNumber: {
            farmId: input.farmId,
            tagNumber: input.tagNumber,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Tag number ${input.tagNumber} already exists`,
        });
      }

      // Check RFID uniqueness if provided
      if (input.rfid) {
        const existingRfid = await ctx.prisma.animal.findFirst({
          where: { rfid: input.rfid },
        });

        if (existingRfid) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `RFID ${input.rfid} is already in use`,
          });
        }
      }

      // Create animal
      const animal = await ctx.prisma.animal.create({
        data: {
          farmId: input.farmId,
          tagNumber: input.tagNumber,
          rfid: input.rfid,
          type: input.type,
          sex: input.sex,
          dob: input.dob,
          sireId: input.sireId,
          damId: input.damId,
        },
      });

      // Log audit
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.user.userId,
          farmId: input.farmId,
          action: 'CREATE_ANIMAL',
          entityType: 'Animal',
          entityId: animal.id,
        },
      });

      return animal;
    }),

  /**
   * Update animal
   */
  update: farmProcedure
    .input(updateAnimalInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permission
      if (!hasPermission(ctx.role, Permission.ANIMAL_UPDATE)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update animals',
        });
      }

      // Check if animal exists
      const existing = await ctx.prisma.animal.findFirst({
        where: {
          id: input.id,
          farmId: input.farmId,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Animal not found',
        });
      }

      // Check tag number uniqueness if changing
      if (input.tagNumber && input.tagNumber !== existing.tagNumber) {
        const tagExists = await ctx.prisma.animal.findFirst({
          where: {
            farmId: input.farmId,
            tagNumber: input.tagNumber,
            id: { not: input.id },
          },
        });

        if (tagExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Tag number ${input.tagNumber} already exists`,
          });
        }
      }

      // Check RFID uniqueness if changing
      if (input.rfid !== undefined && input.rfid !== existing.rfid) {
        const rfidExists = await ctx.prisma.animal.findFirst({
          where: {
            rfid: input.rfid,
            id: { not: input.id },
          },
        });

        if (rfidExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `RFID ${input.rfid} is already in use`,
          });
        }
      }

      // Update animal
      const animal = await ctx.prisma.animal.update({
        where: { id: input.id },
        data: {
          tagNumber: input.tagNumber,
          rfid: input.rfid === null ? null : input.rfid,
          type: input.type,
          sex: input.sex,
          status: input.status,
          dob: input.dob,
          sireId: input.sireId === null ? null : input.sireId,
          damId: input.damId === null ? null : input.damId,
        },
      });

      // Log audit
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.user.userId,
          farmId: input.farmId,
          action: 'UPDATE_ANIMAL',
          entityType: 'Animal',
          entityId: animal.id,
        },
      });

      return animal;
    }),

  /**
   * Delete animal (soft delete via status)
   */
  delete: farmProcedure
    .input(deleteAnimalInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permission
      if (!hasPermission(ctx.role, Permission.ANIMAL_DELETE)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete animals',
        });
      }

      // Update status to DEAD (soft delete)
      await ctx.prisma.animal.update({
        where: { id: input.id },
        data: { status: 'DEAD' },
      });

      // Create tombstone for sync
      await ctx.prisma.tombstone.create({
        data: {
          farmId: input.farmId,
          entity: 'Animal',
          entityId: input.id,
          deletedBy: ctx.user.userId,
        },
      });

      // Log audit
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.user.userId,
          farmId: input.farmId,
          action: 'DELETE_ANIMAL',
          entityType: 'Animal',
          entityId: input.id,
        },
      });

      return { success: true };
    }),

  /**
   * Search animals
   */
  search: farmProcedure
    .input(searchAnimalsInputSchema)
    .query(async ({ ctx, input }) => {
      const animals = await ctx.prisma.animal.findMany({
        where: {
          farmId: input.farmId,
          OR: [
            { tagNumber: { contains: input.q, mode: 'insensitive' } },
            { rfid: { contains: input.q } },
          ],
        },
        take: input.limit,
        orderBy: { tagNumber: 'asc' },
        select: {
          id: true,
          tagNumber: true,
          rfid: true,
          type: true,
          sex: true,
          status: true,
          dob: true,
        },
      });

      return animals;
    }),
});

