#!/usr/bin/env node
/**
 * Manual script to generate static maps for testing
 * Usage: node generate-maps-manual.js [activity_id]
 */

const fs = require('fs').promises
const path = require('path')
const https = require('https')

// Load environment variables from .env.local
async function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '../apps/web/.env.local')
    const envContent = await fs.readFile(envPath, 'utf8')
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '')
          process.env[key] = value
        }
      }
    })
  } catch (error) {
    console.log('⚠️  Could not load .env.local file')
  }
}

const DATA_DIR = path.join(__dirname, '../apps/web/data')
const MAPS_DIR = path.join(__dirname, '../apps/web/public/maps')

async function ensureDirectories() {
  try {
    await fs.access(MAPS_DIR)
  } catch {
    await fs.mkdir(MAPS_DIR, { recursive: true })
  }
}

async function loadActivities() {
  const activitiesFile = path.join(DATA_DIR, 'strava_activities.json')
  const data = await fs.readFile(activitiesFile, 'utf8')
  return JSON.parse(data)
}

function hasGpsData(activity) {
  return (
    activity.start_latlng && 
    activity.start_latlng.length === 2 &&
    activity.map && 
    activity.map.summary_polyline
  )
}

function decodePolyline(encoded) {
  if (!encoded) return []
  
  const points = []
  let index = 0
  let lat = 0
  let lng = 0
  
  while (index < encoded.length) {
    // Decode latitude
    let b = 0
    let shift = 0
    let result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
    lat += dlat
    
    // Decode longitude
    shift = 0
    result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
    lng += dlng
    
    points.push([lat / 1e5, lng / 1e5])
  }
  
  return points
}

function calculateBounds(points) {
  if (!points.length) return null
  
  const lats = points.map(p => p[0])
  const lngs = points.map(p => p[1])
  
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  
  // Add padding
  const latPadding = (maxLat - minLat) * 0.1
  const lngPadding = (maxLng - minLng) * 0.1
  
  return {
    minLat: minLat - latPadding,
    maxLat: maxLat + latPadding,
    minLng: minLng - lngPadding,
    maxLng: maxLng + lngPadding
  }
}

function calculateZoom(bounds) {
  const latDiff = bounds.maxLat - bounds.minLat
  const lngDiff = bounds.maxLng - bounds.minLng
  const maxDiff = Math.max(latDiff, lngDiff)
  
  if (maxDiff < 0.01) return 14
  else if (maxDiff < 0.05) return 12
  else if (maxDiff < 0.1) return 11
  else if (maxDiff < 0.5) return 9
  else if (maxDiff < 1) return 8
  else return 7
}

function generateMapUrl(activity, width = 400, height = 300) {
  const polyline = activity.map.summary_polyline
  if (!polyline) return null
  
  const [startLat, startLng] = activity.start_latlng
  const endLatlng = activity.end_latlng
  
  // Decode polyline for bounds calculation
  const points = decodePolyline(polyline)
  const bounds = calculateBounds(points)
  
  if (!bounds) return null
  
  const centerLat = (bounds.minLat + bounds.maxLat) / 2
  const centerLng = (bounds.minLng + bounds.maxLng) / 2
  const zoom = calculateZoom(bounds)
  
  // Build URL components
  const baseUrl = "https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/"
  
  // Polyline overlay
  const polylineOverlay = `path-4+ff0000-1.0(${encodeURIComponent(polyline)})`
  
  // Start marker
  const startMarker = `pin-s-s+ff0000(${startLng},${startLat})`
  
  // End marker (if different from start)
  let endMarker = ""
  if (endLatlng && endLatlng.length === 2) {
    const [endLat, endLng] = endLatlng
    if (Math.abs(endLat - startLat) > 0.001 || Math.abs(endLng - startLng) > 0.001) {
      endMarker = `pin-s-f+00ff00(${endLng},${endLat})`
    }
  }
  
  // Combine overlays
  const overlays = [polylineOverlay, startMarker]
  if (endMarker) overlays.push(endMarker)
  
  const overlaysStr = overlays.join(',')
  
  // Final URL
  const url = `${baseUrl}${overlaysStr}/${centerLng},${centerLat},${zoom},0/${width}x${height}@2x?access_token=${MAPBOX_TOKEN}`
  
  return url.length < 2000 ? url : null
}

function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = require('fs').createWriteStream(filePath)
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        resolve()
      })
      
      file.on('error', (err) => {
        fs.unlink(filePath).catch(() => {}) // Clean up on error
        reject(err)
      })
    }).on('error', reject)
  })
}

async function generateMap(activity) {
  if (!MAPBOX_TOKEN) {
    console.log('❌ No MAPBOX_TOKEN found in environment')
    return false
  }
  
  const mapFile = path.join(MAPS_DIR, `${activity.id}.png`)
  
  // Check if map already exists
  try {
    await fs.access(mapFile)
    console.log(`⏭️  Map for activity ${activity.id} already exists`)
    return true
  } catch {
    // File doesn't exist, continue
  }
  
  // Generate map URL
  const mapUrl = generateMapUrl(activity)
  if (!mapUrl) {
    console.log(`⚠️  Could not generate URL for activity ${activity.id}`)
    return false
  }
  
  try {
    console.log(`📥 Generating map for activity ${activity.id}...`)
    await downloadImage(mapUrl, mapFile)
    console.log(`✅ Generated: ${path.basename(mapFile)}`)
    return true
  } catch (error) {
    console.log(`❌ Error generating map for activity ${activity.id}:`, error.message)
    return false
  }
}

async function main() {
  const targetActivityId = process.argv[2]
  
  try {
    await ensureDirectories()
    const activities = await loadActivities()
    
    let targetActivities = activities.filter(hasGpsData)
    
    if (targetActivityId) {
      targetActivities = targetActivities.filter(a => a.id.toString() === targetActivityId)
      if (targetActivities.length === 0) {
        console.log(`❌ Activity ${targetActivityId} not found or has no GPS data`)
        return
      }
    }
    
    console.log(`🗺️  Found ${targetActivities.length} activities with GPS data`)
    
    let generated = 0
    let skipped = 0
    let errors = 0
    
    for (const activity of targetActivities) {
      const success = await generateMap(activity)
      if (success) {
        generated++
      } else {
        errors++
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log(`\n📊 Generation Summary:`)
    console.log(`✅ Generated: ${generated}`)
    console.log(`❌ Errors: ${errors}`)
    
    // List all map files
    const mapFiles = await fs.readdir(MAPS_DIR)
    const pngFiles = mapFiles.filter(f => f.endsWith('.png'))
    console.log(`📁 Total map files: ${pngFiles.length}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

if (require.main === module) {
  main()
}
