#!/usr/bin/env node

// Simple data migration script for Running Page 2.0
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: node scripts/migrate-data-simple.js <original-db-path>

Example:
  node scripts/migrate-data-simple.js ~/Work/running_page/run_page/data.db
    `);
    process.exit(1);
  }
  
  const originalDbPath = path.resolve(args[0]);
  
  // Check if original database exists
  if (!fs.existsSync(originalDbPath)) {
    console.error(`Error: Original database not found at ${originalDbPath}`);
    process.exit(1);
  }
  
  console.log('🚀 Starting Running Page 2.0 data migration...');
  console.log(`📂 Original database: ${originalDbPath}`);
  
  try {
    // Create new database
    const newDbPath = path.join(__dirname, '../apps/web/data/running_page_2.db');
    const dataDir = path.dirname(newDbPath);
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Read schema
    const schemaPath = path.join(__dirname, '../apps/web/src/lib/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Initialize new database
    const newDb = new Database(newDbPath);
    newDb.pragma('foreign_keys = ON');
    newDb.pragma('journal_mode = WAL');
    newDb.exec(schema);
    
    console.log('✅ New database initialized');
    
    // Open original database
    const originalDb = new Database(originalDbPath, { readonly: true });
    
    // Get all activities from original database
    const originalActivities = originalDb.prepare(`
      SELECT * FROM activities ORDER BY start_date
    `).all();
    
    console.log(`📊 Found ${originalActivities.length} activities to migrate`);
    
    // Prepare insert statement for new database
    const insertActivity = newDb.prepare(`
      INSERT INTO activities (
        external_id, source, name, type, start_date, start_date_local,
        distance, moving_time, elapsed_time, average_speed, average_heartrate,
        location_country, summary_polyline, raw_data, created_at, updated_at, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Helper functions
    function mapActivityType(originalType) {
      const typeMap = {
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
    
    function parseTimeToSeconds(timeString) {
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
    
    // Migrate activities in batches
    const batchSize = 100;
    let migrated = 0;
    
    const transaction = newDb.transaction((activities) => {
      for (const activity of activities) {
        // Map original fields to new schema
        const now = new Date().toISOString();
        
        insertActivity.run(
          activity.run_id?.toString() || null,
          'migrated', // Mark as migrated data
          activity.name || 'Untitled Activity',
          mapActivityType(activity.type),
          activity.start_date,
          activity.start_date_local || activity.start_date,
          activity.distance,
          parseTimeToSeconds(activity.moving_time),
          parseTimeToSeconds(activity.elapsed_time),
          activity.average_speed,
          activity.average_heartrate,
          activity.location_country,
          activity.summary_polyline,
          JSON.stringify(activity),
          now,
          now,
          now
        );
      }
    });
    
    // Process in batches
    for (let i = 0; i < originalActivities.length; i += batchSize) {
      const batch = originalActivities.slice(i, i + batchSize);
      transaction(batch);
      migrated += batch.length;
      console.log(`📈 Migrated ${migrated}/${originalActivities.length} activities`);
    }
    
    // Close databases
    originalDb.close();
    newDb.close();
    
    console.log('✅ Migration completed successfully!');
    console.log(`📊 Migrated ${migrated} activities`);
    console.log(`💾 New database: ${newDbPath}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Visit http://localhost:3000 to see your migrated data');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
