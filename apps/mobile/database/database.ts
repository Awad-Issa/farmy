/**
 * WatermelonDB Database Setup
 */

import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';

// Import models
import Animal from './models/Animal';
import BreedingCycle from './models/BreedingCycle';
import HealthEvent from './models/HealthEvent';
import Weight from './models/Weight';
import MilkYield from './models/MilkYield';
import Sale from './models/Sale';
import Reminder from './models/Reminder';
import Outbox from './models/Outbox';

// Initialize adapter
const adapter = new SQLiteAdapter({
  schema,
  dbName: 'farmy',
  // migrations: migrations, // We'll add this later if needed
  jsi: true, // Use JSI (faster)
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});

// Initialize database
export const database = new Database({
  adapter,
  modelClasses: [
    Animal,
    BreedingCycle,
    HealthEvent,
    Weight,
    MilkYield,
    Sale,
    Reminder,
    Outbox,
  ],
});

