/**
 * Reminders Service
 * Generates and dispatches reminders for breeding, health, inventory
 * 
 * CRON SCHEDULE: Every 10 minutes
 * Job: reminders:dispatch
 * 
 * Per PLAN.md §5.4 and System_Technical_Spec §8
 */

import { prisma } from '@farmy/db';

export interface ReminderConfig {
  farmId: string;
  userId?: string; // If user-specific
  type: 'BREEDING' | 'HEALTH' | 'INVENTORY' | 'GENERAL';
  dueDate: Date;
  targetEntityId?: string;
  title: string;
  description?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Generate breeding reminders
 * - INS2 reminder (+17 days after INS1)
 * - CK1 reminder (+28 days after INS1)
 * - CK2 reminder (+47-50 days after INS1)
 * - Lambing prep (7 days before dueStart)
 * - Overdue lambing alerts
 */
export async function generateBreedingReminders(farmId: string): Promise<number> {
  let count = 0;

  // Get active breeding cycles
  const cycles = await prisma.breedingCycle.findMany({
    where: {
      farmId,
      status: { in: ['INSEMINATED', 'PREGNANT'] },
      deletedAt: null,
    },
    include: {
      ewe: true,
    },
  });

  for (const cycle of cycles) {
    const now = new Date();
    const ins1Date = new Date(cycle.ins1Date);

    // INS2 reminder (if no INS2 recorded yet, and it's been 17 days)
    if (!cycle.ins2Date) {
      const ins2DueDate = new Date(ins1Date);
      ins2DueDate.setDate(ins2DueDate.getDate() + 17);

      if (ins2DueDate <= now && ins2DueDate > new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
        await createReminder({
          farmId,
          type: 'BREEDING',
          dueDate: ins2DueDate,
          targetEntityId: cycle.id,
          title: `INS2 Due for Ewe #${cycle.ewe.tagNumber}`,
          description: 'Second insemination recommended',
          priority: 'MEDIUM',
        });
        count++;
      }
    }

    // CK1 reminder (if no check1 recorded yet, and it's been 28 days)
    if (!cycle.check1Date) {
      const ck1DueDate = new Date(ins1Date);
      ck1DueDate.setDate(ck1DueDate.getDate() + 28);

      if (ck1DueDate <= now && ck1DueDate > new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
        await createReminder({
          farmId,
          type: 'BREEDING',
          dueDate: ck1DueDate,
          targetEntityId: cycle.id,
          title: `Pregnancy Check 1 Due for Ewe #${cycle.ewe.tagNumber}`,
          description: 'First pregnancy check (28 days)',
          priority: 'HIGH',
        });
        count++;
      }
    }

    // CK2 reminder (if check1 was positive and no check2 yet, around 47-50 days)
    if (cycle.check1Result === 'POSITIVE' && !cycle.check2Date) {
      const ck2DueDate = new Date(ins1Date);
      ck2DueDate.setDate(ck2DueDate.getDate() + 48);

      if (ck2DueDate <= now && ck2DueDate > new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
        await createReminder({
          farmId,
          type: 'BREEDING',
          dueDate: ck2DueDate,
          targetEntityId: cycle.id,
          title: `Pregnancy Check 2 Due for Ewe #${cycle.ewe.tagNumber}`,
          description: 'Second pregnancy check (47-50 days)',
          priority: 'MEDIUM',
        });
        count++;
      }
    }

    // Lambing prep reminder (7 days before dueStart)
    if (cycle.status === 'PREGNANT' && cycle.dueStart) {
      const dueStart = new Date(cycle.dueStart);
      const prepDate = new Date(dueStart);
      prepDate.setDate(prepDate.getDate() - 7);

      if (prepDate <= now && prepDate > new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
        await createReminder({
          farmId,
          type: 'BREEDING',
          dueDate: prepDate,
          targetEntityId: cycle.id,
          title: `Lambing Prep for Ewe #${cycle.ewe.tagNumber}`,
          description: `Expected lambing: ${dueStart.toLocaleDateString()}`,
          priority: 'HIGH',
        });
        count++;
      }
    }

    // Overdue lambing alert
    if (cycle.status === 'PREGNANT' && cycle.dueEnd) {
      const dueEnd = new Date(cycle.dueEnd);
      if (now > dueEnd) {
        await createReminder({
          farmId,
          type: 'BREEDING',
          dueDate: now,
          targetEntityId: cycle.id,
          title: `OVERDUE: Ewe #${cycle.ewe.tagNumber}`,
          description: `Lambing overdue since ${dueEnd.toLocaleDateString()}`,
          priority: 'HIGH',
        });
        count++;
      }
    }
  }

  return count;
}

/**
 * Generate health reminders
 * - Dose due/overdue alerts
 * - Vaccine boosters
 * - Withdrawal period end notifications
 */
export async function generateHealthReminders(farmId: string): Promise<number> {
  let count = 0;
  const now = new Date();

  // Get upcoming doses
  const doses = await prisma.dose.findMany({
    where: {
      farmId,
      status: 'SCHEDULED',
      scheduledAt: {
        lte: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Next 24 hours
      },
      deletedAt: null,
    },
    include: {
      treatment: true,
      animal: true,
    },
  });

  for (const dose of doses) {
    await createReminder({
      farmId,
      type: 'HEALTH',
      dueDate: new Date(dose.scheduledAt),
      targetEntityId: dose.id,
      title: `Dose Due for ${dose.animal.tagNumber}`,
      description: `${dose.treatment.drug} - ${dose.treatment.dose}`,
      priority: 'HIGH',
    });
    count++;
  }

  // Get overdue doses
  const overdueDoses = await prisma.dose.findMany({
    where: {
      farmId,
      status: 'SCHEDULED',
      scheduledAt: {
        lt: now,
      },
      deletedAt: null,
    },
    include: {
      treatment: true,
      animal: true,
    },
  });

  for (const dose of overdueDoses) {
    await createReminder({
      farmId,
      type: 'HEALTH',
      dueDate: now,
      targetEntityId: dose.id,
      title: `OVERDUE: Dose for ${dose.animal.tagNumber}`,
      description: `${dose.treatment.drug} was due ${new Date(dose.scheduledAt).toLocaleDateString()}`,
      priority: 'HIGH',
    });
    count++;
  }

  return count;
}

/**
 * Generate inventory reminders
 * - Low stock alerts
 * - Expiring items (within 30 days)
 */
export async function generateInventoryReminders(farmId: string): Promise<number> {
  let count = 0;
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Low stock items
  const lowStockItems = await prisma.inventoryItem.findMany({
    where: {
      farmId,
      reorderLevel: { not: null },
      deletedAt: null,
    },
  });

  for (const item of lowStockItems) {
    // Calculate current stock
    const batches = await prisma.inventoryBatch.findMany({
      where: {
        itemId: item.id,
        farmId,
        deletedAt: null,
      },
    });

    const totalStock = batches.reduce((sum, batch) => sum + batch.quantity, 0);

    if (item.reorderLevel && totalStock <= item.reorderLevel) {
      await createReminder({
        farmId,
        type: 'INVENTORY',
        dueDate: now,
        targetEntityId: item.id,
        title: `Low Stock: ${item.name}`,
        description: `Current: ${totalStock} ${item.unit}, Reorder at: ${item.reorderLevel}`,
        priority: 'MEDIUM',
      });
      count++;
    }
  }

  // Expiring items
  const expiringBatches = await prisma.inventoryBatch.findMany({
    where: {
      farmId,
      expiryDate: {
        lte: thirtyDaysFromNow,
        gte: now,
      },
      deletedAt: null,
    },
    include: {
      item: true,
    },
  });

  for (const batch of expiringBatches) {
    await createReminder({
      farmId,
      type: 'INVENTORY',
      dueDate: new Date(batch.expiryDate!),
      targetEntityId: batch.id,
      title: `Expiring Soon: ${batch.item.name}`,
      description: `Batch ${batch.batchCode} expires ${new Date(batch.expiryDate!).toLocaleDateString()}`,
      priority: 'MEDIUM',
    });
    count++;
  }

  return count;
}

/**
 * Create a reminder (idempotent by type + targetEntityId + dueDate)
 */
async function createReminder(config: ReminderConfig): Promise<void> {
  // Check if reminder already exists
  const existing = await prisma.reminder.findFirst({
    where: {
      farmId: config.farmId,
      type: config.type,
      targetEntityId: config.targetEntityId,
      dueDate: config.dueDate,
      completed: false,
      deletedAt: null,
    },
  });

  if (existing) {
    return; // Already exists
  }

  await prisma.reminder.create({
    data: {
      farmId: config.farmId,
      type: config.type,
      dueDate: config.dueDate,
      targetEntityId: config.targetEntityId,
      title: config.title,
      description: config.description,
      priority: config.priority || 'MEDIUM',
      completed: false,
      createdBy: 'system',
    },
  });
}

/**
 * Main dispatcher function - called by cron job
 * Generates reminders for all active farms
 * 
 * CRON: Every 10 minutes
 */
export async function dispatchReminders(): Promise<{
  farmsProcessed: number;
  remindersCreated: number;
}> {
  console.log('[Reminders] Starting dispatch...');

  const farms = await prisma.farm.findMany({
    where: { deletedAt: null },
    select: { id: true },
  });

  let totalReminders = 0;

  for (const farm of farms) {
    try {
      const breedingCount = await generateBreedingReminders(farm.id);
      const healthCount = await generateHealthReminders(farm.id);
      const inventoryCount = await generateInventoryReminders(farm.id);

      totalReminders += breedingCount + healthCount + inventoryCount;

      console.log(
        `[Reminders] Farm ${farm.id}: ${breedingCount} breeding, ${healthCount} health, ${inventoryCount} inventory`
      );
    } catch (error) {
      console.error(`[Reminders] Error processing farm ${farm.id}:`, error);
    }
  }

  console.log(`[Reminders] Dispatch complete: ${totalReminders} reminders created for ${farms.length} farms`);

  return {
    farmsProcessed: farms.length,
    remindersCreated: totalReminders,
  };
}

/**
 * CRON JOB SETUP NOTES:
 * 
 * Using node-cron or similar scheduler:
 * 
 * ```typescript
 * import cron from 'node-cron';
 * import { dispatchReminders } from './services/reminders.service';
 * 
 * // Run every 10 minutes
 * cron.schedule('* /10 * * * *', async () => {
 *   await dispatchReminders();
 * });
 * ```
 * 
 * Or using a separate worker process:
 * - Deploy as separate service
 * - Use BullMQ or similar queue
 * - Schedule via cron or internal scheduler
 */


