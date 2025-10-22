/**
 * Metrics Snapshots ETL Service
 * Captures daily metric values for cohorts and farms
 * 
 * CRON SCHEDULE: Nightly (e.g., 1:00 AM)
 * Job: metrics:snapshot
 * 
 * Per PLAN.md §5.5 and System_Technical_Spec §7.8
 * 
 * Metrics Captured:
 * - ADG (Average Daily Gain)
 * - Milk Yield
 * - Conception Rate
 * - Mortality Rate
 * - Health Score
 * - Feed Cost per Animal
 */

import { prisma } from '@farmy/db';

export type MetricType =
  | 'ADG'
  | 'MILK_YIELD'
  | 'CONCEPTION_RATE'
  | 'MORTALITY_RATE'
  | 'HEALTH_SCORE'
  | 'FEED_COST';

export interface MetricCalculation {
  farmId: string;
  metricType: MetricType;
  value: number;
  date: Date;
  cohort?: string; // Animal ID or group identifier
  metadata?: Record<string, any>;
}

/**
 * Calculate Average Daily Gain (ADG) for animals
 * ADG = (Current Weight - Previous Weight) / Days Between
 */
async function calculateADG(farmId: string, date: Date): Promise<MetricCalculation[]> {
  const metrics: MetricCalculation[] = [];
  const windowDays = 30; // Calculate ADG over 30-day window

  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - windowDays);

  // Get all animals with at least 2 weight records in window
  const animals = await prisma.animal.findMany({
    where: {
      farmId,
      status: 'ACTIVE',
      deletedAt: null,
    },
    include: {
      weights: {
        where: {
          measuredAt: {
            gte: startDate,
            lte: date,
          },
          deletedAt: null,
        },
        orderBy: { measuredAt: 'asc' },
      },
    },
  });

  for (const animal of animals) {
    if (animal.weights.length < 2) continue;

    const firstWeight = animal.weights[0];
    const lastWeight = animal.weights[animal.weights.length - 1];

    const daysBetween =
      (new Date(lastWeight.measuredAt).getTime() -
        new Date(firstWeight.measuredAt).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysBetween === 0) continue;

    const adg = (lastWeight.weightKg - firstWeight.weightKg) / daysBetween;

    metrics.push({
      farmId,
      metricType: 'ADG',
      value: adg,
      date,
      cohort: animal.id,
      metadata: {
        startWeight: firstWeight.weightKg,
        endWeight: lastWeight.weightKg,
        days: daysBetween,
      },
    });
  }

  return metrics;
}

/**
 * Calculate average milk yield per animal
 */
async function calculateMilkYield(
  farmId: string,
  date: Date
): Promise<MetricCalculation[]> {
  const metrics: MetricCalculation[] = [];
  const windowDays = 7; // Weekly average

  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - windowDays);

  // Get milking animals with yields in window
  const animals = await prisma.animal.findMany({
    where: {
      farmId,
      type: 'EWE',
      status: 'ACTIVE',
      deletedAt: null,
    },
    include: {
      milkYields: {
        where: {
          milkedAt: {
            gte: startDate,
            lte: date,
          },
          deletedAt: null,
        },
      },
    },
  });

  for (const animal of animals) {
    if (animal.milkYields.length === 0) continue;

    const totalYield = animal.milkYields.reduce(
      (sum, yield) => sum + yield.yieldLiters,
      0
    );
    const avgYield = totalYield / animal.milkYields.length;

    metrics.push({
      farmId,
      metricType: 'MILK_YIELD',
      value: avgYield,
      date,
      cohort: animal.id,
      metadata: {
        totalYield,
        recordCount: animal.milkYields.length,
        days: windowDays,
      },
    });
  }

  return metrics;
}

/**
 * Calculate conception rate for breeding cycles
 */
async function calculateConceptionRate(
  farmId: string,
  date: Date
): Promise<MetricCalculation[]> {
  const windowDays = 90; // 3-month window

  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - windowDays);

  // Get breeding cycles started in window
  const cycles = await prisma.breedingCycle.findMany({
    where: {
      farmId,
      ins1Date: {
        gte: startDate,
        lte: date,
      },
      deletedAt: null,
    },
  });

  if (cycles.length === 0) return [];

  // Count successful conceptions
  const successful = cycles.filter(
    (c) => c.check1Result === 'POSITIVE' || c.status === 'PREGNANT'
  ).length;

  const rate = (successful / cycles.length) * 100;

  return [
    {
      farmId,
      metricType: 'CONCEPTION_RATE',
      value: rate,
      date,
      metadata: {
        totalCycles: cycles.length,
        successful,
        windowDays,
      },
    },
  ];
}

/**
 * Calculate mortality rate
 */
async function calculateMortalityRate(
  farmId: string,
  date: Date
): Promise<MetricCalculation[]> {
  const windowDays = 90; // 3-month window

  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - windowDays);

  // Get total animals at start of window
  const totalAnimals = await prisma.animal.count({
    where: {
      farmId,
      createdAt: { lte: startDate },
      deletedAt: null,
    },
  });

  if (totalAnimals === 0) return [];

  // Count deaths in window
  const deaths = await prisma.animal.count({
    where: {
      farmId,
      status: 'DIED',
      updatedAt: {
        gte: startDate,
        lte: date,
      },
    },
  });

  const rate = (deaths / totalAnimals) * 100;

  return [
    {
      farmId,
      metricType: 'MORTALITY_RATE',
      value: rate,
      date,
      metadata: {
        totalAnimals,
        deaths,
        windowDays,
      },
    },
  ];
}

