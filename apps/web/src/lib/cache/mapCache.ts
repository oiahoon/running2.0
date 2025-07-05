import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

interface MapCacheEntry {
  activityId: number
  url: string
  filePath: string
  createdAt: Date
  expiresAt: Date
}

const CACHE_DIR = path.join(process.cwd(), 'public', 'cache', 'maps')
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.access(CACHE_DIR)
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true })
  }
}

// Generate cache key from activity data
function generateCacheKey(activityId: number, polyline: string, width: number, height: number): string {
  const data = `${activityId}-${polyline}-${width}x${height}`
  return crypto.createHash('md5').update(data).digest('hex')
}

// Get cached map image path
export async function getCachedMapPath(
  activityId: number, 
  polyline: string, 
  width: number, 
  height: number
): Promise<string | null> {
  try {
    await ensureCacheDir()
    
    const cacheKey = generateCacheKey(activityId, polyline, width, height)
    const fileName = `${cacheKey}.png`
    const filePath = path.join(CACHE_DIR, fileName)
    
    // Check if file exists and is not expired
    try {
      const stats = await fs.stat(filePath)
      const isExpired = Date.now() - stats.mtime.getTime() > CACHE_DURATION
      
      if (!isExpired) {
        // Return public URL path
        return `/cache/maps/${fileName}`
      } else {
        // Remove expired file
        await fs.unlink(filePath)
      }
    } catch {
      // File doesn't exist
    }
    
    return null
  } catch (error) {
    console.error('Error checking cache:', error)
    return null
  }
}

// Cache map image from URL
export async function cacheMapImage(
  activityId: number,
  polyline: string,
  width: number,
  height: number,
  imageUrl: string
): Promise<string | null> {
  try {
    await ensureCacheDir()
    
    const cacheKey = generateCacheKey(activityId, polyline, width, height)
    const fileName = `${cacheKey}.png`
    const filePath = path.join(CACHE_DIR, fileName)
    
    // Download image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
    
    const buffer = await response.arrayBuffer()
    await fs.writeFile(filePath, Buffer.from(buffer))
    
    // Return public URL path
    return `/cache/maps/${fileName}`
  } catch (error) {
    console.error('Error caching map image:', error)
    return null
  }
}

// Clean expired cache files
export async function cleanExpiredCache(): Promise<void> {
  try {
    await ensureCacheDir()
    
    const files = await fs.readdir(CACHE_DIR)
    const now = Date.now()
    
    for (const file of files) {
      if (file.endsWith('.png')) {
        const filePath = path.join(CACHE_DIR, file)
        try {
          const stats = await fs.stat(filePath)
          const isExpired = now - stats.mtime.getTime() > CACHE_DURATION
          
          if (isExpired) {
            await fs.unlink(filePath)
            console.log(`Cleaned expired cache file: ${file}`)
          }
        } catch (error) {
          console.error(`Error checking file ${file}:`, error)
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning cache:', error)
  }
}

// Get cache statistics
export async function getCacheStats(): Promise<{
  totalFiles: number
  totalSize: number
  oldestFile: Date | null
  newestFile: Date | null
}> {
  try {
    await ensureCacheDir()
    
    const files = await fs.readdir(CACHE_DIR)
    let totalSize = 0
    let oldestFile: Date | null = null
    let newestFile: Date | null = null
    let totalFiles = 0
    
    for (const file of files) {
      if (file.endsWith('.png')) {
        const filePath = path.join(CACHE_DIR, file)
        try {
          const stats = await fs.stat(filePath)
          totalSize += stats.size
          totalFiles++
          
          if (!oldestFile || stats.mtime < oldestFile) {
            oldestFile = stats.mtime
          }
          if (!newestFile || stats.mtime > newestFile) {
            newestFile = stats.mtime
          }
        } catch (error) {
          console.error(`Error reading file stats for ${file}:`, error)
        }
      }
    }
    
    return {
      totalFiles,
      totalSize,
      oldestFile,
      newestFile
    }
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return {
      totalFiles: 0,
      totalSize: 0,
      oldestFile: null,
      newestFile: null
    }
  }
}
