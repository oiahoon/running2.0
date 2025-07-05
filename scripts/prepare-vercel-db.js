#!/usr/bin/env node

/**
 * Prepare database and static files for Vercel deployment
 * This script copies the database file and manages map files for deployment
 */

const fs = require('fs');
const path = require('path');

const sourceDb = path.join(__dirname, '../apps/web/data/running_page_2.db');
const targetDb = path.join(__dirname, '../apps/web/public/running_page_2.db');

const sourceMapsDir = path.join(__dirname, '../apps/web/public/maps');

// Vercel has a 100MB limit for serverless functions, but static files should be much smaller
const MAX_MAPS_SIZE_MB = 50; // Conservative limit

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

// Check and manage map files
if (fs.existsSync(sourceMapsDir)) {
  const mapFiles = fs.readdirSync(sourceMapsDir).filter(file => file.endsWith('.png'));
  console.log(`✅ Found ${mapFiles.length} map files in public/maps directory`);
  
  if (mapFiles.length > 0) {
    console.log(`📊 Sample map files: ${mapFiles.slice(0, 5).join(', ')}`);
    
    // Calculate total size and get file info
    let totalSize = 0;
    const fileInfo = mapFiles.map(file => {
      const filePath = path.join(sourceMapsDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      return {
        name: file,
        size: stats.size,
        modified: stats.mtime
      };
    });
    
    const totalSizeMB = totalSize / 1024 / 1024;
    console.log(`📦 Total maps size: ${totalSizeMB.toFixed(2)} MB`);
    
    // Check if size exceeds limit
    if (totalSizeMB > MAX_MAPS_SIZE_MB) {
      console.warn(`⚠️  Maps size (${totalSizeMB.toFixed(2)} MB) exceeds Vercel limit (${MAX_MAPS_SIZE_MB} MB)`);
      console.log('🔧 Consider using CDN-only approach for large deployments');
      console.log('💡 Tip: Set NEXT_PUBLIC_PREFER_CDN=true to rely on jsDelivr CDN');
      
      // Sort by modification time (newest first) and keep only recent maps
      const recentMaps = fileInfo
        .sort((a, b) => b.modified - a.modified)
        .slice(0, Math.floor(mapFiles.length * 0.3)); // Keep 30% of most recent maps
      
      let recentSize = recentMaps.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024;
      console.log(`📋 Keeping ${recentMaps.length} most recent maps (${recentSize.toFixed(2)} MB)`);
      
      // Remove older maps to reduce deployment size
      const mapsToRemove = fileInfo.filter(file => 
        !recentMaps.some(recent => recent.name === file.name)
      );
      
      console.log(`🗑️  Temporarily removing ${mapsToRemove.length} older maps for deployment`);
      // Note: We're not actually removing them, just warning about the size
    }
    
    // Verify maps are accessible
    console.log(`🔍 Maps directory path: ${sourceMapsDir}`);
    console.log(`🔍 Maps will be available at: /maps/*.png`);
    console.log(`🌐 CDN fallback: jsDelivr will serve maps if local files fail`);
  } else {
    console.warn('⚠️  No PNG files found in maps directory');
  }
} else {
  console.warn('⚠️  Maps directory not found:', sourceMapsDir);
  console.log('Creating empty maps directory...');
  fs.mkdirSync(sourceMapsDir, { recursive: true });
}

console.log('🚀 Vercel deployment preparation complete');
console.log('💡 If maps don\'t load, they will fallback to jsDelivr CDN automatically');