/**
 * Calculate health score based on health events
 * Lower score = more health issues
 */
async function calculateHealthScore(
  farmId: string,
  date: Date
): Promise<MetricCalculation[]> {
  const metrics: MetricCalculation[] = [];
  const windowDays = 30;

  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - windowDays);

  // Get animals with health events in window
  const animals = await prisma.animal.findMany({
    where: {
      farmId,
      status: 'ACTIVE',
      deletedAt: null,
    },
    include: {
      healthEvents: {
        where: {
          eventDate: {
            gte: startDate,
            lte: date,
          },
          deletedAt: null,
        },
      },
    },
  });

  for (const animal of animals) {
    // Score: 100 - (number of health events * 10)
    // Capped at 0
    const score = Math.max(0, 100 - animal.healthEvents.length * 10);

    metrics.push({
      farmId,
      metricType: 'HEALTH_SCORE',
      value: score,
      date,
      cohort: animal.id,
      metadata: {
        eventCount: animal.healthEvents.length,
        windowDays,
      },
    });
  }

  return metrics;
}

/**
 * Calculate feed cost per animal
 */
async function calculateFeedCost(
  farmId: string,
  date: Date
): Promise<MetricCalculation[]> {
  const metrics: MetricCalculation[] = [];
  const windowDays = 30;

  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - windowDays);

  // Get feed transactions in window
  const feedTransactions = await prisma.inventoryTransaction.findMany({
    where: {
      farmId,
      type: 'USAGE',
      date: {
        gte: startDate,
        lte: date,
      },
      item: {
        category: 'FEED',
      },
      deletedAt: null,
    },
    include: {
      item: true,
    },
  });

  if (feedTransactions.length === 0) return [];

  // Get active animal count
  const animalCount = await prisma.animal.count({
    where: {
      farmId,
      status: 'ACTIVE',
      deletedAt: null,
    },
  });

  if (animalCount === 0) return [];

  // Sum feed costs
  const totalCost = feedTransactions.reduce(
    (sum, tx) => sum + (tx.costValue || 0),
    0
  );

  const costPerAnimal = totalCost / animalCount;

  return [
    {
      farmId,
      metricType: 'FEED_COST',
      value: costPerAnimal,
      date,
      metadata: {
        totalCost,
        animalCount,
        transactionCount: feedTransactions.length,
        windowDays,
      },
    },
  ];
}

/**
 * Persist metric snapshot to database
 */
async function saveMetricSnapshot(metric: MetricCalculation): Promise<void> {
  await prisma.metricSnapshot.create({
    data: {
      farmId: metric.farmId,
      metricType: metric.metricType,
      value: metric.value,
      date: metric.date,
      cohort: metric.cohort,
    },
  });
}

/**
 * Main ETL function - captures all metrics for all farms
 * 
 * CRON: Nightly at 1:00 AM
 */
export async function captureMetricSnapshots(): Promise<{
  farmsProcessed: number;
  snapshotsCaptured: number;
}> {
  console.log('[Metrics] Starting nightly snapshot capture...');

  const farms = await prisma.farm.findMany({
    where: { deletedAt: null },
    select: { id: true },
  });

  const date = new Date();
  date.setHours(0, 0, 0, 0); // Midnight of current day

  let totalSnapshots = 0;

  for (const farm of farms) {
    try {
      const metrics: MetricCalculation[] = [];

      // Calculate all metric types
      metrics.push(...(await calculateADG(farm.id, date)));
      metrics.push(...(await calculateMilkYield(farm.id, date)));
      metrics.push(...(await calculateConceptionRate(farm.id, date)));
      metrics.push(...(await calculateMortalityRate(farm.id, date)));
      metrics.push(...(await calculateHealthScore(farm.id, date)));
      metrics.push(...(await calculateFeedCost(farm.id, date)));

      // Save all metrics
      for (const metric of metrics) {
        await saveMetricSnapshot(metric);
        totalSnapshots++;
      }

      console.log(`[Metrics] Farm ${farm.id}: ${metrics.length} snapshots captured`);
    } catch (error) {
      console.error(`[Metrics] Error processing farm ${farm.id}:`, error);
    }
  }

  console.log(
    `[Metrics] Snapshot capture complete: ${totalSnapshots} snapshots for ${farms.length} farms`
  );

  return {
    farmsProcessed: farms.length,
    snapshotsCaptured: totalSnapshots,
  };
}

/**
 * CRON JOB SETUP NOTES:
 * 
 * Using node-cron:
 * 
 * ```typescript
 * import cron from 'node-cron';
 * import { captureMetricSnapshots } from './services/metrics.service';
 * 
 * // Run nightly at 1:00 AM
 * cron.schedule('0 1 * * *', async () => {
 *   await captureMetricSnapshots();
 * });
 * ```
 */


