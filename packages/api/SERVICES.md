# Services & Background Jobs

This document describes the background services and scheduled jobs for the Farmy API.

## Overview

Per **PLAN.md §5 (Phase 5: Services & Jobs)** and **System_Technical_Spec §7-§8**, the following services are implemented:

| Service | Schedule | Purpose | Estimate |
|---------|----------|---------|----------|
| Metrics Snapshot | Nightly 1:00 AM | Capture daily KPIs (ADG, milk, conception) | 12h |
| Cost Backfill | Nightly 2:00 AM | Upgrade cost confidence levels | 10h |
| Insights Scan | Nightly 3:00 AM | Analyze actions → outcomes causality | 16h |
| Reminders Dispatcher | Every 10 min | Generate breeding/health/inventory reminders | 12h |

**Total Estimate:** 50 hours

---

## 1. Metrics Snapshot Service

**File:** `src/services/metrics.service.ts`  
**Schedule:** Daily at 1:00 AM  
**Duration:** ~5-10 minutes per farm

### Metrics Captured

1. **ADG (Average Daily Gain)**
   - Calculated over 30-day window
   - Per animal cohort
   - Formula: (End Weight - Start Weight) / Days

2. **Milk Yield**
   - Weekly average per animal
   - Only for active ewes
   - Aggregated from daily yields

3. **Conception Rate**
   - 90-day rolling window
   - Percentage of successful pregnancies
   - Based on breeding cycle results

4. **Mortality Rate**
   - 90-day rolling window
   - Percentage of deaths
   - Farm-level metric

5. **Health Score**
   - 30-day window
   - Score: 100 - (events × 10)
   - Per animal

6. **Feed Cost**
   - 30-day average per animal
   - Based on inventory transactions
   - Includes confidence levels

### Usage

```typescript
import { captureMetricSnapshots } from './services/metrics.service';

const result = await captureMetricSnapshots();
console.log(`Captured ${result.snapshotsCaptured} snapshots for ${result.farmsProcessed} farms`);
```

---

## 2. Cost Resolver Service

**File:** `src/services/cost-resolver.service.ts`  
**Schedule:** Daily at 2:00 AM (backfill job)  
**Duration:** ~10-15 minutes

### Resolution Chain

The service implements a confidence-based fallback chain per **System_Technical_Spec §7.7**:

1. **Batch/FIFO** (HIGH confidence)
   - Uses actual purchase costs from inventory batches
   - FIFO allocation for usage transactions

2. **Last Known Price** (MEDIUM confidence)
   - Most recent purchase price for the item
   - Within reasonable time window

3. **Catalog Default** (MEDIUM confidence)
   - Predefined prices from catalog table
   - Manually maintained reference prices

4. **Derived** (MEDIUM confidence)
   - Unit conversion calculations
   - E.g., kg → ton pricing

5. **Fuzzy Match** (LOW confidence)
   - Similar items by name/category
   - Average of matched items

6. **Reference Price** (LOW confidence)
   - Industry/market reference prices
   - External data source

7. **Zero** (LOW confidence)
   - Last resort when no data available
   - Flagged for manual review

### Backfill Process

The nightly backfill job:
- Finds transactions with LOW confidence or ZERO cost
- Re-runs cost resolution with current data
- Upgrades confidence if better data now available
- Processes in batches of 1000

### Usage

```typescript
import { resolveCost, backfillCosts } from './services/cost-resolver.service';

// Resolve cost for a transaction
const resolution = await resolveCost(farmId, itemId, quantity, date);
console.log(`Cost: ${resolution.costValue}, Source: ${resolution.costSource}, Confidence: ${resolution.confidence}`);

// Run backfill
const result = await backfillCosts();
console.log(`Upgraded ${result.transactionsUpgraded} of ${result.transactionsProcessed} transactions`);
```

---

## 3. Insights Service

**File:** `src/services/insights.service.ts`  
**Schedule:** Daily at 3:00 AM  
**Duration:** ~15-30 minutes

### Analysis Methods

Per **System_Technical_Spec §7.8**, the service implements:

1. **Pre/Post Uplift**
   - Compare metrics before/after action
   - 14-day windows
   - Percentage change calculation

2. **Lagged Correlation**
   - Test lag periods 1-21 days
   - Find delayed effects
   - Identify optimal lag

3. **Difference-in-Differences** (Future)
   - Compare treated vs control groups
   - Control for confounding factors

4. **Change-Point Detection** (Future)
   - Identify significant metric shifts
   - Statistical breakpoint analysis

### Action Types Analyzed

- **SHEARING** → ADG, Milk Yield, Health Score
- **SUPPLIER_CHANGE** → ADG, Feed Cost, Health Score
- **RATION_CHANGE** → ADG, Milk Yield, Feed Cost
- **PROTOCOL_CHANGE** → Health Score, Conception Rate
- **PEN_MOVE** → ADG, Health Score, Stress Indicators

### Confidence Levels

- **HIGH**: Sample size ≥20, Effect ≥15%
- **MEDIUM**: Sample size ≥10, Effect ≥10%
- **LOW**: Smaller samples or effects

### Output

Creates `InsightCard` records with:
- Narrative description
- Effect percentage
- Lag days (if applicable)
- Time window
- Confidence level
- Status: PENDING (awaiting user confirmation)

### Usage

```typescript
import { analyzeActionEvent, scanForInsights } from './services/insights.service';

// Analyze specific action
const insights = await analyzeActionEvent(actionEventId);
console.log(`Found ${insights.length} insights`);

// Scan all recent actions
const result = await scanForInsights();
console.log(`Generated ${result.insightsGenerated} insights from ${result.actionsAnalyzed} actions`);
```

