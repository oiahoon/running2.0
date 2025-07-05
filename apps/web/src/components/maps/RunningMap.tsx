'use client'

import { useState, useEffect, useMemo } from 'react'
import { shouldShowOnMap, shouldShowTrack, getActivityConfig } from '@/lib/config/activities'
import ActivitySelector from '@/components/ActivitySelector'

interface Activity {
  id: number
  name: string
  type: string
  distance: number
  start_latitude?: number
  start_longitude?: number
  end_latitude?: number
  end_longitude?: number
  summary_polyline?: string
  start_date: string
  location_city?: string
  location_state?: string
  location_country?: string
}

interface RunningMapProps {
  activities: Activity[]
  height?: number
  showControls?: boolean
  defaultView?: 'overview' | 'single'
  showActivityInfo?: boolean // New prop to control activity info display
}

// Simple polyline decoder for basic route display
function decodePolyline(encoded: string): [number, number][] {
  if (!encoded) return []
  
  try {
    const poly = []
    let index = 0
    let lat = 0
    let lng = 0

    while (index < encoded.length) {
      let b, shift = 0, result = 0
      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
      lat += dlat

      shift = 0
      result = 0
      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
      lng += dlng

      poly.push([lat / 1e5, lng / 1e5] as [number, number])
    }
    return poly
  } catch (error) {
    console.warn('Failed to decode polyline:', error)
    return []
  }
}

import { getStaticMapUrl as getCDNMapUrl, checkStaticMapExists } from '@/lib/utils/cdn'

// Utility function to check if static map exists and create URL
async function getStaticMapUrl(activity: Activity, width: number, height: number): Promise<string | null> {
  // Use externalId for static map filename (Strava activity ID)
  const activityId = activity.externalId || activity.id
  
  try {
    // Check if static map exists (tries CDN first, then local)
    const mapCheck = await checkStaticMapExists(activityId.toString())
    
    if (mapCheck.exists) {
      console.log(`✅ Using ${mapCheck.source} map for activity ${activityId}:`, mapCheck.url)
      return mapCheck.url
    }
  } catch (error) {
    // Static map doesn't exist, will fallback to API
    console.log(`⚠️ Static map not found for activity ${activityId}, using Mapbox API`)
  }
  
  return null
}

// Utility function to create safe Mapbox URLs with caching
async function createCachedMapboxUrl(
  activities: Activity[], 
  bounds: { minLat: number, maxLat: number, minLng: number, maxLng: number },
  width: number,
  height: number,
  token: string
): Promise<string> {
  // For single activity, try static map first
  if (activities.length === 1) {
    const staticUrl = await getStaticMapUrl(activities[0], width, height)
    if (staticUrl) {
      return staticUrl
    }
  }
  
  // For single activity with polyline, try localStorage cache
  if (activities.length === 1 && activities[0].summaryPolyline) {
    const activity = activities[0]
    const activityId = activity.externalId || activity.id
    
    // Check cache first (client-side, we'll use a simpler approach)
    const cacheKey = `map-${activityId}-${width}x${height}`
    const cachedUrl = localStorage.getItem(cacheKey)
    
    if (cachedUrl && !cachedUrl.startsWith('/maps/')) { // Don't cache static map paths
      // Check if cached URL is still valid (not older than 1 day)
      const cacheTime = localStorage.getItem(`${cacheKey}-time`)
      if (cacheTime && Date.now() - parseInt(cacheTime) < 24 * 60 * 60 * 1000) {
        console.log(`📦 Using cached map URL for activity ${activityId}`)
        return cachedUrl
      }
    }
    
    // Generate new URL
    console.log(`🌐 Generating new Mapbox URL for activity ${activityId}`)
    const newUrl = createSafeMapboxUrl(activities, bounds, width, height, token)
    
    // Cache the URL (but don't cache static map paths)
    if (!newUrl.startsWith('/maps/')) {
      localStorage.setItem(cacheKey, newUrl)
      localStorage.setItem(`${cacheKey}-time`, Date.now().toString())
    }
    
    return newUrl
  }
  
  // For other cases, use regular URL generation
  console.log(`🗺️ Using regular Mapbox URL for ${activities.length} activities`)
  return createSafeMapboxUrl(activities, bounds, width, height, token)
}

