/**
 * Farms router - Farm and member management
 */

import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, farmProcedure } from '../trpc';
import {
  createFarmInputSchema,
  updateFarmInputSchema,
  getFarmInputSchema,
  listFarmsInputSchema,
  inviteFarmMemberInputSchema,
  updateFarmMemberRoleInputSchema,
  removeFarmMemberInputSchema,
  listFarmMembersInputSchema,
} from '@farmy/validators';
import { hasPermission, Permission } from '@farmy/auth';

export const farmsRouter = router({
  /**
   * List all farms user is a member of
   */
  list: protectedProcedure
    .input(listFarmsInputSchema)
    .query(async ({ ctx, input }) => {
      const memberships = await ctx.prisma.farmMember.findMany({
        where: { userId: ctx.user.userId },
        include: { farm: true },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { joinedAt: 'desc' },
      });

      let nextCursor: string | undefined = undefined;
      if (memberships.length > input.limit) {
        const nextItem = memberships.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: memberships.map((m) => ({
          id: m.farm.id,
          name: m.farm.name,
          role: m.role,
          joinedAt: m.joinedAt,
          settings: m.farm.settings,
        })),
        nextCursor,
      };
    }),

  /**
   * Get farm by ID
   */
  get: farmProcedure.input(getFarmInputSchema).query(async ({ ctx }) => {
    return ctx.farm;
  }),

  /**
   * Create a new farm
   */
  create: protectedProcedure
    .input(createFarmInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Create farm
      const farm = await ctx.prisma.farm.create({
        data: {
          name: input.name,
          ownerId: ctx.user.userId,
          settings: input.settings || {},
        },
      });

      // Add user as owner
      await ctx.prisma.farmMember.create({
        data: {
          farmId: farm.id,
          userId: ctx.user.userId,
          role: 'OWNER',
        },
      });

      return farm;
    }),

  /**
   * Update farm
   */
  update: farmProcedure
    .input(updateFarmInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permission
      if (!hasPermission(ctx.role, Permission.FARM_UPDATE)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this farm',
        });
      }

      const farm = await ctx.prisma.farm.update({
        where: { id: input.id },
        data: {
          name: input.name,
          settings: input.settings,
        },
      });

      return farm;
    }),

  /**
   * Delete farm (owner only)
   */
  delete: farmProcedure
    .input(getFarmInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permission
      if (!hasPermission(ctx.role, Permission.FARM_DELETE)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only farm owners can delete farms',
        });
      }

      await ctx.prisma.farm.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Farm members sub-router
   */
  members: router({
    /**
     * List farm members
     */
    list: farmProcedure
      .input(listFarmMembersInputSchema)
      .query(async ({ ctx }) => {
        const members = await ctx.prisma.farmMember.findMany({
          where: { farmId: ctx.farmId },
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                name: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        });

        return members.map((m) => ({
          id: m.id,
          userId: m.user.id,
          phone: m.user.phone,
          name: m.user.name,
          role: m.role,
          joinedAt: m.joinedAt,
        }));
      }),

    /**
     * Invite a new member
     */
    invite: farmProcedure
      .input(inviteFarmMemberInputSchema)
      .mutation(async ({ ctx, input }) => {
        // Check permission
        if (!hasPermission(ctx.role, Permission.FARM_MANAGE_MEMBERS)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to invite members',
          });
        }

        // Find user by phone
        const user = await ctx.prisma.user.findUnique({
          where: { phone: input.phone },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User with this phone number not found',
          });
        }

        // Check if already a member
        const existing = await ctx.prisma.farmMember.findUnique({
          where: {
            farmId_userId: {
              farmId: input.farmId,
              userId: user.id,
            },
          },
        });

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User is already a member of this farm',
          });
        }

        // Create membership
        const member = await ctx.prisma.farmMember.create({
          data: {
            farmId: input.farmId,
            userId: user.id,
            role: input.role,
          },
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                name: true,
              },
            },
          },
        });

        return {
          id: member.id,
          userId: member.user.id,
          phone: member.user.phone,
          name: member.user.name,
          role: member.role,
          joinedAt: member.joinedAt,
        };
      }),

    /**
     * Update member role
     */
    updateRole: farmProcedure
      .input(updateFarmMemberRoleInputSchema)
      .mutation(async ({ ctx, input }) => {
        // Check permission
        if (!hasPermission(ctx.role, Permission.FARM_MANAGE_MEMBERS)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update member roles',
          });
        }

        // Cannot change owner role
        const member = await ctx.prisma.farmMember.findUnique({
          where: {
            farmId_userId: {
              farmId: input.farmId,
              userId: input.userId,
            },
          },
        });

        if (member?.role === 'OWNER' && input.role !== 'OWNER') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot change owner role',
          });
        }

        const updated = await ctx.prisma.farmMember.update({
          where: {
            farmId_userId: {
              farmId: input.farmId,
              userId: input.userId,
            },
          },
          data: { role: input.role },
        });

        return updated;
      }),

    /**
     * Remove member
     */
    remove: farmProcedure
      .input(removeFarmMemberInputSchema)
      .mutation(async ({ ctx, input }) => {
        // Check permission
        if (!hasPermission(ctx.role, Permission.FARM_MANAGE_MEMBERS)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to remove members',
          });
        }

        // Cannot remove owner
        const member = await ctx.prisma.farmMember.findUnique({
          where: {
            farmId_userId: {
              farmId: input.farmId,
              userId: input.userId,
            },
          },
        });

        if (member?.role === 'OWNER') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot remove farm owner',
          });
        }

        await ctx.prisma.farmMember.delete({
          where: {
            farmId_userId: {
              farmId: input.farmId,
              userId: input.userId,
            },
          },
        });

        return { success: true };
      }),
  }),
});

