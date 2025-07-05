/**
 * CDN utilities for optimizing static asset delivery
 */

// CDN configuration
const CDN_CONFIG = {
  // jsDelivr CDN for GitHub files (free, global CDN)
  jsdelivr: {
    enabled: true,
    baseUrl: 'https://cdn.jsdelivr.net/gh',
    // Format: https://cdn.jsdelivr.net/gh/user/repo@branch/path
  },
  
  // Cloudflare R2 (if configured)
  cloudflare: {
    enabled: false,
    baseUrl: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL || '',
  },
  
  // Vercel with optimized caching
  vercel: {
    enabled: true,
    baseUrl: '', // Use relative URLs for Vercel
  }
}

/**
 * Get the optimal CDN URL for static map images
 */
export function getStaticMapUrl(activityId: string, options: {
  fallbackToLocal?: boolean
  preferCDN?: 'jsdelivr' | 'cloudflare' | 'vercel'
} = {}): string {
  const { fallbackToLocal = true, preferCDN = 'jsdelivr' } = options
  
  // GitHub repository info (get from environment or config)
  const githubUser = (typeof window !== 'undefined' 
    ? window.location.hostname.includes('run2.miaowu.org') ? 'oiahoon' : 'your-username'
    : process.env.NEXT_PUBLIC_GITHUB_USERNAME) || 'oiahoon'
  const repoName = 'running2.0'
  const branch = 'master'
  const mapPath = `apps/web/public/maps/${activityId}.png`
  
  console.log(`🔧 CDN Config - User: ${githubUser}, Prefer: ${preferCDN}`)
  
  // Try preferred CDN first
  switch (preferCDN) {
    case 'jsdelivr':
      if (CDN_CONFIG.jsdelivr.enabled) {
        const url = `${CDN_CONFIG.jsdelivr.baseUrl}/${githubUser}/${repoName}@${branch}/${mapPath}`
        console.log(`🌐 Generated jsDelivr URL: ${url}`)
        return url
      }
      break
      
    case 'cloudflare':
      if (CDN_CONFIG.cloudflare.enabled && CDN_CONFIG.cloudflare.baseUrl) {
        return `${CDN_CONFIG.cloudflare.baseUrl}/maps/${activityId}.png`
      }
      break
      
    case 'vercel':
      // Use Vercel's CDN with optimized caching
      return `/maps/${activityId}.png`
  }
  
  // Fallback to local/Vercel if CDN not available
  if (fallbackToLocal) {
    return `/maps/${activityId}.png`
  }
  
  throw new Error(`No CDN available for activity ${activityId}`)
}

// Cache for CDN check results to avoid repeated requests
const cdnCheckCache = new Map<string, {
  result: { exists: boolean; url: string; source: 'cdn' | 'local' }
  timestamp: number
}>()

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

// Ongoing requests to prevent duplicate checks
const ongoingChecks = new Map<string, Promise<{ exists: boolean; url: string; source: 'cdn' | 'local' }>>()

/**
 * Check if static map exists (with CDN support and caching)
 */
