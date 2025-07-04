'use client'

import { useEffect, useRef, useState } from 'react'
import Map, { Layer, Source, Marker, Popup } from 'react-map-gl'
import type { MapRef } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Polyline decoding utility
function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let b: number
    let shift = 0
    let result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lat += deltaLat

    shift = 0
    result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lng += deltaLng

    coordinates.push([lng / 1e5, lat / 1e5])
  }

  return coordinates
}

interface Activity {
  id: number
  name: string
  type: string
  distance: number
  start_date: string
  summary_polyline?: string
  start_latitude?: number
  start_longitude?: number
}

interface RunningMapProps {
  activities: Activity[]
  selectedActivity?: Activity | null
  onActivitySelect?: (activity: Activity | null) => void
  height?: string | number
  showHeatmap?: boolean
  showClusters?: boolean
  mapStyle?: string
}

const MAP_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
}

export default function RunningMap({
  activities,
  selectedActivity,
  onActivitySelect,
  height = 400,
  showHeatmap = false,
  showClusters = false,
  mapStyle = 'streets',
}: RunningMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [viewState, setViewState] = useState({
    longitude: -74.006,
    latitude: 40.7128,
    zoom: 10,
  })
  const [popupInfo, setPopupInfo] = useState<Activity | null>(null)

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Calculate bounds from activities
  useEffect(() => {
    if (activities.length > 0 && mapRef.current) {
      const validActivities = activities.filter(
        (activity) => activity.start_latitude && activity.start_longitude
      )

      if (validActivities.length > 0) {
        const bounds = validActivities.reduce(
          (bounds, activity) => {
            return {
              minLng: Math.min(bounds.minLng, activity.start_longitude!),
              maxLng: Math.max(bounds.maxLng, activity.start_longitude!),
              minLat: Math.min(bounds.minLat, activity.start_latitude!),
              maxLat: Math.max(bounds.maxLat, activity.start_latitude!),
            }
          },
          {
            minLng: validActivities[0].start_longitude!,
            maxLng: validActivities[0].start_longitude!,
            minLat: validActivities[0].start_latitude!,
            maxLat: validActivities[0].start_latitude!,
          }
        )

        // Add padding to bounds
        const padding = 0.01
        mapRef.current.fitBounds(
          [
            [bounds.minLng - padding, bounds.minLat - padding],
            [bounds.maxLng + padding, bounds.maxLat + padding],
          ],
          { padding: 50, duration: 1000 }
        )
      }
    }
  }, [activities])

  // Focus on selected activity
  useEffect(() => {
    if (selectedActivity && selectedActivity.start_latitude && selectedActivity.start_longitude && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedActivity.start_longitude, selectedActivity.start_latitude],
        zoom: 14,
        duration: 1000,
      })
    }
  }, [selectedActivity])

  if (!mapboxToken) {
    return (
      <div 
        className="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600"
        style={{ height }}
      >
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Mapbox Token Required
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Please add your Mapbox token to .env.local to enable maps
          </p>
          <div className="text-sm text-gray-400 dark:text-gray-500">
            <p>1. Visit <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">mapbox.com</a></p>
            <p>2. Create a free account</p>
            <p>3. Copy your public token</p>
            <p>4. Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local</p>
          </div>
        </div>
      </div>
    )
  }

  // Prepare route data for activities with polylines
  const routeData = activities
    .filter((activity) => activity.summary_polyline)
    .map((activity) => ({
      type: 'Feature' as const,
      properties: {
        id: activity.id,
        name: activity.name,
        type: activity.type,
        distance: activity.distance,
        color: getActivityColor(activity.type),
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: decodePolyline(activity.summary_polyline!),
      },
    }))

  const routeGeoJSON = {
    type: 'FeatureCollection' as const,
    features: routeData,
  }

  // Activity start points
  const startPoints = activities.filter(
    (activity) => activity.start_latitude && activity.start_longitude
  )

  return (
    <div style={{ height }} className="relative rounded-lg overflow-hidden">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxToken}
        mapStyle={MAP_STYLES[mapStyle as keyof typeof MAP_STYLES]}
        attributionControl={false}
        logoPosition="bottom-right"
      >
        {/* Route lines */}
        {routeGeoJSON.features.length > 0 && (
          <Source id="routes" type="geojson" data={routeGeoJSON}>
            <Layer
              id="routes-line"
              type="line"
              paint={{
                'line-color': ['get', 'color'],
                'line-width': selectedActivity ? 
                  ['case', ['==', ['get', 'id'], selectedActivity.id], 4, 2] : 2,
                'line-opacity': selectedActivity ? 
                  ['case', ['==', ['get', 'id'], selectedActivity.id], 0.9, 0.6] : 0.7,
              }}
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
              }}
            />
          </Source>
        )}

        {/* Activity start markers */}
        {!showClusters && startPoints.map((activity) => (
          <Marker
            key={activity.id}
            longitude={activity.start_longitude!}
            latitude={activity.start_latitude!}
            anchor="center"
          >
            <button
              className={`w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all hover:scale-125 ${
                selectedActivity?.id === activity.id
                  ? 'bg-red-500 w-4 h-4'
                  : getActivityMarkerColor(activity.type)
              }`}
              onClick={() => {
                setPopupInfo(activity)
                onActivitySelect?.(activity)
              }}
            />
          </Marker>
        ))}

        {/* Popup */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.start_longitude!}
            latitude={popupInfo.start_latitude!}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-medium text-gray-900 mb-1">
                {popupInfo.name || 'Untitled Activity'}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>📍 {popupInfo.type}</p>
                <p>📏 {formatDistance(popupInfo.distance)}</p>
                <p>📅 {new Date(popupInfo.start_date).toLocaleDateString()}</p>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Map controls */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => {
            if (mapRef.current && activities.length > 0) {
              const validActivities = activities.filter(
                (activity) => activity.start_latitude && activity.start_longitude
              )
              if (validActivities.length > 0) {
                const bounds = validActivities.reduce(
                  (bounds, activity) => ({
                    minLng: Math.min(bounds.minLng, activity.start_longitude!),
                    maxLng: Math.max(bounds.maxLng, activity.start_longitude!),
                    minLat: Math.min(bounds.minLat, activity.start_latitude!),
                    maxLat: Math.max(bounds.maxLat, activity.start_latitude!),
                  }),
                  {
                    minLng: validActivities[0].start_longitude!,
                    maxLng: validActivities[0].start_longitude!,
                    minLat: validActivities[0].start_latitude!,
                    maxLat: validActivities[0].start_latitude!,
                  }
                )
                mapRef.current.fitBounds(
                  [
                    [bounds.minLng - 0.01, bounds.minLat - 0.01],
                    [bounds.maxLng + 0.01, bounds.maxLat + 0.01],
                  ],
                  { padding: 50, duration: 1000 }
                )
              }
            }
          }}
          className="block w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          🔍 Fit All
        </button>
      </div>
    </div>
  )
}

// Helper functions
function getActivityColor(type: string): string {
  const colors: Record<string, string> = {
    Run: '#ef4444', // red
    Walk: '#3b82f6', // blue
    Ride: '#8b5cf6', // purple
    Swim: '#06b6d4', // cyan
    Hike: '#f97316', // orange
    WeightTraining: '#dc2626', // red
    Yoga: '#ec4899', // pink
    Other: '#6b7280', // gray
  }
  return colors[type] || colors.Other
}

function getActivityMarkerColor(type: string): string {
  const colors: Record<string, string> = {
    Run: 'bg-red-500',
    Walk: 'bg-blue-500',
    Ride: 'bg-purple-500',
    Swim: 'bg-cyan-500',
    Hike: 'bg-orange-500',
    WeightTraining: 'bg-red-600',
    Yoga: 'bg-pink-500',
    Other: 'bg-gray-500',
  }
  return colors[type] || colors.Other
}

function formatDistance(meters?: number): string {
  if (!meters) return '0 km'
  return `${(meters / 1000).toFixed(1)} km`
}
