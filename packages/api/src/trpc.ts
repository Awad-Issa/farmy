/**
 * tRPC setup with context and procedures
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson';
import { prisma } from '@farmy/db';
import { verifyAccessToken, type JWTPayload } from '@farmy/auth';

/**
 * Create context for tRPC procedures
 * Context is created for each request
 */
export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const { req } = opts;

  // Extract token from Authorization header
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  // Verify token if present
  let user: JWTPayload | null = null;
  if (token) {
    user = verifyAccessToken(token);
  }

  // Get farmId from header (for multi-farm support)
  const farmId = req.headers.get('x-farm-id');

  return {
    prisma,
    user,
    farmId,
    req,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC with context
 */
const t = initTRPC.context<Context>().create({
  // transformer: superjson, // Temporarily disabled to debug
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Now guaranteed to be non-null
    },
  });
});

/**
 * Farm procedure - requires authentication and farm membership
 */
export const farmProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.farmId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Farm ID is required (X-Farm-Id header)',
    });
  }

  // Check if user is a member of this farm
  const membership = await ctx.prisma.farmMember.findUnique({
    where: {
      farmId_userId: {
        farmId: ctx.farmId,
        userId: ctx.user.userId,
      },
    },
    include: {
      farm: true,
    },
  });

  if (!membership) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have access to this farm',
    });
  }

  return next({
    ctx: {
      ...ctx,
      farmId: ctx.farmId, // Now guaranteed to be non-null
      farm: membership.farm,
      role: membership.role,
    },
  });
});

/**
 * Super admin procedure - requires super admin role
 */
export const superAdminProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    // Check if user is a super admin
    const superAdmin = await ctx.prisma.superAdmin.findUnique({
      where: { userId: ctx.user.userId },
    });

    if (!superAdmin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You must be a super admin to access this resource',
      });
    }

    return next({
      ctx: {
        ...ctx,
        isSuperAdmin: true,
      },
    });
  }
);

