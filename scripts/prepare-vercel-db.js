#!/usr/bin/env node

/**
 * Prepare database for Vercel deployment
 * This script copies the database file to the public directory
 * so it can be accessed during the build process
 */

const fs = require('fs');
const path = require('path');

const sourceDb = path.join(__dirname, '../apps/web/data/running_page_2.db');
const targetDb = path.join(__dirname, '../apps/web/public/running_page_2.db');

// Ensure public directory exists
const publicDir = path.dirname(targetDb);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy database file
if (fs.existsSync(sourceDb)) {
  fs.copyFileSync(sourceDb, targetDb);
  console.log('✅ Database copied to public directory for Vercel deployment');
  console.log(`Source: ${sourceDb}`);
  console.log(`Target: ${targetDb}`);
} else {
  console.warn('⚠️  Source database not found:', sourceDb);
  console.log('Creating empty database for deployment...');
  
  // Create empty database file
  fs.writeFileSync(targetDb, '');
  console.log('✅ Empty database file created');
}
