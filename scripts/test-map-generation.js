#!/usr/bin/env node
/**
 * Test script to generate a few static maps
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

async function testMapGeneration() {
  await loadEnvFile()
  
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  
  if (!MAPBOX_TOKEN) {
    console.log('❌ No MAPBOX_TOKEN found')
    console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('MAPBOX')))
    return
  }
  
  console.log('✅ MAPBOX_TOKEN found:', MAPBOX_TOKEN.substring(0, 20) + '...')
  
  // Create maps directory
  const mapsDir = path.join(__dirname, '../apps/web/public/maps')
  try {
    await fs.access(mapsDir)
  } catch {
    await fs.mkdir(mapsDir, { recursive: true })
    console.log('📁 Created maps directory')
  }
  
  // Test URL generation
  const testUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-l+ff0000(104.18,30.65)/104.18,30.65,12,0/400x300@2x?access_token=${MAPBOX_TOKEN}`
  
  console.log('🧪 Testing with simple map URL...')
  
  try {
    const testFile = path.join(mapsDir, 'test-map.png')
    await downloadImage(testUrl, testFile)
    console.log('✅ Test map generated successfully!')
    
    // Check file size
    const stats = await fs.stat(testFile)
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(1)} KB`)
    
  } catch (error) {
    console.log('❌ Test failed:', error.message)
  }
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
        fs.unlink(filePath).catch(() => {})
        reject(err)
      })
    }).on('error', reject)
  })
}

if (require.main === module) {
  testMapGeneration()
}
