/**
 * Auth router - Authentication endpoints
 * 
 * Endpoints:
 * - register: Create new user account
 * - login: Authenticate user and issue tokens
 * - refresh: Get new access token using refresh token
 * - logout: Revoke refresh token
 */

import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
  registerInputSchema,
  loginInputSchema,
  refreshTokenInputSchema,
  logoutInputSchema,
} from '@farmy/validators';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateTokenId,
  hashRefreshToken,
  getRefreshTokenExpiration,
} from '@farmy/auth';

export const authRouter = router({
  /**
   * Register a new user
   */
  register: publicProcedure
    .input(registerInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if phone already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { phone: input.phone },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Phone number already registered',
        });
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);

      // Create user
      const user = await ctx.prisma.user.create({
        data: {
          phone: input.phone,
          passwordHash,
          name: input.name,
        },
      });

      // Generate tokens
      const tokenId = generateTokenId();
      const accessToken = signAccessToken({
        userId: user.id,
        phone: user.phone,
      });
      const refreshToken = signRefreshToken({
        userId: user.id,
        phone: user.phone,
        tokenId,
      });

      // Store refresh token
      await ctx.prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: hashRefreshToken(refreshToken),
          expiresAt: getRefreshTokenExpiration(),
          ip: ctx.req.headers['x-forwarded-for'] as string | undefined,
          userAgent: ctx.req.headers['user-agent'],
        },
      });

      return {
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
        },
        accessToken,
        refreshToken,
      };
    }),

  /**
   * Login user
   */
  login: publicProcedure
    .input(loginInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Find user by phone
      const user = await ctx.prisma.user.findUnique({
        where: { phone: input.phone },
      });

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid phone or password',
        });
      }

      // Verify password
      const isValid = await verifyPassword(user.passwordHash, input.password);

      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid phone or password',
        });
      }

      // Generate tokens
      const tokenId = generateTokenId();
      const accessToken = signAccessToken({
        userId: user.id,
        phone: user.phone,
      });
      const refreshToken = signRefreshToken({
        userId: user.id,
        phone: user.phone,
        tokenId,
      });

      // Store refresh token
      await ctx.prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: hashRefreshToken(refreshToken),
          expiresAt: getRefreshTokenExpiration(),
          ip: ctx.req.headers['x-forwarded-for'] as string | undefined,
          userAgent: ctx.req.headers['user-agent'],
        },
      });

      return {
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
        },
        accessToken,
        refreshToken,
      };
    }),

  /**
   * Refresh access token
   */
  refresh: publicProcedure
    .input(refreshTokenInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify refresh token
      const payload = verifyRefreshToken(input.refreshToken);

      if (!payload) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid refresh token',
        });
      }

      // Check if refresh token exists and is not revoked
      const tokenHash = hashRefreshToken(input.refreshToken);
      const storedToken = await ctx.prisma.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (!storedToken || storedToken.revokedAt) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Refresh token has been revoked',
        });
      }

      // Check if token is expired
      if (storedToken.expiresAt < new Date()) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Refresh token has expired',
        });
      }

      // Get user
      const user = await ctx.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not found',
        });
      }

      // Revoke old refresh token
      await ctx.prisma.refreshToken.update({
        where: { tokenHash },
        data: { revokedAt: new Date() },
      });

      // Generate new tokens (refresh token rotation)
      const newTokenId = generateTokenId();
      const accessToken = signAccessToken({
        userId: user.id,
        phone: user.phone,
      });
      const refreshToken = signRefreshToken({
        userId: user.id,
        phone: user.phone,
        tokenId: newTokenId,
      });

      // Store new refresh token
      await ctx.prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: hashRefreshToken(refreshToken),
          expiresAt: getRefreshTokenExpiration(),
          ip: ctx.req.headers['x-forwarded-for'] as string | undefined,
          userAgent: ctx.req.headers['user-agent'],
        },
      });

      return {
        accessToken,
        refreshToken,
      };
    }),

  /**
   * Logout user (revoke refresh token)
   */
  logout: protectedProcedure
    .input(logoutInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.refreshToken) {
        // Revoke specific refresh token
        const tokenHash = hashRefreshToken(input.refreshToken);
        await ctx.prisma.refreshToken.updateMany({
          where: {
            tokenHash,
            userId: ctx.user.userId,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });
      } else {
        // Revoke all refresh tokens for user
        await ctx.prisma.refreshToken.updateMany({
          where: {
            userId: ctx.user.userId,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });
      }

      return { success: true };
    }),

  /**
   * Get current user info
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.userId },
      include: {
        farmMemberships: {
          include: {
            farm: true,
          },
        },
        superAdmin: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      isSuperAdmin: !!user.superAdmin,
      farms: user.farmMemberships.map((membership) => ({
        id: membership.farm.id,
        name: membership.farm.name,
        role: membership.role,
        joinedAt: membership.joinedAt,
      })),
    };
  }),
});

