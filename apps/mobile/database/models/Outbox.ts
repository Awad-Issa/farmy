/**
 * Outbox Model for WatermelonDB
 * Stores pending changes to be synced
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Outbox extends Model {
  static table = 'outbox';

  @field('client_mutation_id') clientMutationId!: string;
  @field('table_name') tableName!: string;
  @field('operation') operation!: string; // CREATE/UPDATE/DELETE
  @field('record_id') recordId!: string;
  @field('payload') payload!: string; // JSON stringified data
  @field('retry_count') retryCount!: number;
  @date('created_at') createdAt!: Date;
  @date('synced_at') syncedAt?: Date;
  @field('error') error?: string;
}

