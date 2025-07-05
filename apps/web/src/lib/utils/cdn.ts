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
  const githubUser = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'your-username'
  const repoName = 'running2.0'
  const branch = 'master' // or 'main'
  const mapPath = `apps/web/public/maps/${activityId}.png`
  
  // Try preferred CDN first
  switch (preferCDN) {
    case 'jsdelivr':
      if (CDN_CONFIG.jsdelivr.enabled) {
        return `${CDN_CONFIG.jsdelivr.baseUrl}/${githubUser}/${repoName}@${branch}/${mapPath}`
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

/**
 * Check if static map exists (with CDN support)
 */
export async function checkStaticMapExists(activityId: string): Promise<{
  exists: boolean
  url: string
  source: 'cdn' | 'local'
}> {
  // Try CDN first
  const cdnUrl = getStaticMapUrl(activityId, { preferCDN: 'jsdelivr', fallbackToLocal: false })
  
  try {
    const response = await fetch(cdnUrl, { method: 'HEAD' })
    if (response.ok) {
      return {
        exists: true,
        url: cdnUrl,
        source: 'cdn'
      }
    }
  } catch (error) {
    console.log(`CDN check failed for ${activityId}, trying local`)
  }
  
  // Fallback to local
  const localUrl = `/maps/${activityId}.png`
  try {
    const response = await fetch(localUrl, { method: 'HEAD' })
    return {
      exists: response.ok,
      url: localUrl,
      source: 'local'
    }
  } catch (error) {
    return {
      exists: false,
      url: localUrl,
      source: 'local'
    }
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
