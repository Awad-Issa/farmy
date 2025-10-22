/**
 * Job Scheduler Setup
 * Configures cron jobs for background services
 * 
 * Per PLAN.md §5 (Phase 5: Services & Jobs)
 * 
 * This file provides the setup for all scheduled jobs.
 * In production, this would run as a separate worker process.
 * 
 * DEPLOYMENT OPTIONS:
 * 1. Separate worker dyno/container
 * 2. Same process with node-cron
 * 3. External scheduler (AWS EventBridge, Cloud Scheduler)
 * 4. Queue-based (BullMQ, Celery)
 */

import cron from 'node-cron';
import {
  dispatchReminders,
  backfillCosts,
  scanForInsights,
  captureMetricSnapshots,
} from './services';

/**
 * Initialize all cron jobs
 * Call this once at application startup
 */
export function initializeScheduler(): void {
  console.log('[Scheduler] Initializing cron jobs...');

  // 1. Metrics Snapshot ETL - Nightly at 1:00 AM
  // Captures daily metric values (ADG, milk, conception rate, etc.)
  cron.schedule('0 1 * * *', async () => {
    console.log('[Scheduler] Running metrics snapshot job...');
    try {
      const result = await captureMetricSnapshots();
      console.log(
        `[Scheduler] Metrics snapshot complete: ${result.snapshotsCaptured} snapshots for ${result.farmsProcessed} farms`
      );
    } catch (error) {
      console.error('[Scheduler] Metrics snapshot job failed:', error);
    }
  });

  // 2. Cost Backfill - Nightly at 2:00 AM
  // Upgrades cost confidence levels using newer data
  cron.schedule('0 2 * * *', async () => {
    console.log('[Scheduler] Running cost backfill job...');
    try {
      const result = await backfillCosts();
      console.log(
        `[Scheduler] Cost backfill complete: ${result.transactionsUpgraded}/${result.transactionsProcessed} upgraded`
      );
    } catch (error) {
      console.error('[Scheduler] Cost backfill job failed:', error);
    }
  });

  // 3. Insights Scan - Nightly at 3:00 AM
  // Analyzes action events and generates insight cards
  cron.schedule('0 3 * * *', async () => {
    console.log('[Scheduler] Running insights scan job...');
    try {
      const result = await scanForInsights();
      console.log(
        `[Scheduler] Insights scan complete: ${result.insightsGenerated} insights from ${result.actionsAnalyzed} actions`
      );
    } catch (error) {
      console.error('[Scheduler] Insights scan job failed:', error);
    }
  });

  // 4. Reminders Dispatcher - Every 10 minutes
  // Generates reminders for breeding, health, inventory
  cron.schedule('*/10 * * * *', async () => {
    console.log('[Scheduler] Running reminders dispatcher...');
    try {
      const result = await dispatchReminders();
      console.log(
        `[Scheduler] Reminders dispatch complete: ${result.remindersCreated} reminders for ${result.farmsProcessed} farms`
      );
    } catch (error) {
      console.error('[Scheduler] Reminders dispatcher failed:', error);
    }
  });

  console.log('[Scheduler] All cron jobs initialized successfully');
  console.log('[Scheduler] Schedule:');
  console.log('  - Metrics Snapshot: Daily at 1:00 AM');
  console.log('  - Cost Backfill: Daily at 2:00 AM');
  console.log('  - Insights Scan: Daily at 3:00 AM');
  console.log('  - Reminders Dispatcher: Every 10 minutes');
}

/**
 * Gracefully shutdown scheduler
 */
export function shutdownScheduler(): void {
  console.log('[Scheduler] Shutting down cron jobs...');
  cron.getTasks().forEach((task) => task.stop());
  console.log('[Scheduler] All cron jobs stopped');
}

/**
 * PRODUCTION DEPLOYMENT NOTES:
 * 
 * Option 1: Separate Worker Process
 * --------------------------------
 * Deploy as a separate container/dyno that only runs the scheduler.
 * 
 * ```typescript
 * // worker.ts
 * import { initializeScheduler } from './scheduler';
 * 
 * initializeScheduler();
 * 
 * process.on('SIGTERM', () => {
 *   shutdownScheduler();
 *   process.exit(0);
 * });
 * ```
 * 
 * Then in your deployment:
 * - API process: Handles HTTP requests
 * - Worker process: Runs scheduler (this file)
 * 
 * 
 * Option 2: Queue-Based (Recommended for Scale)
 * --------------------------------------------
 * Use BullMQ or similar for better reliability:
 * 
 * ```typescript
 * import { Queue, Worker } from 'bullmq';
 * 
 * const metricsQueue = new Queue('metrics', { connection: redis });
 * 
 * // Schedule jobs
 * await metricsQueue.add(
 *   'snapshot',
 *   {},
 *   { repeat: { cron: '0 1 * * *' } }
 * );
 * 
 * // Worker process
 * new Worker('metrics', async (job) => {
 *   if (job.name === 'snapshot') {
 *     await captureMetricSnapshots();
 *   }
 * }, { connection: redis });
 * ```
 * 
 * 
 * Option 3: External Scheduler
 * ---------------------------
 * Use cloud provider's scheduler:
 * - AWS EventBridge
 * - Google Cloud Scheduler
 * - Azure Logic Apps
 * 
 * Create HTTP endpoints for each job and have the scheduler call them:
 * 
 * ```typescript
 * // In your API routes
 * app.post('/cron/metrics', async (req, res) => {
 *   // Verify cron secret
 *   if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
 *     return res.status(401).send('Unauthorized');
 *   }
 *   
 *   await captureMetricSnapshots();
 *   res.send('OK');
 * });
 * ```
 * 
 * 
 * MONITORING:
 * ----------
 * - Log all job executions
 * - Track job duration
 * - Alert on failures
 * - Monitor queue depth (if using queues)
 * - Set up dead letter queues for failed jobs
 * 
 * 
 * ENVIRONMENT VARIABLES:
 * --------------------
 * - ENABLE_SCHEDULER=true/false (to disable in certain environments)
 * - SCHEDULER_TIMEZONE=UTC (or your timezone)
 * - CRON_SECRET=<secret> (for HTTP endpoint protection)
 */


