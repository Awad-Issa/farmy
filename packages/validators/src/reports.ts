import { z } from 'zod';

// ============================================================================
// REPORTS VALIDATORS
// ============================================================================

/**
 * Export format
 */
export const exportFormatSchema = z.enum(['CSV', 'XLSX', 'JSON']);

export type ExportFormat = z.infer<typeof exportFormatSchema>;

/**
 * Report type
 */
export const reportTypeSchema = z.enum([
  'ANIMALS',
  'BREEDING',
  'HEALTH',
  'WEIGHTS',
  'MILK',
  'SALES',
  'INVENTORY',
  'COSTS',
  'KPIS',
]);

export type ReportType = z.infer<typeof reportTypeSchema>;

/**
 * Dashboard stats input
 */
export const getDashboardStatsInputSchema = z.object({
  farmId: z.string().uuid(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type GetDashboardStatsInput = z.infer<
  typeof getDashboardStatsInputSchema
>;

/**
 * Cross-farm dashboard input
 */
export const getCrossFarmDashboardInputSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type GetCrossFarmDashboardInput = z.infer<
  typeof getCrossFarmDashboardInputSchema
>;

/**
 * Export data input
 */
export const exportDataInputSchema = z.object({
  farmId: z.string().uuid(),
  type: reportTypeSchema,
  format: exportFormatSchema.default('CSV'),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  filters: z.record(z.any()).optional(),
});

export type ExportDataInput = z.infer<typeof exportDataInputSchema>;

/**
 * KPI metrics input
 */
export const getKPIMetricsInputSchema = z.object({
  farmId: z.string().uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  metrics: z
    .array(
      z.enum([
        'herd_size',
        'pregnant_ewes',
        'lambing_rate',
        'avg_daily_gain',
        'milk_production',
        'mortality_rate',
        'conception_rate',
      ])
    )
    .optional(),
});

export type GetKPIMetricsInput = z.infer<typeof getKPIMetricsInputSchema>;

