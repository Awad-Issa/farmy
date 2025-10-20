/**
 * Sale Model for WatermelonDB
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Sale extends Model {
  static table = 'sales';

  @field('server_id') serverId!: string;
  @field('farm_id') farmId!: string;
  @field('animal_id') animalId!: string;
  @date('sale_date') saleDate!: Date;
  @field('buyer_name') buyerName?: string;
  @field('buyer_phone') buyerPhone?: string;
  @field('price') price!: number;
  @field('weight_kg') weightKg?: number;
  @field('payment_method') paymentMethod?: string;
  @field('notes') notes?: string;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt?: Date;
  @readonly @date('created_at') createdAt!: Date;
}

