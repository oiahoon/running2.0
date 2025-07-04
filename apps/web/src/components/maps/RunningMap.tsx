'use client'

import { useState, useEffect } from 'react'

interface Activity {
  id: number
  name: string
  type: string
  distance: number
  start_latitude?: number
  start_longitude?: number
  summary_polyline?: string
  start_date: string
}

interface RunningMapProps {
  activities: Activity[]
  height?: number
  showControls?: boolean
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

function StaticMapFallback({ activities, height }: { activities: Activity[], height: number }) {
  const activitiesWithLocation = activities.filter(a => 
    a.start_latitude && a.start_longitude
  ).slice(0, 10) // Limit to 10 activities for performance

  const hasMapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (activitiesWithLocation.length === 0) {
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
            Activities don't have GPS coordinates to display on map
          </p>
        </div>
      </div>
    )
  }

  // Calculate center point
  const avgLat = activitiesWithLocation.reduce((sum, a) => sum + (a.start_latitude || 0), 0) / activitiesWithLocation.length
  const avgLng = activitiesWithLocation.reduce((sum, a) => sum + (a.start_longitude || 0), 0) / activitiesWithLocation.length

  if (!hasMapboxToken) {
    return (
      <div 
        className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden"
        style={{ height }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Activity Locations
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {activitiesWithLocation.length} activities with GPS
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🗺️</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Interactive map requires Mapbox token
              </p>
            </div>
            
            {/* Activity List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activitiesWithLocation.map((activity, index) => (
                <div key={activity.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.type} • {(activity.distance / 1000).toFixed(1)}km
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 text-right">
                    <div>{activity.start_latitude?.toFixed(4)}</div>
                    <div>{activity.start_longitude?.toFixed(4)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Setup Instructions */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>To enable interactive maps:</strong><br/>
                1. Get a free Mapbox token at mapbox.com<br/>
                2. Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If we have a Mapbox token, show a basic static map
  const markers = activitiesWithLocation.map(a => 
    `pin-s-circle+ff0000(${a.start_longitude},${a.start_latitude})`
  ).join(',')
  
  const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${markers}/${avgLng},${avgLat},10,0/${Math.min(600, height * 1.5)}x${height}@2x?access_token=${hasMapboxToken}`

  return (
    <div 
      className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden"
      style={{ height }}
    >
      <img 
        src={staticMapUrl}
        alt="Activity locations map"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.nextElementSibling?.classList.remove('hidden')
        }}
      />
      <div className="hidden h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Map Loading Failed
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
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
  showControls = true 
}: RunningMapProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [mapType, setMapType] = useState<'overview' | 'single'>('overview')

  // Filter activities with location data
  const activitiesWithLocation = activities.filter(a => 
    a.start_latitude && a.start_longitude
  )

  return (
    <div className="space-y-4">
      {/* Controls */}
      {showControls && activitiesWithLocation.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={mapType}
              onChange={(e) => setMapType(e.target.value as 'overview' | 'single')}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="overview">Overview</option>
              <option value="single">Single Activity</option>
            </select>
            
            {mapType === 'single' && (
              <select
                value={selectedActivity?.id || ''}
                onChange={(e) => {
                  const activity = activitiesWithLocation.find(a => a.id === parseInt(e.target.value))
                  setSelectedActivity(activity || null)
                }}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select Activity</option>
                {activitiesWithLocation.slice(0, 20).map(activity => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name} ({(activity.distance / 1000).toFixed(1)}km)
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {activitiesWithLocation.length} of {activities.length} activities have GPS data
          </div>
        </div>
      )}

      {/* Map */}
      <StaticMapFallback 
        activities={mapType === 'single' && selectedActivity ? [selectedActivity] : activitiesWithLocation} 
        height={height} 
      />
      
      {/* Activity Info */}
      {mapType === 'single' && selectedActivity && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            {selectedActivity.name}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Type:</span> {selectedActivity.type}
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Distance:</span> {(selectedActivity.distance / 1000).toFixed(2)}km
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Start:</span> {selectedActivity.start_latitude?.toFixed(4)}, {selectedActivity.start_longitude?.toFixed(4)}
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Date:</span> {new Date(selectedActivity.start_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
