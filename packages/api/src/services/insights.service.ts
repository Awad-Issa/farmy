/**
 * Insights & Causality Analysis Service
 * Relates actions to outcomes using statistical methods
 * 
 * CRON SCHEDULE: Nightly (e.g., 3:00 AM)
 * Job: insights:scan
 * 
 * Per PLAN.md §5.3, §5.6 and System_Technical_Spec §7.8
 * 
 * Methods:
 * 1. Pre/Post Uplift - Compare metrics before/after action
 * 2. Difference-in-Differences (DiD) - Compare treated vs control groups
 * 3. Change-Point Detection - Identify significant metric shifts
 * 4. Lagged Correlation - Find delayed effects (1-21 days)
 */

import { prisma } from '@farmy/db';

export type InsightMethod =
  | 'PRE_POST'
  | 'DID'
  | 'CHANGE_POINT'
  | 'LAG_CORRELATION';

export type InsightConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface InsightResult {
  actionEventId: string;
  method: InsightMethod;
  metricType: string;
  effectPercent: number; // Percentage change
  lagDays: number; // Days between action and effect
  windowStart: Date;
  windowEnd: Date;
  confidence: InsightConfidence;
  narrative: string;
  pValue?: number; // Statistical significance
  sampleSize: number;
}

/**
 * Analyze action event and generate insights
 * Main entry point for causality analysis
 */
export async function analyzeActionEvent(
  actionEventId: string
): Promise<InsightResult[]> {
  const actionEvent = await prisma.actionEvent.findUnique({
    where: { id: actionEventId },
    include: {
      farm: true,
    },
  });

  if (!actionEvent) {
    throw new Error(`Action event ${actionEventId} not found`);
  }

  const insights: InsightResult[] = [];

  // Analyze different metrics based on action type
  const metricsToAnalyze = getMetricsForActionType(actionEvent.type);

  for (const metricType of metricsToAnalyze) {
    // Try different analysis methods
    const prePostResult = await analyzePrePost(actionEvent, metricType);
    if (prePostResult) insights.push(prePostResult);

    const lagResult = await analyzeLaggedEffect(actionEvent, metricType);
    if (lagResult) insights.push(lagResult);

    // DiD and change-point detection would be implemented here
    // For MVP, focusing on pre/post and lagged correlation
  }

  return insights;
}

/**
 * Pre/Post Uplift Analysis
 * Compare metric values before and after action
 */
async function analyzePrePost(
  actionEvent: any,
  metricType: string
): Promise<InsightResult | null> {
  const actionDate = new Date(actionEvent.date);
  const windowDays = 14; // 2 weeks before and after

  // Get pre-action metrics
  const preStart = new Date(actionDate);
  preStart.setDate(preStart.getDate() - windowDays);
  const preMetrics = await getMetricSnapshots(
    actionEvent.farmId,
    metricType,
    preStart,
    actionDate,
    actionEvent.affectedAnimalIds
  );

  // Get post-action metrics
  const postEnd = new Date(actionDate);
  postEnd.setDate(postEnd.getDate() + windowDays);
  const postMetrics = await getMetricSnapshots(
    actionEvent.farmId,
    metricType,
    actionDate,
    postEnd,
    actionEvent.affectedAnimalIds
  );

  if (preMetrics.length < 3 || postMetrics.length < 3) {
    return null; // Insufficient data
  }

  // Calculate averages
  const preAvg = average(preMetrics.map((m) => m.value));
  const postAvg = average(postMetrics.map((m) => m.value));

  // Calculate effect
  const effectPercent = ((postAvg - preAvg) / preAvg) * 100;

  // Determine confidence based on sample size and effect magnitude
  const confidence = determineConfidence(
    preMetrics.length + postMetrics.length,
    Math.abs(effectPercent)
  );

  // Generate narrative
  const narrative = generateNarrative(
    actionEvent.type,
    metricType,
    effectPercent,
    0, // No lag for pre/post
    preAvg,
    postAvg
  );

  return {
    actionEventId: actionEvent.id,
    method: 'PRE_POST',
    metricType,
    effectPercent,
    lagDays: 0,
    windowStart: preStart,
    windowEnd: postEnd,
    confidence,
    narrative,
    sampleSize: preMetrics.length + postMetrics.length,
  };
}

