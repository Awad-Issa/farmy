/**
 * BreedingCycle Model for WatermelonDB
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class BreedingCycle extends Model {
  static table = 'breeding_cycles';

  @field('server_id') serverId!: string;
  @field('farm_id') farmId!: string;
  @field('ewe_id') eweId!: string;
  @field('ram_id') ramId?: string;
  @field('method') method!: string;
  @date('ins1_date') ins1Date!: Date;
  @date('ins2_date') ins2Date?: Date;
  @date('check1_date') check1Date?: Date;
  @field('check1_result') check1Result?: string;
  @date('check2_date') check2Date?: Date;
  @field('check2_result') check2Result?: string;
  @field('status') status!: string;
  @date('conception_date') conceptionDate?: Date;
  @date('est_due') estDue?: Date;
  @date('due_start') dueStart?: Date;
  @date('due_end') dueEnd?: Date;
  @field('notes') notes?: string;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt?: Date;
  @readonly @date('created_at') createdAt!: Date;
}