function createSafeMapboxUrl(
  activities: Activity[], 
  bounds: { minLat: number, maxLat: number, minLng: number, maxLng: number },
  width: number,
  height: number,
  token: string
): string {
  const centerLat = (bounds.minLat + bounds.maxLat) / 2
  const centerLng = (bounds.minLng + bounds.maxLng) / 2
  
  // Calculate zoom
  const latDiff = bounds.maxLat - bounds.minLat
  const lngDiff = bounds.maxLng - bounds.minLng
  const maxDiff = Math.max(latDiff, lngDiff)
  
  let zoom = 10
  if (maxDiff < 0.01) zoom = 14
  else if (maxDiff < 0.05) zoom = 12
  else if (maxDiff < 0.1) zoom = 11
  else if (maxDiff < 0.5) zoom = 9
  else if (maxDiff < 1) zoom = 8
  else zoom = 7

  const baseUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/`
  const suffix = `/${centerLng},${centerLat},${zoom},0/${width}x${height}@2x?access_token=${token}`
  
  // Strategy 1: Single activity with full route
  if (activities.length === 1 && activities[0].summary_polyline) {
    const activity = activities[0]
    const polyline = `path-4+ff0000-1.0(${encodeURIComponent(activity.summary_polyline)})`
    const startMarker = `pin-s-s+ff0000(${activity.start_longitude},${activity.start_latitude})`
    const endMarker = activity.end_longitude && activity.end_latitude 
      ? `pin-s-f+00ff00(${activity.end_longitude},${activity.end_latitude})`
      : ''
    
    const overlays = [polyline, startMarker, endMarker].filter(Boolean).join(',')
    const url = `${baseUrl}${overlays}${suffix}`
    
    if (url.length < 2000) return url
  }
  
  // Strategy 2: Multiple activities - just show markers
  const markers = activities
    .filter(a => a.start_latitude && a.start_longitude)
    .slice(0, 10) // Limit markers
    .map(a => `pin-s+ff0000(${a.start_longitude},${a.start_latitude})`)
    .join(',')
  
  const markersUrl = `${baseUrl}${markers}${suffix}`
  if (markersUrl.length < 2000) return markersUrl
  
  // Strategy 3: Fallback to just center point
  const fallbackUrl = `${baseUrl}pin-l+ff0000(${centerLng},${centerLat})${suffix}`
  return fallbackUrl
}

// Calculate bounds for activities
function calculateBounds(activities: Activity[]): { 
  minLat: number, maxLat: number, minLng: number, maxLng: number 
} | null {
  const validActivities = activities.filter(a => 
    a.start_latitude && a.start_longitude
  )
  
  if (validActivities.length === 0) return null

  let minLat = validActivities[0].start_latitude!
  let maxLat = validActivities[0].start_latitude!
  let minLng = validActivities[0].start_longitude!
  let maxLng = validActivities[0].start_longitude!

  validActivities.forEach(activity => {
    if (activity.start_latitude && activity.start_longitude) {
      minLat = Math.min(minLat, activity.start_latitude)
      maxLat = Math.max(maxLat, activity.start_latitude)
      minLng = Math.min(minLng, activity.start_longitude)
      maxLng = Math.max(maxLng, activity.start_longitude)
    }
    
    if (activity.end_latitude && activity.end_longitude) {
      minLat = Math.min(minLat, activity.end_latitude)
      maxLat = Math.max(maxLat, activity.end_latitude)
      minLng = Math.min(minLng, activity.end_longitude)
      maxLng = Math.max(maxLng, activity.end_longitude)
    }

    // Include polyline points in bounds calculation
    if (activity.summary_polyline) {
      const points = decodePolyline(activity.summary_polyline)
      points.forEach(([lat, lng]) => {
        minLat = Math.min(minLat, lat)
        maxLat = Math.max(maxLat, lat)
        minLng = Math.min(minLng, lng)
        maxLng = Math.max(maxLng, lng)
      })
    }
  })

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

// Format location with smart truncation and better display
function formatLocation(activity: Activity): { short: string; full: string } {
  const parts = [
    activity.location_city,
    activity.location_state,
    activity.location_country
  ].filter(Boolean)
  
  if (parts.length === 0) return { short: '', full: '' }
  
  const fullLocation = parts.join(', ')
  
  // Create short version
  let shortLocation = ''
  if (activity.location_city && activity.location_country) {
    shortLocation = `${activity.locationCity}, ${activity.locationCountry}`
  } else if (activity.locationCity) {
    shortLocation = activity.locationCity
  } else if (activity.locationCountry) {
    shortLocation = activity.locationCountry
  } else {
    shortLocation = parts[0]
  }
  
  // If short version is still too long, truncate city name
  if (shortLocation.length > 25 && activity.locationCity) {
    const truncatedCity = activity.locationCity.length > 12 
      ? activity.locationCity.substring(0, 12) + '...'
      : activity.locationCity
    shortLocation = activity.locationCountry 
      ? `${truncatedCity}, ${activity.locationCountry}`
      : truncatedCity
  }
  
  return { short: shortLocation, full: fullLocation }
}

function MapboxMap({ activities, height, selectedActivity }: {
  activities: Activity[]
  height: number
  selectedActivity: Activity | null
}) {
  const hasMapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const [staticMapUrl, setStaticMapUrl] = useState<string>('')
  const [isLoadingMap, setIsLoadingMap] = useState(true)
  
  const displayActivities = selectedActivity 
    ? [selectedActivity] 
    : activities.filter(a => a.startLatitude && a.startLongitude)

  const bounds = useMemo(() => calculateBounds(displayActivities), [displayActivities])

  // Reset loading state when URL changes
  useEffect(() => {
    if (staticMapUrl) {
      setIsLoadingMap(true)
    }
  }, [staticMapUrl])

  // Generate map URL
  useEffect(() => {
    if (!hasMapboxToken || !bounds || displayActivities.length === 0) {
      setIsLoadingMap(false)
      return
    }

    const generateUrl = async () => {
      setIsLoadingMap(true)
      try {
        const mapWidth = Math.min(600, height * 1.5)
        const url = await createCachedMapboxUrl(
          displayActivities,
          bounds,
          mapWidth,
          height,
          hasMapboxToken
        )
        setStaticMapUrl(url)
        // Don't set loading to false here - let the image onLoad/onError handle it
      } catch (error) {
        console.error('Error generating map URL:', error)
        setIsLoadingMap(false) // Only set to false on error
      }
    }

    generateUrl()
  }, [displayActivities, bounds, height, hasMapboxToken])

  if (!hasMapboxToken) {
    return (
      <div 
        className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden"
        style={{ height }}
      >
        <div className="h-full flex flex-col">
          <div className="bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Activity Routes
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {displayActivities.length} activities
              </span>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🗺️</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Interactive map requires Mapbox token
              </p>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {displayActivities.slice(0, 10).map((activity) => {
                const location = formatLocation(activity)
                return (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-sm transition-shadow">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {activity.type}
                        </span>
                        <span>{(activity.distance / 1000).toFixed(1)}km</span>
                      </div>
                      {location.short && (
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-400 dark:text-gray-500 truncate" title={location.full}>
                            📍 {location.short}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 text-right flex-shrink-0">
                      <div className="font-mono">{activity.start_latitude?.toFixed(3)}</div>
                      <div className="font-mono">{activity.start_longitude?.toFixed(3)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>To enable route visualization:</strong><br/>
                1. Get a free Mapbox token at mapbox.com<br/>
                2. Add NEXT_PUBLIC_MAPBOX_TOKEN to your environment
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!bounds) {
    return (
      <div 
        className="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600"
        style={{ height }}
      >
        <div className="text-center p-8">
          <div className="text-4xl mb-4">📍</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Location Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Activities don't have GPS coordinates to display routes
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden relative"
      style={{ height }}
    >
      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          URL: {staticMapUrl.substring(0, 50)}...
          <br />
          Loading: {isLoadingMap ? 'Yes' : 'No'}
          <br />
          Activities: {displayActivities.length}
          <br />
          Static: {staticMapUrl.startsWith('/maps/') ? 'Yes' : 'No'}
        </div>
      )}
      
      {isLoadingMap ? (
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : staticMapUrl ? (
        <img 
          src={staticMapUrl}
          alt="Activity route map"
          className="w-full h-full object-cover"
          onLoad={() => {
            console.log('✅ Map image loaded successfully:', staticMapUrl)
            setIsLoadingMap(false)
          }}
          onError={(e) => {
            console.error('❌ Map loading failed:', staticMapUrl)
            setIsLoadingMap(false)
            e.currentTarget.style.display = 'none'
            const fallback = e.currentTarget.nextElementSibling as HTMLElement
            if (fallback) fallback.classList.remove('hidden')
          }}
        />
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Map Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Unable to generate map for this activity
            </p>
          </div>
        </div>
      )}
      
      <div className="hidden h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Map Loading Failed
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Unable to load map with current route
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Check your Mapbox token configuration
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RunningMap({ 
  activities = [], 
  height = 400, 
  showControls = true,
  defaultView = 'single',
  showActivityInfo = true // Default to true for backward compatibility
}: RunningMapProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  // Filter activities that should show on map (Run, Walk, Hike, Ride)
  const mapEnabledActivities = activities.filter(activity => 
    shouldShowOnMap(activity.type) && activity.startLatitude && activity.startLongitude
  )

  // Auto-select first activity (latest) when activities change
  useEffect(() => {
    if (!selectedActivity && mapEnabledActivities.length > 0) {
      setSelectedActivity(mapEnabledActivities[0])
    }
  }, [mapEnabledActivities, selectedActivity])

  // If no activities with GPS data, show placeholder
  if (mapEnabledActivities.length === 0) {
    return (
      <div 
        className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No GPS Activities
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Activities with GPS data will show here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      {showControls && mapEnabledActivities.length > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <ActivitySelector
              selectedActivity={selectedActivity}
              onActivitySelect={setSelectedActivity}
              className="min-w-64"
            />
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedActivity 
              ? `Route: ${selectedActivity.name}`
              : 'No route selected'
            }
          </div>
        </div>
      )}

      {/* Map */}
      <MapboxMap 
        activities={selectedActivity ? [selectedActivity] : []}
        height={height}
        selectedActivity={selectedActivity}
      />
      
      {/* Activity Info for Single View */}
      {showActivityInfo && selectedActivity && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            📍 {selectedActivity.name}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Type:</span> 
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {selectedActivity.type}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Distance:</span> 
              <span className="ml-2 font-medium">{(selectedActivity.distance / 1000).toFixed(2)}km</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Coordinates:</span> 
              <span className="ml-2 font-mono text-xs">
                {selectedActivity.start_latitude?.toFixed(4)}, {selectedActivity.start_longitude?.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Date:</span> 
              <span className="ml-2 font-medium">{new Date(selectedActivity.start_date).toLocaleDateString()}</span>
            </div>
            {(() => {
              const location = formatLocation(selectedActivity)
              return location.short ? (
                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Location:</span> 
                  <span className="ml-2 font-medium" title={location.full}>
                    📍 {location.short}
                  </span>
                </div>
              ) : null
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
