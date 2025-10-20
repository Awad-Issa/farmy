/**
 * Main tRPC app router
 * Combines all sub-routers
 */

import { router } from './trpc';
import { authRouter } from './routers/auth';
import { farmsRouter } from './routers/farms';
import { animalsRouter } from './routers/animals';
import { breedingRouter } from './routers/breeding';
import { healthRouter } from './routers/health';
import { weightsRouter } from './routers/weights';
import { milkRouter } from './routers/milk';
import { salesRouter } from './routers/sales';
import { inventoryRouter } from './routers/inventory';
import { insightsRouter } from './routers/insights';
import { notificationsRouter } from './routers/notifications';
import { reportsRouter } from './routers/reports';
import { syncRouter } from './routers/sync';
import { opsRouter } from './routers/ops';

/**
 * Main app router with all sub-routers
 */
export const appRouter = router({
  auth: authRouter,
  farms: farmsRouter,
  animals: animalsRouter,
  breeding: breedingRouter,
  health: healthRouter,
  weights: weightsRouter,
  milk: milkRouter,
  sales: salesRouter,
  inventory: inventoryRouter,
  insights: insightsRouter,
  notifications: notificationsRouter,
  reports: reportsRouter,
  sync: syncRouter,
  ops: opsRouter,
});

/**
 * Export type definition of API
 */
export type AppRouter = typeof appRouter;

