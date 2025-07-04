// Database connection and management for Running Page 2.0
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database configuration
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'running_page_2.db');
const SCHEMA_PATH = path.join(process.cwd(), 'src', 'lib', 'database', 'schema.sql');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Global database instance
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Set journal mode for better performance
    db.pragma('journal_mode = WAL');
    
    // Initialize database if needed
    initializeDatabase(db);
  }
  
  return db;
}

function initializeDatabase(database: Database.Database) {
  // Check if database is already initialized
  const tables = database.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='activities'
  `).all();
  
  if (tables.length === 0) {
    console.log('Initializing new database...');
    
    // Read and execute schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    database.exec(schema);
    
    console.log('Database initialized successfully');
  }
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Migration utilities
export interface Migration {
  version: number;
  name: string;
  up: string;
  down?: string;
}

export function runMigrations(migrations: Migration[]) {
  const db = getDatabase();
  
  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Get applied migrations
  const appliedMigrations = db.prepare(`
    SELECT version FROM migrations ORDER BY version
  `).all() as { version: number }[];
  
  const appliedVersions = new Set(appliedMigrations.map(m => m.version));
  
  // Apply pending migrations
  for (const migration of migrations.sort((a, b) => a.version - b.version)) {
    if (!appliedVersions.has(migration.version)) {
      console.log(`Applying migration ${migration.version}: ${migration.name}`);
      
      const transaction = db.transaction(() => {
        db.exec(migration.up);
        db.prepare(`
          INSERT INTO migrations (version, name) VALUES (?, ?)
        `).run(migration.version, migration.name);
      });
      
      transaction();
      
      console.log(`Migration ${migration.version} applied successfully`);
    }
  }
}

// Data migration from original database
export async function migrateFromOriginalDatabase(originalDbPath: string) {
  const originalDb = new Database(originalDbPath, { readonly: true });
  const newDb = getDatabase();
  
  console.log('Starting data migration from original database...');
  
  try {
    // Get all activities from original database
    const originalActivities = originalDb.prepare(`
      SELECT * FROM activities ORDER BY start_date
    `).all();
    
    console.log(`Found ${originalActivities.length} activities to migrate`);
    
    // Prepare insert statement for new database
    const insertActivity = newDb.prepare(`
      INSERT INTO activities (
        external_id, source, name, type, start_date, start_date_local,
        distance, moving_time, elapsed_time, average_speed, average_heartrate,
        location_country, summary_polyline, raw_data, created_at, updated_at, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Migrate activities in batches
    const batchSize = 100;
    let migrated = 0;
    
    const transaction = newDb.transaction((activities: any[]) => {
      for (const activity of activities) {
        // Map original fields to new schema
        const mappedActivity = {
          external_id: activity.run_id?.toString(),
          source: 'migrated', // Mark as migrated data
          name: activity.name || 'Untitled Activity',
          type: mapActivityType(activity.type),
          start_date: activity.start_date,
          start_date_local: activity.start_date_local || activity.start_date,
          distance: activity.distance,
          moving_time: parseTimeToSeconds(activity.moving_time),
          elapsed_time: parseTimeToSeconds(activity.elapsed_time),
          average_speed: activity.average_speed,
          average_heartrate: activity.average_heartrate,
          location_country: activity.location_country,
          summary_polyline: activity.summary_polyline,
          raw_data: JSON.stringify(activity),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synced_at: new Date().toISOString(),
        };
        
        insertActivity.run(
          mappedActivity.external_id,
          mappedActivity.source,
          mappedActivity.name,
          mappedActivity.type,
          mappedActivity.start_date,
          mappedActivity.start_date_local,
          mappedActivity.distance,
          mappedActivity.moving_time,
          mappedActivity.elapsed_time,
          mappedActivity.average_speed,
          mappedActivity.average_heartrate,
          mappedActivity.location_country,
          mappedActivity.summary_polyline,
          mappedActivity.raw_data,
          mappedActivity.created_at,
          mappedActivity.updated_at,
          mappedActivity.synced_at
        );
      }
    });
    
    // Process in batches
    for (let i = 0; i < originalActivities.length; i += batchSize) {
      const batch = originalActivities.slice(i, i + batchSize);
      transaction(batch);
      migrated += batch.length;
      console.log(`Migrated ${migrated}/${originalActivities.length} activities`);
    }
    
    console.log('Data migration completed successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    originalDb.close();
  }
}

// Helper functions
function mapActivityType(originalType: string): string {
  const typeMap: Record<string, string> = {
    'Run': 'Run',
    'Walk': 'Walk',
    'Ride': 'Ride',
    'WeightTraining': 'WeightTraining',
    'Swim': 'Swim',
    'Hike': 'Hike',
    'Yoga': 'Yoga',
  };
  
  return typeMap[originalType] || 'Other';
}

function parseTimeToSeconds(timeString: string | number): number | null {
  if (typeof timeString === 'number') return timeString;
  if (!timeString) return null;
  
  // Handle different time formats from original database
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts.map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    }
  }
  
  // Try to parse as number
  const parsed = parseInt(timeString.toString());
  return isNaN(parsed) ? null : parsed;
}

// Export for use in API routes and scripts
export { Database };
export default getDatabase;
