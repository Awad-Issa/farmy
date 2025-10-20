/**
 * Reports router - Dashboard and exports
 */

import { router, farmProcedure, protectedProcedure } from '../trpc';
import {
  getDashboardStatsInputSchema,
  getCrossFarmDashboardInputSchema,
  exportDataInputSchema,
  getKPIMetricsInputSchema,
} from '@farmy/validators';

export const reportsRouter = router({
  /**
   * Get dashboard stats for a farm
   */
  dashboard: farmProcedure
    .input(getDashboardStatsInputSchema)
    .query(async ({ ctx, input }) => {
      const { farmId } = input;
      const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate || new Date();

      // Get herd stats
      const totalAnimals = await ctx.prisma.animal.count({
        where: { farmId, status: 'ACTIVE' },
      });

      const animalsByType = await ctx.prisma.animal.groupBy({
        by: ['type'],
        where: { farmId, status: 'ACTIVE' },
        _count: true,
      });

      // Get pregnant ewes
      const pregnantEwes = await ctx.prisma.breedingCycle.count({
        where: {
          farmId,
          status: 'PREGNANT',
        },
      });

      // Get upcoming due dates (next 14 days)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const upcomingLambing = await ctx.prisma.breedingCycle.count({
        where: {
          farmId,
          status: 'PREGNANT',
          estDue: {
            lte: dueDate,
          },
        },
      });

      // Get sick animals (recent health events)
      const recentHealthEvents = await ctx.prisma.healthEvent.count({
        where: {
          farmId,
          type: { in: ['DIAGNOSIS', 'INJURY'] },
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      });

      // Get milk sales
      const milkSales = await ctx.prisma.milkSale.aggregate({
        where: {
          farmId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          volumeLiters: true,
          totalRevenue: true,
        },
      });

      // Get animal sales
      const animalSales = await ctx.prisma.animalSale.aggregate({
        where: {
          farmId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          price: true,
        },
        _count: true,
      });

      return {
        herd: {
          total: totalAnimals,
          byType: animalsByType,
          pregnantEwes,
          upcomingLambing,
          recentlySick: recentHealthEvents,
        },
        sales: {
          milk: {
            volume: milkSales._sum.volumeLiters || 0,
            revenue: milkSales._sum.totalRevenue || 0,
          },
          animals: {
            count: animalSales._count,
            revenue: animalSales._sum.price || 0,
          },
          totalRevenue:
            (milkSales._sum.totalRevenue || 0) + (animalSales._sum.price || 0),
        },
        period: {
          startDate,
          endDate,
        },
      };
    }),

  /**
   * Get cross-farm dashboard (owner view)
   */
  crossFarm: protectedProcedure
    .input(getCrossFarmDashboardInputSchema)
    .query(async ({ ctx, input: _input }) => {
      // Get all farms user is a member of
      const memberships = await ctx.prisma.farmMember.findMany({
        where: { userId: ctx.user.userId },
        include: { farm: true },
      });

      const farmStats = await Promise.all(
        memberships.map(async (m) => {
          const totalAnimals = await ctx.prisma.animal.count({
            where: { farmId: m.farmId, status: 'ACTIVE' },
          });

          const pregnantEwes = await ctx.prisma.breedingCycle.count({
            where: { farmId: m.farmId, status: 'PREGNANT' },
          });

          return {
            farmId: m.farmId,
            farmName: m.farm.name,
            role: m.role,
            totalAnimals,
            pregnantEwes,
          };
        })
      );

      return {
        farms: farmStats,
        totals: {
          farms: farmStats.length,
          animals: farmStats.reduce((sum, f) => sum + f.totalAnimals, 0),
          pregnantEwes: farmStats.reduce((sum, f) => sum + f.pregnantEwes, 0),
        },
      };
    }),

  /**
   * Export data (stub - would generate CSV/XLSX)
   */
  export: farmProcedure
    .input(exportDataInputSchema)
    .mutation(async ({ ctx: _ctx, input }) => {
      // This would generate actual export files
      // For now, return a stub
      return {
        type: input.type,
        format: input.format,
        recordCount: 0,
        downloadUrl: null,
      };
    }),

  /**
   * Get KPI metrics
   */
  kpis: farmProcedure
    .input(getKPIMetricsInputSchema)
    .query(async ({ ctx, input }) => {
      const metrics: Record<string, any> = {};

      // Calculate requested metrics
      if (!input.metrics || input.metrics.includes('herd_size')) {
        metrics.herd_size = await ctx.prisma.animal.count({
          where: { farmId: input.farmId, status: 'ACTIVE' },
        });
      }

      if (!input.metrics || input.metrics.includes('pregnant_ewes')) {
        metrics.pregnant_ewes = await ctx.prisma.breedingCycle.count({
          where: { farmId: input.farmId, status: 'PREGNANT' },
        });
      }

      if (!input.metrics || input.metrics.includes('milk_production')) {
        const milkTotal = await ctx.prisma.milkYield.aggregate({
          where: {
            farmId: input.farmId,
            at: {
              gte: input.startDate,
              lte: input.endDate,
            },
          },
          _sum: { liters: true },
        });
        metrics.milk_production = milkTotal._sum.liters || 0;
      }

      return metrics;
    }),
});