/**
 * Lagged Correlation Analysis
 * Find delayed effects by testing different lag periods (1-21 days)
 */
async function analyzeLaggedEffect(
  actionEvent: any,
  metricType: string
): Promise<InsightResult | null> {
  const actionDate = new Date(actionEvent.date);
  const maxLag = 21; // Test up to 21 days lag
  const windowDays = 14;

  let bestLag = 0;
  let bestEffect = 0;
  let bestConfidence: InsightConfidence = 'LOW';
  let bestMetrics: any[] = [];

  // Get baseline (before action)
  const baselineStart = new Date(actionDate);
  baselineStart.setDate(baselineStart.getDate() - windowDays);
  const baselineMetrics = await getMetricSnapshots(
    actionEvent.farmId,
    metricType,
    baselineStart,
    actionDate,
    actionEvent.affectedAnimalIds
  );

  if (baselineMetrics.length < 3) return null;

  const baselineAvg = average(baselineMetrics.map((m) => m.value));

  // Test different lag periods
  for (let lag = 1; lag <= maxLag; lag++) {
    const lagStart = new Date(actionDate);
    lagStart.setDate(lagStart.getDate() + lag);

    const lagEnd = new Date(lagStart);
    lagEnd.setDate(lagEnd.getDate() + windowDays);

    const lagMetrics = await getMetricSnapshots(
      actionEvent.farmId,
      metricType,
      lagStart,
      lagEnd,
      actionEvent.affectedAnimalIds
    );

    if (lagMetrics.length < 3) continue;

    const lagAvg = average(lagMetrics.map((m) => m.value));
    const effect = ((lagAvg - baselineAvg) / baselineAvg) * 100;

    // Keep track of strongest effect
    if (Math.abs(effect) > Math.abs(bestEffect)) {
      bestLag = lag;
      bestEffect = effect;
      bestMetrics = lagMetrics;
      bestConfidence = determineConfidence(
        baselineMetrics.length + lagMetrics.length,
        Math.abs(effect)
      );
    }
  }

  // Only return if we found a meaningful effect
  if (Math.abs(bestEffect) < 5) return null; // Less than 5% change

  const windowStart = new Date(actionDate);
  windowStart.setDate(windowStart.getDate() + bestLag);
  const windowEnd = new Date(windowStart);
  windowEnd.setDate(windowEnd.getDate() + windowDays);

  const narrative = generateNarrative(
    actionEvent.type,
    metricType,
    bestEffect,
    bestLag,
    baselineAvg,
    average(bestMetrics.map((m) => m.value))
  );

  return {
    actionEventId: actionEvent.id,
    method: 'LAG_CORRELATION',
    metricType,
    effectPercent: bestEffect,
    lagDays: bestLag,
    windowStart,
    windowEnd,
    confidence: bestConfidence,
    narrative,
    sampleSize: baselineMetrics.length + bestMetrics.length,
  };
}

/**
 * Get metric snapshots for analysis
 */
async function getMetricSnapshots(
  farmId: string,
  metricType: string,
  startDate: Date,
  endDate: Date,
  animalIds?: string[]
): Promise<any[]> {
  const where: any = {
    farmId,
    metricType,
    date: {
      gte: startDate,
      lte: endDate,
    },
    deletedAt: null,
  };

  // Filter by cohort if animal IDs provided
  if (animalIds && animalIds.length > 0) {
    where.cohort = { in: animalIds };
  }

  return await prisma.metricSnapshot.findMany({
    where,
    orderBy: { date: 'asc' },
  });
}

/**
 * Determine which metrics to analyze based on action type
 */
function getMetricsForActionType(actionType: string): string[] {
  const metricsMap: Record<string, string[]> = {
    SHEARING: ['ADG', 'MILK_YIELD', 'HEALTH_SCORE'],
    SUPPLIER_CHANGE: ['ADG', 'FEED_COST', 'HEALTH_SCORE'],
    RATION_CHANGE: ['ADG', 'MILK_YIELD', 'FEED_COST'],
    PROTOCOL_CHANGE: ['HEALTH_SCORE', 'CONCEPTION_RATE', 'MORTALITY_RATE'],
    PEN_MOVE: ['ADG', 'HEALTH_SCORE', 'STRESS_INDICATORS'],
  };

  return metricsMap[actionType] || ['ADG', 'MILK_YIELD', 'HEALTH_SCORE'];
}

