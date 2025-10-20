/**
 * @farmy/api - tRPC API routers
 * 
 * This package contains all tRPC routers for the Farmy platform:
 * - auth: Authentication (register, login, refresh, logout)
 * - farms: Farm management and members
 * - animals: Animal CRUD, search, and pedigree
 * - breeding: Breeding cycles, events, and reminders
 * - health: Health events, treatments, doses, withdrawal
 * - weights: Weight tracking, ADG, feed plans
 * - milk: Milk yields and sales
 * - sales: Animal sales
 * - inventory: Items, batches, transactions, cost tracking
 * - insights: Action events and insight cards
 * - notifications: Reminders, notifications, device tokens
 * - reports: Dashboards, KPIs, and exports
 * - sync: Offline sync (pull/push)
 * - ops: Super admin operations
 */

// Export main app router and type
export { appRouter, type AppRouter } from './root';

// Export context and middleware
export { createTRPCContext, type Context } from './context';

// Export procedures for extending
export { router, publicProcedure, protectedProcedure, farmProcedure, superAdminProcedure } from './trpc';

