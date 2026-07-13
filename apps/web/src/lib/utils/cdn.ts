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
  
  // Try preferred CDN first
  switch (preferCDN) {
    case 'jsdelivr':
      if (CDN_CONFIG.jsdelivr.enabled) {
        const url = `${CDN_CONFIG.jsdelivr.baseUrl}/${githubUser}/${repoName}@${branch}/${mapPath}`
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
    return cached.result
  }
  
  // Check if there's an ongoing request for this activity
  const ongoing = ongoingChecks.get(activityId)
  if (ongoing) {
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
async function urlExists(url: string, timeoutMs: number): Promise<boolean> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { method: 'HEAD', signal: controller.signal })
    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeoutId)
  }
}

async function performCdnCheck(activityId: string): Promise<{
  exists: boolean
  url: string
  source: 'cdn' | 'local'
}> {
  // In production, always try CDN first since Vercel local files are problematic
  const isProduction = process.env.NODE_ENV === 'production'
  const preferCDN = process.env.NEXT_PUBLIC_PREFER_CDN === 'true' || isProduction
  const preferLocal = process.env.NODE_ENV === 'development' && 
                     process.env.NEXT_PUBLIC_PREFER_LOCAL_MAPS === 'true'
  
  // Always try CDN first in production or when explicitly preferred
  if (preferCDN || isProduction) {
    const cdnUrl = getStaticMapUrl(activityId, { preferCDN: 'jsdelivr', fallbackToLocal: false })
    if (await urlExists(cdnUrl, 20000)) {
      return { exists: true, url: cdnUrl, source: 'cdn' }
    }

    // In CDN-first mode, still try local as fallback
    if (!preferLocal) {
      const localUrl = `/maps/${activityId}.png`
      if (await urlExists(localUrl, 3000)) {
        return { exists: true, url: localUrl, source: 'local' }
      }
    }

    // Neither CDN nor local worked
    return { exists: false, url: cdnUrl, source: 'cdn' }
  }

  // Development mode with local preference
  if (preferLocal) {
    const localUrl = `/maps/${activityId}.png`
    if (await urlExists(localUrl, 5000)) {
      return { exists: true, url: localUrl, source: 'local' }
    }

    // Fallback to CDN in development
    const cdnUrl = getStaticMapUrl(activityId, { preferCDN: 'jsdelivr', fallbackToLocal: false })
    if (await urlExists(cdnUrl, 15000)) {
      return { exists: true, url: cdnUrl, source: 'cdn' }
    }
    return { exists: false, url: localUrl, source: 'local' }
  }

  // Development defaults should still discover maps in public/maps without
  // requiring an environment override.
  const localUrl = `/maps/${activityId}.png`
  if (await urlExists(localUrl, 3000)) {
    return { exists: true, url: localUrl, source: 'local' }
  }

  return { exists: false, url: localUrl, source: 'local' }
}

/**
 * Preload static map images for better performance
 */
export function preloadStaticMaps(activityIds: string[], maxConcurrent = 3): Promise<void[]> {
  const preloadPromises = activityIds.slice(0, maxConcurrent).map(async (activityId) => {
    const mapUrl = getStaticMapUrl(activityId)
    
    return new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => resolve() // Don't fail the whole batch
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
