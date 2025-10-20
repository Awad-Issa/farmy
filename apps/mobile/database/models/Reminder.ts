/**
 * Reminder Model for WatermelonDB
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Reminder extends Model {
  static table = 'reminders';

  @field('server_id') serverId!: string;
  @field('farm_id') farmId!: string;
  @field('animal_id') animalId?: string;
  @field('title') title!: string;
  @field('description') description?: string;
  @date('due_date') dueDate!: Date;
  @field('completed') completed!: boolean;
  @date('completed_at') completedAt?: Date;
  @field('reminder_type') reminderType!: string;
  @field('priority') priority?: string;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt?: Date;
  @readonly @date('created_at') createdAt!: Date;
}

