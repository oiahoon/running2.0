// Database connection and management for Running Page 2.0
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database configuration
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

// Database path configuration
let DB_PATH: string;
if (isVercel) {
  // On Vercel, use /tmp directory for SQLite (note: data will be lost on each deployment)
  DB_PATH = '/tmp/running_page_2.db';
} else if (isProduction) {
  // Other production environments
  DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'running_page_2.db');
} else {
  // Development environment
  DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'running_page_2.db');
}

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
    let schema: string;
    try {
      schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    } catch (error) {
      // Fallback schema for production environments where file system access might be limited
      console.log('Using fallback schema...');
      schema = getFallbackSchema();
    }
    
    database.exec(schema);
    console.log('Database initialized successfully');
    
    // In production, we might want to seed with some sample data
    if (isVercel && process.env.SEED_SAMPLE_DATA === 'true') {
      seedSampleData(database);
    }
  }
}

// Fallback schema for environments where file system access is limited
function getFallbackSchema(): string {
  return `
    -- Users table for multi-user support (future)
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE,
        name VARCHAR(255),
        timezone VARCHAR(50) DEFAULT 'UTC',
        preferences JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Activities table (enhanced from original)
    CREATE TABLE activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        external_id VARCHAR(255),
        user_id INTEGER DEFAULT 1,
        source VARCHAR(50) NOT NULL,
        
        -- Basic activity info
        name VARCHAR(255),
        description TEXT,
        type VARCHAR(50) NOT NULL,
        sport_type VARCHAR(50),
        
        -- Time and date
        start_date DATETIME NOT NULL,
        start_date_local DATETIME NOT NULL,
        timezone VARCHAR(50),
        
        -- Distance and duration
        distance REAL,
        moving_time INTEGER,
        elapsed_time INTEGER,
        total_elevation_gain REAL,
        
        -- Performance metrics
        average_speed REAL,
        max_speed REAL,
        average_pace REAL,
        best_pace REAL,
        
        -- Heart rate data
        average_heartrate REAL,
        max_heartrate REAL,
        heartrate_zones JSON,
        
        -- Location data
        start_latitude REAL,
        start_longitude REAL,
        end_latitude REAL,
        end_longitude REAL,
        location_city VARCHAR(255),
        location_state VARCHAR(255),
        location_country VARCHAR(255),
        
        -- Route data
        summary_polyline TEXT,
        detailed_polyline TEXT,
        map_id VARCHAR(255),
        
        -- Additional metrics
        calories REAL,
        average_cadence REAL,
        average_power REAL,
        weighted_average_power REAL,
        training_stress_score REAL,
        
        -- Weather data (if available)
        weather JSON,
        
        -- Privacy and sharing
        visibility VARCHAR(20) DEFAULT 'private',
        privacy_zones JSON,
        
        -- Metadata
        gear_id VARCHAR(255),
        device_name VARCHAR(255),
        raw_data JSON,
        
        -- Timestamps
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Constraints
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(external_id, source)
    );

    -- Sync logs for tracking data synchronization
    CREATE TABLE sync_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER DEFAULT 1,
        source VARCHAR(50) NOT NULL,
        sync_type VARCHAR(50),
        
        -- Sync results
        status VARCHAR(20) NOT NULL,
        activities_processed INTEGER DEFAULT 0,
        activities_created INTEGER DEFAULT 0,
        activities_updated INTEGER DEFAULT 0,
        activities_skipped INTEGER DEFAULT 0,
        
        -- Error handling
        error_message TEXT,
        error_details JSON,
        
        -- Timing
        started_at DATETIME NOT NULL,
        completed_at DATETIME,
        duration_seconds INTEGER,
        
        -- Metadata
        sync_params JSON,
        api_calls_made INTEGER DEFAULT 0,
        rate_limit_remaining INTEGER,
        
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- User settings for data sources
    CREATE TABLE data_source_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER DEFAULT 1,
        source VARCHAR(50) NOT NULL,
        
        -- Authentication
        access_token TEXT,
        refresh_token TEXT,
        token_expires_at DATETIME,
        
        -- Sync preferences
        auto_sync BOOLEAN DEFAULT true,
        sync_frequency VARCHAR(20) DEFAULT 'daily',
        last_sync_at DATETIME,
        
        -- Data preferences
        activity_types JSON,
        privacy_settings JSON,
        
        -- Status
        is_active BOOLEAN DEFAULT true,
        connection_status VARCHAR(20) DEFAULT 'connected',
        
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, source)
    );

    -- Indexes for performance
    CREATE INDEX idx_activities_user_date ON activities(user_id, start_date DESC);
    CREATE INDEX idx_activities_type ON activities(type);
    CREATE INDEX idx_activities_source ON activities(source);
    CREATE INDEX idx_activities_external_id ON activities(external_id, source);
    CREATE INDEX idx_sync_logs_user_source ON sync_logs(user_id, source);
    CREATE INDEX idx_sync_logs_date ON sync_logs(started_at DESC);

    -- Insert default user for single-user setup
    INSERT INTO users (id, email, name, timezone) 
    VALUES (1, 'user@example.com', 'Runner', 'UTC');
  `;
}

// Seed sample data for demo purposes
function seedSampleData(database: Database.Database) {
  console.log('Seeding sample data...');
  
  const sampleActivities = [
    {
      name: 'Morning Run',
      type: 'Run',
      distance: 5000,
      moving_time: 1800,
      start_date: new Date(Date.now() - 86400000).toISOString(),
      source: 'demo'
    },
    {
      name: 'Evening Walk',
      type: 'Walk', 
      distance: 3000,
      moving_time: 2400,
      start_date: new Date(Date.now() - 172800000).toISOString(),
      source: 'demo'
    }
  ];

  const insertActivity = database.prepare(`
    INSERT INTO activities (
      name, type, distance, moving_time, start_date, start_date_local,
      source, created_at, updated_at, synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  
  for (const activity of sampleActivities) {
    insertActivity.run(
      activity.name,
      activity.type,
      activity.distance,
      activity.moving_time,
      activity.start_date,
      activity.start_date,
      activity.source,
      now,
      now,
      now
    );
  }
  
  console.log(`Seeded ${sampleActivities.length} sample activities`);
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
