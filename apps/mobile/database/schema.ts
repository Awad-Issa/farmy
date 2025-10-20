/**
 * WatermelonDB Schema
 * Defines all tables for offline storage
 */

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    // Animals table
    tableSchema({
      name: 'animals',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'farm_id', type: 'string', isIndexed: true },
        { name: 'tag_number', type: 'string', isIndexed: true },
        { name: 'rfid', type: 'string', isOptional: true, isIndexed: true },
        { name: 'type', type: 'string' },
        { name: 'gender', type: 'string' },
        { name: 'breed', type: 'string', isOptional: true },
        { name: 'birth_date', type: 'number', isOptional: true }, // timestamp
        { name: 'status', type: 'string' },
        { name: 'sire_id', type: 'string', isOptional: true },
        { name: 'dam_id', type: 'string', isOptional: true },
        { name: 'purchase_date', type: 'number', isOptional: true },
        { name: 'purchase_price', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number', isIndexed: true }, // timestamp
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    // Breeding Cycles
    tableSchema({
      name: 'breeding_cycles',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'farm_id', type: 'string', isIndexed: true },
        { name: 'ewe_id', type: 'string', isIndexed: true },
        { name: 'ram_id', type: 'string', isOptional: true },
        { name: 'method', type: 'string' },
        { name: 'ins1_date', type: 'number' },
        { name: 'ins2_date', type: 'number', isOptional: true },
        { name: 'check1_date', type: 'number', isOptional: true },
        { name: 'check1_result', type: 'string', isOptional: true },
        { name: 'check2_date', type: 'number', isOptional: true },
        { name: 'check2_result', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'conception_date', type: 'number', isOptional: true },
        { name: 'est_due', type: 'number', isOptional: true },
        { name: 'due_start', type: 'number', isOptional: true },
        { name: 'due_end', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number', isIndexed: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    // Health Events
    tableSchema({
      name: 'health_events',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'farm_id', type: 'string', isIndexed: true },
        { name: 'animal_id', type: 'string', isIndexed: true },
        { name: 'event_type', type: 'string' },
        { name: 'event_date', type: 'number', isIndexed: true },
        { name: 'diagnosis', type: 'string', isOptional: true },
        { name: 'severity', type: 'string', isOptional: true },
        { name: 'vet_name', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number', isIndexed: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    // Weights
    tableSchema({
      name: 'weights',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'farm_id', type: 'string', isIndexed: true },
        { name: 'animal_id', type: 'string', isIndexed: true },
        { name: 'weight_kg', type: 'number' },
        { name: 'measured_at', type: 'number', isIndexed: true },
        { name: 'age_days', type: 'number', isOptional: true },
        { name: 'bcs', type: 'number', isOptional: true }, // Body Condition Score
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number', isIndexed: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    // Milk Yields
    tableSchema({
      name: 'milk_yields',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'farm_id', type: 'string', isIndexed: true },
        { name: 'animal_id', type: 'string', isIndexed: true },
        { name: 'yield_liters', type: 'number' },
        { name: 'milked_at', type: 'number', isIndexed: true },
        { name: 'session', type: 'string' }, // MORNING/EVENING
        { name: 'lactation_day', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number', isIndexed: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    // Sales
    tableSchema({
      name: 'sales',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'farm_id', type: 'string', isIndexed: true },
        { name: 'animal_id', type: 'string', isIndexed: true },
        { name: 'sale_date', type: 'number', isIndexed: true },
        { name: 'buyer_name', type: 'string', isOptional: true },
        { name: 'buyer_phone', type: 'string', isOptional: true },
        { name: 'price', type: 'number' },
        { name: 'weight_kg', type: 'number', isOptional: true },
        { name: 'payment_method', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number', isIndexed: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    // Reminders
    tableSchema({
      name: 'reminders',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'farm_id', type: 'string', isIndexed: true },
        { name: 'animal_id', type: 'string', isOptional: true },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'due_date', type: 'number', isIndexed: true },
        { name: 'completed', type: 'boolean' },
        { name: 'completed_at', type: 'number', isOptional: true },
        { name: 'reminder_type', type: 'string' },
        { name: 'priority', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number', isIndexed: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    // Outbox (pending changes to sync)
    tableSchema({
      name: 'outbox',
      columns: [
        { name: 'client_mutation_id', type: 'string', isIndexed: true },
        { name: 'table_name', type: 'string', isIndexed: true },
        { name: 'operation', type: 'string' }, // CREATE/UPDATE/DELETE
        { name: 'record_id', type: 'string' },
        { name: 'payload', type: 'string' }, // JSON stringified data
        { name: 'retry_count', type: 'number' },
        { name: 'created_at', type: 'number', isIndexed: true },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'error', type: 'string', isOptional: true },
      ],
    }),

    // Tombstones (soft-deleted records)
    tableSchema({
      name: 'tombstones',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'farm_id', type: 'string', isIndexed: true },
        { name: 'table_name', type: 'string' },
        { name: 'deleted_at', type: 'number', isIndexed: true },
      ],
    }),

    // Sync metadata
    tableSchema({
      name: 'sync_metadata',
      columns: [
        { name: 'farm_id', type: 'string', isIndexed: true },
        { name: 'last_synced_at', type: 'number' },
        { name: 'last_pull_at', type: 'number' },
        { name: 'last_push_at', type: 'number' },
        { name: 'sync_in_progress', type: 'boolean' },
      ],
    }),
  ],
});