---

## 4. Reminders Service

**File:** `src/services/reminders.service.ts`  
**Schedule:** Every 10 minutes  
**Duration:** ~1-2 minutes per run

### Reminder Types

#### Breeding Reminders
- **INS2** - 17 days after INS1
- **CK1** - 28 days after INS1 (pregnancy check)
- **CK2** - 47-50 days after INS1 (second check)
- **Lambing Prep** - 7 days before due date
- **Overdue Lambing** - Past due date

#### Health Reminders
- **Dose Due** - Within next 24 hours
- **Dose Overdue** - Past scheduled time
- **Vaccine Booster** - Based on schedule
- **Withdrawal End** - Milk/meat withdrawal periods

#### Inventory Reminders
- **Low Stock** - Below reorder level
- **Expiring Soon** - Within 30 days
- **Expired** - Past expiry date

### Idempotency

Reminders are idempotent based on:
- Farm ID
- Type
- Target Entity ID
- Due Date

Duplicate reminders are not created.

### Usage

```typescript
import { dispatchReminders, generateBreedingReminders } from './services/reminders.service';

// Generate breeding reminders for a farm
const count = await generateBreedingReminders(farmId);
console.log(`Created ${count} breeding reminders`);

// Dispatch all reminders
const result = await dispatchReminders();
console.log(`Created ${result.remindersCreated} reminders for ${result.farmsProcessed} farms`);
```

---

## Scheduler Setup

**File:** `src/scheduler.ts`

### Development

```typescript
import { initializeScheduler } from './scheduler';

// Start scheduler
initializeScheduler();
```

### Production Deployment

#### Option 1: Separate Worker Process

```bash
# API process
npm run start

# Worker process (separate dyno/container)
npm run worker
```

```typescript
// worker.ts
import { initializeScheduler, shutdownScheduler } from './scheduler';

initializeScheduler();

process.on('SIGTERM', () => {
  shutdownScheduler();
  process.exit(0);
});
```

#### Option 2: Queue-Based (Recommended)

Use BullMQ or similar:

```typescript
import { Queue, Worker } from 'bullmq';

// Schedule jobs
const metricsQueue = new Queue('metrics', { connection: redis });
await metricsQueue.add('snapshot', {}, { repeat: { cron: '0 1 * * *' } });

// Worker
new Worker('metrics', async (job) => {
  if (job.name === 'snapshot') {
    await captureMetricSnapshots();
  }
}, { connection: redis });
```

#### Option 3: External Scheduler

Use cloud provider scheduler (AWS EventBridge, etc.) to call HTTP endpoints:

```typescript
app.post('/cron/metrics', verifySecret, async (req, res) => {
  await captureMetricSnapshots();
  res.send('OK');
});
```

---

## Monitoring

### Metrics to Track

- Job execution duration
- Success/failure rates
- Records processed per job
- Queue depth (if using queues)
- Error rates and types

### Logging

All services log:
- Start time
- End time
- Records processed
- Errors encountered
- Summary statistics

Example:
```
[Metrics] Starting nightly snapshot capture...
[Metrics] Farm abc123: 45 snapshots captured
[Metrics] Farm def456: 38 snapshots captured
[Metrics] Snapshot capture complete: 83 snapshots for 2 farms
```

### Alerting

Set up alerts for:
- Job failures
- Execution time > threshold
- Zero records processed (potential issue)
- High error rates

---

## Environment Variables

```bash
# Scheduler
ENABLE_SCHEDULER=true
SCHEDULER_TIMEZONE=UTC

# Cron secret (for HTTP endpoints)
CRON_SECRET=your-secret-here

# Job-specific settings
METRICS_WINDOW_DAYS=30
COST_BACKFILL_BATCH_SIZE=1000
INSIGHTS_MIN_SAMPLE_SIZE=10
REMINDERS_LOOKAHEAD_DAYS=1
```

---

## Testing

### Unit Tests

```typescript
import { calculateADG, calculateMilkYield } from './services/metrics.service';

describe('Metrics Service', () => {
  it('should calculate ADG correctly', async () => {
    const metrics = await calculateADG(farmId, new Date());
    expect(metrics).toHaveLength(expectedCount);
    expect(metrics[0].value).toBeCloseTo(expectedADG);
  });
});
```

### Integration Tests

```typescript
describe('Cost Resolver', () => {
  it('should resolve cost using FIFO', async () => {
    // Setup: Create batches
    // Act: Resolve cost
    // Assert: Check resolution
  });
});
```

### Manual Testing

```bash
# Run individual services
npm run service:metrics
npm run service:cost-backfill
npm run service:insights
npm run service:reminders
```

---

## Future Enhancements

1. **Parallel Processing**
   - Process farms in parallel
   - Use worker pools

2. **Incremental Updates**
   - Only process changed data
   - Track last processed timestamp

3. **Configurable Schedules**
   - Per-farm schedule preferences
   - Timezone-aware scheduling

4. **Advanced Analytics**
   - Machine learning models
   - Predictive insights
   - Anomaly detection

5. **Real-time Processing**
   - Stream processing for critical metrics
   - Immediate insights for urgent actions

---

## References

- **PLAN.md §5**: Phase 5 - Services & Jobs
- **System_Technical_Spec §7**: Business Modules & Rules
- **System_Technical_Spec §8**: Notifications & Reminders
- **Business_Requirements_Document**: Costing & Insights requirements


