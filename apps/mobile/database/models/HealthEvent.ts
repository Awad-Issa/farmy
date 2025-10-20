/**
 * HealthEvent Model for WatermelonDB
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class HealthEvent extends Model {
  static table = 'health_events';

  @field('server_id') serverId!: string;
  @field('farm_id') farmId!: string;
  @field('animal_id') animalId!: string;
  @field('event_type') eventType!: string;
  @date('event_date') eventDate!: Date;
  @field('diagnosis') diagnosis?: string;
  @field('severity') severity?: string;
  @field('vet_name') vetName?: string;
  @field('notes') notes?: string;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt?: Date;
  @readonly @date('created_at') createdAt!: Date;
}

