/**
 * Ops router - Super admin operations
 */

import { TRPCError } from '@trpc/server';
import { router, superAdminProcedure } from '../trpc';
import {
  createFarmForUserInputSchema,
  createUserInputSchema,
  assignRoleInputSchema,
  grantSuperAdminInputSchema,
  revokeSuperAdminInputSchema,
  listAllFarmsInputSchema,
  listAllUsersInputSchema,
  getAuditLogsInputSchema,
  impersonateUserInputSchema,
} from '@farmy/validators';
import { hashPassword } from '@farmy/auth';

export const opsRouter = router({
  /**
   * Create a farm for a user
   */
  createFarm: superAdminProcedure
    .input(createFarmForUserInputSchema)
    .mutation(async ({ ctx, input }) => {
      const farm = await ctx.prisma.farm.create({
        data: {
          name: input.farmName,
          ownerId: input.userId,
          settings: {},
        },
      });

      // Add user as owner
      await ctx.prisma.farmMember.create({
        data: {
          farmId: farm.id,
          userId: input.userId,
          role: 'OWNER',
        },
      });

      return farm;
    }),

  /**
   * Create a user
   */
  createUser: superAdminProcedure
    .input(createUserInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if phone exists
      const existing = await ctx.prisma.user.findUnique({
        where: { phone: input.phone },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Phone number already exists',
        });
      }

      const passwordHash = await hashPassword(input.password);

      const user = await ctx.prisma.user.create({
        data: {
          phone: input.phone,
          passwordHash,
          name: input.name,
        },
      });

      return user;
    }),

  /**
   * Assign role to user
   */
  assignRole: superAdminProcedure
    .input(assignRoleInputSchema)
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.prisma.farmMember.upsert({
        where: {
          farmId_userId: {
            farmId: input.farmId,
            userId: input.userId,
          },
        },
        update: {
          role: input.role,
        },
        create: {
          farmId: input.farmId,
          userId: input.userId,
          role: input.role,
        },
      });

      return membership;
    }),

  /**
   * Grant super admin privileges
   */
  grantSuperAdmin: superAdminProcedure
    .input(grantSuperAdminInputSchema)
    .mutation(async ({ ctx, input }) => {
      const superAdmin = await ctx.prisma.superAdmin.create({
        data: {
          userId: input.userId,
        },
      });

      return superAdmin;
    }),

  /**
   * Revoke super admin privileges
   */
  revokeSuperAdmin: superAdminProcedure
    .input(revokeSuperAdminInputSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.superAdmin.delete({
        where: { userId: input.userId },
      });

      return { success: true };
    }),

  /**
   * List all farms
   */
  listFarms: superAdminProcedure
    .input(listAllFarmsInputSchema)
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.search) {
        where.name = { contains: input.search, mode: 'insensitive' };
      }

      const farms = await ctx.prisma.farm.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, phone: true, name: true },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (farms.length > input.limit) {
        const nextItem = farms.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: farms,
        nextCursor,
      };
    }),

  /**
   * List all users
   */
  listUsers: superAdminProcedure
    .input(listAllUsersInputSchema)
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.search) {
        where.OR = [
          { phone: { contains: input.search } },
          { name: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      const users = await ctx.prisma.user.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          farmMemberships: {
            include: {
              farm: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (users.length > input.limit) {
        const nextItem = users.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: users,
        nextCursor,
      };
    }),

  /**
   * Get audit logs
   */
  auditLogs: superAdminProcedure
    .input(getAuditLogsInputSchema)
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.farmId) {
        where.farmId = input.farmId;
      }
      if (input.userId) {
        where.userId = input.userId;
      }
      if (input.startDate || input.endDate) {
        where.createdAt = {};
        if (input.startDate) {
          where.createdAt.gte = input.startDate;
        }
        if (input.endDate) {
          where.createdAt.lte = input.endDate;
        }
      }

      const logs = await ctx.prisma.auditLog.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, phone: true, name: true },
          },
          farm: {
            select: { id: true, name: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (logs.length > input.limit) {
        const nextItem = logs.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: logs,
        nextCursor,
      };
    }),

  /**
   * Impersonate user (view-only)
   */
  impersonate: superAdminProcedure
    .input(impersonateUserInputSchema)
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          farmMemberships: {
            include: {
              farm: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return {
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
        },
        farms: user.farmMemberships.map((m) => ({
          id: m.farm.id,
          name: m.farm.name,
          role: m.role,
        })),
      };
    }),
});

