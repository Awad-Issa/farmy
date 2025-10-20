/**
 * MilkYield Model for WatermelonDB
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class MilkYield extends Model {
  static table = 'milk_yields';

  @field('server_id') serverId!: string;
  @field('farm_id') farmId!: string;
  @field('animal_id') animalId!: string;
  @field('yield_liters') yieldLiters!: number;
  @date('milked_at') milkedAt!: Date;
  @field('session') session!: string;
  @field('lactation_day') lactationDay?: number;
  @field('notes') notes?: string;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt?: Date;
  @readonly @date('created_at') createdAt!: Date;
}