/**
 * Determine confidence level based on sample size and effect magnitude
 */
function determineConfidence(
  sampleSize: number,
  effectMagnitude: number
): InsightConfidence {
  if (sampleSize >= 20 && effectMagnitude >= 15) return 'HIGH';
  if (sampleSize >= 10 && effectMagnitude >= 10) return 'MEDIUM';
  return 'LOW';
}

/**
 * Generate human-readable narrative for insight
 */
function generateNarrative(
  actionType: string,
  metricType: string,
  effectPercent: number,
  lagDays: number,
  beforeValue: number,
  afterValue: number
): string {
  const direction = effectPercent > 0 ? 'increased' : 'decreased';
  const magnitude = Math.abs(effectPercent).toFixed(1);

  let actionDescription = actionType.toLowerCase().replace(/_/g, ' ');
  let metricDescription = metricType.toLowerCase().replace(/_/g, ' ');

  let narrative = `After ${actionDescription}, ${metricDescription} ${direction} by ${magnitude}%`;

  if (lagDays > 0) {
    narrative += ` (effect observed ${lagDays} days later)`;
  }

  narrative += `. Changed from ${beforeValue.toFixed(2)} to ${afterValue.toFixed(2)}.`;

  return narrative;
}

/**
 * Calculate average of array
 */
function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Scan for new insights across all action events
 * Creates InsightCard records for significant findings
 * 
 * CRON: Nightly at 3:00 AM
 */
export async function scanForInsights(): Promise<{
  actionsAnalyzed: number;
  insightsGenerated: number;
}> {
  console.log('[Insights] Starting nightly scan...');

  // Get recent action events that haven't been analyzed yet
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 30); // Last 30 days

  const actionEvents = await prisma.actionEvent.findMany({
    where: {
      date: { gte: recentDate },
      deletedAt: null,
    },
    orderBy: { date: 'desc' },
    take: 100, // Process in batches
  });

  let insightsGenerated = 0;

  for (const actionEvent of actionEvents) {
    try {
      // Check if already analyzed
      const existingInsights = await prisma.insightCard.findMany({
        where: {
          actionEventId: actionEvent.id,
          deletedAt: null,
        },
      });

      if (existingInsights.length > 0) continue; // Already analyzed

      // Analyze action event
      const insights = await analyzeActionEvent(actionEvent.id);

      // Create insight cards for significant findings
      for (const insight of insights) {
        if (insight.confidence === 'LOW' && Math.abs(insight.effectPercent) < 10) {
          continue; // Skip low-confidence, low-impact insights
        }

        await prisma.insightCard.create({
          data: {
            farmId: actionEvent.farmId,
            actionEventId: actionEvent.id,
            title: `${insight.metricType} Impact from ${actionEvent.type}`,
            narrative: insight.narrative,
            effectPercent: insight.effectPercent,
            lagDays: insight.lagDays,
            windowStart: insight.windowStart,
            windowEnd: insight.windowEnd,
            confidence: insight.confidence,
            status: 'PENDING',
          },
        });

        insightsGenerated++;
      }
    } catch (error) {
      console.error(`[Insights] Error analyzing action ${actionEvent.id}:`, error);
    }
  }

  console.log(
    `[Insights] Scan complete: ${actionEvents.length} actions analyzed, ${insightsGenerated} insights generated`
  );

  return {
    actionsAnalyzed: actionEvents.length,
    insightsGenerated,
  };
}

/**
 * CRON JOB SETUP NOTES:
 * 
 * Using node-cron:
 * 
 * ```typescript
 * import cron from 'node-cron';
 * import { scanForInsights } from './services/insights.service';
 * 
 * // Run nightly at 3:00 AM
 * cron.schedule('0 3 * * *', async () => {
 *   await scanForInsights();
 * });
 * ```
 */


