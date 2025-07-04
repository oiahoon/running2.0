'use client'

import { useState, useEffect, useMemo } from 'react'

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

      poly.push([lat / 1e5, lng / 1e5])
    }
    return poly
  } catch (error) {
    console.warn('Failed to decode polyline:', error)
    return []
  }
}

// Utility function to create safe Mapbox URLs that won't exceed limits
function createSafeMapboxUrl(
  activities: Activity[], 
  bounds: { minLat: number, maxLat: number, minLng: number, maxLng: number },
  width: number,
  height: number,
  mapType: 'overview' | 'single',
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
  
  // Strategy 1: Try with simplified polylines (single activity or limited activities)
  if (mapType === 'single' && activities.length === 1 && activities[0].summary_polyline) {
    const activity = activities[0]
    const polyline = `path-2+ff0000-0.8(${encodeURIComponent(activity.summary_polyline)})`
    const marker = `pin-s+ff0000(${activity.start_longitude},${activity.start_latitude})`
    const overlays = `${polyline},${marker}`
    const url = `${baseUrl}${overlays}${suffix}`
    
    if (url.length < 2000) return url
  }
  
  // Strategy 2: Try with just markers for multiple activities
  const markers = activities
    .filter(a => a.start_latitude && a.start_longitude)
    .slice(0, mapType === 'single' ? 1 : 8) // Limit markers
    .map(a => `pin-s+ff0000(${a.start_longitude},${a.start_latitude})`)
    .join(',')
  
  const markersUrl = `${baseUrl}${markers}${suffix}`
  if (markersUrl.length < 2000) return markersUrl
  
  // Strategy 3: Fallback to just center point
  const fallbackUrl = `${baseUrl}pin-l+ff0000(${centerLng},${centerLat})${suffix}`
  return fallbackUrl
}
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

      poly.push([lat / 1e5, lng / 1e5])
    }
    return poly
  } catch (error) {
    console.warn('Failed to decode polyline:', error)
    return []
  }
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
    shortLocation = `${activity.location_city}, ${activity.location_country}`
  } else if (activity.location_city) {
    shortLocation = activity.location_city
  } else if (activity.location_country) {
    shortLocation = activity.location_country
  } else {
    shortLocation = parts[0]
  }
  
  // If short version is still too long, truncate city name
  if (shortLocation.length > 25 && activity.location_city) {
    const truncatedCity = activity.location_city.length > 12 
      ? activity.location_city.substring(0, 12) + '...'
      : activity.location_city
    shortLocation = activity.location_country 
      ? `${truncatedCity}, ${activity.location_country}`
      : truncatedCity
  }
  
  return { short: shortLocation, full: fullLocation }
}

function MapboxMap({ activities, height, mapType, selectedActivity }: {
  activities: Activity[]
  height: number
  mapType: 'overview' | 'single'
  selectedActivity: Activity | null
}) {
  const hasMapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  
  const displayActivities = mapType === 'single' && selectedActivity 
    ? [selectedActivity] 
    : activities.filter(a => a.start_latitude && a.start_longitude)

  const bounds = useMemo(() => calculateBounds(displayActivities), [displayActivities])

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

  // Generate static map URL with routes - optimized to avoid 494 errors
  const centerLat = (bounds.minLat + bounds.maxLat) / 2
  const centerLng = (bounds.minLng + bounds.maxLng) / 2
  
  // Calculate zoom level based on bounds
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

  // Generate safe static map URL
  const mapWidth = Math.min(600, height * 1.5)
  const staticMapUrl = createSafeMapboxUrl(
    displayActivities,
    bounds,
    mapWidth,
    height,
    mapType,
    hasMapboxToken
  )

  return (
    <div 
      className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden"
      style={{ height }}
    >
      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          URL Length: {staticMapUrl.length}
          <br />
          Activities: {displayActivities.length}
          <br />
          Zoom: {Math.round(((bounds.maxLat + bounds.minLat) / 2) * 100) / 100}
        </div>
      )}
      
      <img 
        src={staticMapUrl}
        alt="Activity routes map"
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error('Map loading failed:', staticMapUrl)
          e.currentTarget.style.display = 'none'
          const fallback = e.currentTarget.nextElementSibling as HTMLElement
          if (fallback) fallback.classList.remove('hidden')
        }}
      />
      <div className="hidden h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Map Loading Failed
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Unable to load map with current routes
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Try selecting fewer activities or check your Mapbox token
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2 text-left">
              <summary className="cursor-pointer text-xs">Debug Info</summary>
              <pre className="text-xs mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto max-h-32">
                URL: {staticMapUrl.substring(0, 200)}...
                <br />
                Length: {staticMapUrl.length}
                <br />
                Activities: {displayActivities.length}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RunningMap({ 
  activities = [], 
  height = 400, 
  showControls = true,
  defaultView = 'overview'
}: RunningMapProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [mapType, setMapType] = useState<'overview' | 'single'>(defaultView)

  // Filter activities with location data
  const activitiesWithLocation = activities.filter(a => 
    a.start_latitude && a.start_longitude
  )

  // Auto-select first activity when switching to single mode
  useEffect(() => {
    if (mapType === 'single' && !selectedActivity && activitiesWithLocation.length > 0) {
      setSelectedActivity(activitiesWithLocation[0])
    }
  }, [mapType, selectedActivity, activitiesWithLocation])

  return (
    <div className="space-y-4">
      {/* Controls */}
      {showControls && activitiesWithLocation.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <select
              value={mapType}
              onChange={(e) => setMapType(e.target.value as 'overview' | 'single')}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="overview">Overview - All Routes</option>
              <option value="single">Single Activity</option>
            </select>
            
            {mapType === 'single' && (
              <select
                value={selectedActivity?.id || ''}
                onChange={(e) => {
                  const activity = activitiesWithLocation.find(a => a.id === parseInt(e.target.value))
                  setSelectedActivity(activity || null)
                }}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-w-48"
              >
                <option value="">Select Activity</option>
                {activitiesWithLocation.slice(0, 50).map(activity => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name} ({(activity.distance / 1000).toFixed(1)}km)
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {mapType === 'overview' 
              ? `${activitiesWithLocation.length} routes displayed`
              : selectedActivity 
                ? `Route: ${selectedActivity.name}`
                : 'No route selected'
            }
          </div>
        </div>
      )}

      {/* Map */}
      <MapboxMap 
        activities={activitiesWithLocation}
        height={height}
        mapType={mapType}
        selectedActivity={selectedActivity}
      />
      
      {/* Activity Info for Single View */}
      {mapType === 'single' && selectedActivity && (
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
