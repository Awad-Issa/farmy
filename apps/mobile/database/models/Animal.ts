/**
 * Animal Model for WatermelonDB
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Animal extends Model {
  static table = 'animals';

  @field('server_id') serverId!: string;
  @field('farm_id') farmId!: string;
  @field('tag_number') tagNumber!: string;
  @field('rfid') rfid?: string;
  @field('type') type!: string;
  @field('gender') gender!: string;
  @field('breed') breed?: string;
  @date('birth_date') birthDate?: Date;
  @field('status') status!: string;
  @field('sire_id') sireId?: string;
  @field('dam_id') damId?: string;
  @date('purchase_date') purchaseDate?: Date;
  @field('purchase_price') purchasePrice?: number;
  @field('notes') notes?: string;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt?: Date;
  @readonly @date('created_at') createdAt!: Date;
}

