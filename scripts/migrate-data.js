#!/usr/bin/env node

// Data migration script for Running Page 2.0
// Migrates data from original running_page database to new schema

const path = require('path');
const fs = require('fs');

// Import database functions
const { migrateFromOriginalDatabase } = require('../apps/web/src/lib/database/connection');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: node scripts/migrate-data.js <original-db-path>

Example:
  node scripts/migrate-data.js ~/Work/running_page/run_page/data.db
  
This script will:
1. Create a new database with the enhanced schema
2. Migrate all activities from the original database
3. Preserve all original data while adding new fields
4. Create a backup of the original data
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
    // Run the migration
    await migrateFromOriginalDatabase(originalDbPath);
    
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Visit http://localhost:3000 to see your migrated data');
    console.log('3. Set up Strava integration for new data sync');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('');
    console.error('Please check the error above and try again.');
    console.error('If the issue persists, please report it on GitHub.');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the migration
main();
