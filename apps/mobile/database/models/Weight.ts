/**
 * Weight Model for WatermelonDB
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Weight extends Model {
  static table = 'weights';

  @field('server_id') serverId!: string;
  @field('farm_id') farmId!: string;
  @field('animal_id') animalId!: string;
  @field('weight_kg') weightKg!: number;
  @date('measured_at') measuredAt!: Date;
  @field('age_days') ageDays?: number;
  @field('bcs') bcs?: number;
  @field('notes') notes?: string;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt?: Date;
  @readonly @date('created_at') createdAt!: Date;
}