export async function checkStaticMapExists(activityId: string): Promise<{
  exists: boolean
  url: string
  source: 'cdn' | 'local'
}> {
  // Check cache first
  const cached = cdnCheckCache.get(activityId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 Using cached CDN check for activity ${activityId}`)
    return cached.result
  }
  
  // Check if there's an ongoing request for this activity
  const ongoing = ongoingChecks.get(activityId)
  if (ongoing) {
    console.log(`⏳ Waiting for ongoing CDN check for activity ${activityId}`)
    return ongoing
  }
  
  // Create new check promise
  const checkPromise = performCdnCheck(activityId)
  ongoingChecks.set(activityId, checkPromise)
  
  try {
    const result = await checkPromise
    
    // Cache the result
    cdnCheckCache.set(activityId, {
      result,
      timestamp: Date.now()
    })
    
    return result
  } finally {
    // Clean up ongoing request
    ongoingChecks.delete(activityId)
  }
}

/**
 * Perform the actual CDN check
 */
async function performCdnCheck(activityId: string): Promise<{
  exists: boolean
  url: string
  source: 'cdn' | 'local'
}> {
  // For debugging: prefer local files first if we're in development or if CDN is having issues
  const preferLocal = process.env.NODE_ENV === 'development' || 
                     process.env.NEXT_PUBLIC_PREFER_LOCAL_MAPS === 'true'
  
  if (preferLocal) {
    console.log(`🏠 Preferring local files for debugging`)
    
    // Try local first
    const localUrl = `/maps/${activityId}.png`
    console.log(`🏠 Testing local URL: ${localUrl}`)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(localUrl, { 
        method: 'HEAD',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log(`🏠 Local response: ${response.status} ${response.statusText}`)
      
      if (response.ok) {
        return {
          exists: true,
          url: localUrl,
          source: 'local'
        }
      }
    } catch (error) {
      console.log(`❌ Local check failed for ${activityId}:`, error.message)
    }
  }
  
  // Try CDN
  const cdnUrl = getStaticMapUrl(activityId, { preferCDN: 'jsdelivr', fallbackToLocal: false })
  
  console.log(`🧪 Testing CDN URL: ${cdnUrl}`)
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // Increased to 10 seconds
    
    const response = await fetch(cdnUrl, { 
      method: 'HEAD',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    console.log(`📡 CDN response: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      return {
        exists: true,
        url: cdnUrl,
        source: 'cdn'
      }
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.log(`❌ CDN check failed for ${activityId}:`, error.message)
    } else {
      console.log(`⏰ CDN check timeout for ${activityId}`)
    }
  }
  
  // Fallback to local if not already tried
  if (!preferLocal) {
    const localUrl = `/maps/${activityId}.png`
    console.log(`🏠 Testing local URL: ${localUrl}`)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout for local
      
      const response = await fetch(localUrl, { 
        method: 'HEAD',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log(`🏠 Local response: ${response.status} ${response.statusText}`)
      
      return {
        exists: response.ok,
        url: localUrl,
        source: 'local'
      }
    } catch (error) {
      console.log(`❌ Local check failed for ${activityId}:`, error.message)
    }
  }
  
  return {
    exists: false,
    url: `/maps/${activityId}.png`,
    source: 'local'
  }
}

/**
 * Preload static map images for better performance
 */
export function preloadStaticMaps(activityIds: string[], maxConcurrent = 3): Promise<void[]> {
  const preloadPromises = activityIds.slice(0, maxConcurrent).map(async (activityId) => {
    const mapUrl = getStaticMapUrl(activityId)
    
    return new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => {
        console.log(`✅ Preloaded map for activity ${activityId}`)
        resolve()
      }
      img.onerror = () => {
        console.log(`⚠️ Failed to preload map for activity ${activityId}`)
        resolve() // Don't fail the whole batch
      }
      img.src = mapUrl
    })
  })
  
  return Promise.all(preloadPromises)
}

/**
 * Get cache statistics for monitoring
 */
export async function getCacheStats(): Promise<{
  totalMaps: number
  cdnHits: number
  localHits: number
  hitRate: number
}> {
  // This would be implemented with actual usage tracking
  // For now, return mock data
  return {
    totalMaps: 0,
    cdnHits: 0,
    localHits: 0,
    hitRate: 0
  }
}

/**
 * Environment-specific CDN configuration
 */
export function getCDNConfig() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    // Use local files in development for faster iteration
    preferLocal: isDevelopment,
    
    // Use CDN in production for better performance
    preferCDN: isProduction,
    
    // CDN provider preference
    provider: (process.env.NEXT_PUBLIC_CDN_PROVIDER as 'jsdelivr' | 'cloudflare' | 'vercel') || 'jsdelivr',
    
    // Enable preloading in production
    enablePreloading: isProduction,
    
    // Cache settings
    cacheMaxAge: isProduction ? 31536000 : 3600, // 1 year in prod, 1 hour in dev
  }
}
