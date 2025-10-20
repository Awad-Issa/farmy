/**
 * Sync Engine
 * Handles push/pull synchronization with the server
 * Implements Last-Write-Wins (LWW) conflict resolution
 */

import { database } from '../../database/database';
import { Q } from '@nozbe/watermelondb';
import * as SecureStore from 'expo-secure-store';
import { getAccessToken, getCurrentFarmId } from '../auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const BATCH_SIZE = 500;
const MAX_RETRIES = 3;

interface PushResponse {
  success: boolean;
  clientMutationId: string;
  error?: string;
}

interface PullResponse {
  changes: Record<string, any[]>;
  timestamp: number;
}

/**
 * Generate unique client mutation ID
 */
function generateMutationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Get last sync timestamp for current farm
 */
async function getLastSyncTimestamp(farmId: string): Promise<number> {
  const key = `last_sync_${farmId}`;
  const timestamp = await SecureStore.getItemAsync(key);
  return timestamp ? parseInt(timestamp, 10) : 0;
}

/**
 * Update last sync timestamp
 */
async function setLastSyncTimestamp(farmId: string, timestamp: number): Promise<void> {
  const key = `last_sync_${farmId}`;
  await SecureStore.setItemAsync(key, timestamp.toString());
}

/**
 * Push pending changes to server
 * Sends outbox items in batches
 */
export async function pushChanges(): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getAccessToken();
    const farmId = await getCurrentFarmId();

    if (!accessToken || !farmId) {
      return { success: false, error: 'Not authenticated or no farm selected' };
    }

    // Get pending outbox items
    const outboxCollection = database.get('outbox');
    const pendingItems = await outboxCollection
      .query(Q.where('synced_at', null), Q.sortBy('created_at', Q.asc))
      .fetch();

    if (pendingItems.length === 0) {
      return { success: true }; // Nothing to sync
    }

    console.log(`Pushing ${pendingItems.length} changes...`);

    // Process in batches
    const batches = [];
    for (let i = 0; i < pendingItems.length; i += BATCH_SIZE) {
      batches.push(pendingItems.slice(i, i + BATCH_SIZE));
    }

    let successCount = 0;
    let errorCount = 0;

    for (const batch of batches) {
      const mutations = batch.map((item: any) => ({
        clientMutationId: item.clientMutationId,
        table: item.tableName,
        operation: item.operation,
        recordId: item.recordId,
        data: JSON.parse(item.payload),
      }));

      try {
        const response = await fetch(`${API_URL}/api/trpc/sync.pushBatch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-Farm-Id': farmId,
          },
          body: JSON.stringify({ mutations }),
        });

        if (!response.ok) {
          throw new Error(`Push failed: ${response.status}`);
        }

        const result = await response.json();
        
        // Mark items as synced
        await database.write(async () => {
          for (const item of batch) {
            await item.update((record: any) => {
              record.syncedAt = new Date();
            });
          }
        });

        successCount += batch.length;
      } catch (error) {
        console.error('Batch push error:', error);
        errorCount += batch.length;

        // Update retry count
        await database.write(async () => {
          for (const item of batch) {
            await item.update((record: any) => {
              record.retryCount = (record.retryCount || 0) + 1;
              record.error = error instanceof Error ? error.message : 'Unknown error';
            });
          }
        });
      }
    }

    console.log(`Push complete: ${successCount} succeeded, ${errorCount} failed`);

    return {
      success: errorCount === 0,
      error: errorCount > 0 ? `${errorCount} items failed to sync` : undefined,
    };
  } catch (error) {
    console.error('Push changes error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Pull changes from server
 * Fetches updates since last sync using delta sync
 */
export async function pullChanges(): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getAccessToken();
    const farmId = await getCurrentFarmId();

    if (!accessToken || !farmId) {
      return { success: false, error: 'Not authenticated or no farm selected' };
    }

    const lastSync = await getLastSyncTimestamp(farmId);
    console.log(`Pulling changes since ${new Date(lastSync).toISOString()}...`);

    const response = await fetch(
      `${API_URL}/api/trpc/sync.pull?since=${lastSync}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Farm-Id': farmId,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 409) {
        // Conflict detected - server will send conflicting records
        console.log('Conflict detected, applying Last-Write-Wins...');
        // Continue to process the response
      } else {
        throw new Error(`Pull failed: ${response.status}`);
      }
    }

    const result: PullResponse = await response.json();

    // Apply changes to local database
    await applyServerChanges(result.changes);

    // Update last sync timestamp
    await setLastSyncTimestamp(farmId, result.timestamp);

    console.log('Pull complete');

    return { success: true };
  } catch (error) {
    console.error('Pull changes error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Apply server changes to local database
 * Implements Last-Write-Wins conflict resolution
 */
async function applyServerChanges(changes: Record<string, any[]>): Promise<void> {
  await database.write(async () => {
    for (const [tableName, records] of Object.entries(changes)) {
      if (records.length === 0) continue;

      const collection = database.get(tableName);

      for (const serverRecord of records) {
        try {
          // Try to find existing record
          const existing = await collection.find(serverRecord.id);

          // Last-Write-Wins: Compare updatedAt timestamps
          if (existing && existing.updatedAt) {
            const localTimestamp = existing.updatedAt.getTime();
            const serverTimestamp = new Date(serverRecord.updatedAt).getTime();

            if (localTimestamp > serverTimestamp) {
              // Local is newer, skip this update
              console.log(`Skipping ${tableName}:${serverRecord.id} - local is newer`);
              continue;
            }
          }

          // Update existing record
          await existing.update((record: any) => {
            Object.assign(record, serverRecord);
          });
        } catch (error) {
          // Record doesn't exist, create it
          await collection.create((record: any) => {
            Object.assign(record, serverRecord);
          });
        }
      }
    }
  });
}

/**
 * Full synchronization (push then pull)
 */
export async function syncNow(): Promise<{ success: boolean; error?: string }> {
  console.log('Starting full sync...');

  // First push local changes
  const pushResult = await pushChanges();
  if (!pushResult.success) {
    return pushResult;
  }

  // Then pull server changes
  const pullResult = await pullChanges();
  if (!pullResult.success) {
    return pullResult;
  }

  console.log('Full sync complete!');
  return { success: true };
}

/**
 * Add item to outbox for later sync
 */
export async function queueChange(
  tableName: string,
  operation: 'CREATE' | 'UPDATE' | 'DELETE',
  recordId: string,
  data: any
): Promise<void> {
  await database.write(async () => {
    const outboxCollection = database.get('outbox');
    await outboxCollection.create((record: any) => {
      record.clientMutationId = generateMutationId();
      record.tableName = tableName;
      record.operation = operation;
      record.recordId = recordId;
      record.payload = JSON.stringify(data);
      record.retryCount = 0;
      record.createdAt = new Date();
    });
  });
}

