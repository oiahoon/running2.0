'use client'

import { useState } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import RunningMap from '@/components/maps/RunningMap'
import WaterfallMapView from '@/components/maps/WaterfallMapView'
import { formatDistance, formatDuration, getActivityIcon, ActivityType } from '@/lib/database/models/Activity'
import { getActivityConfig } from '@/lib/config/activities'
import { getDefaultActivityTypes } from '@/lib/config/activityTypes'

interface Activity {
  id: number
  name: string
  type: ActivityType
  distance: number
  moving_time: number
  start_date: string
  start_latitude?: number
  start_longitude?: number
}

type ViewMode = 'map' | 'waterfall'

export default function MapPage() {
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>(
    getDefaultActivityTypes() as ActivityType[]
  )
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({})
  const [viewMode, setViewMode] = useState<ViewMode>('waterfall') // Default to Gallery view

  // Fetch activities with location data
  const { data, isLoading, error } = useActivities({
    type: selectedTypes.length > 0 ? selectedTypes : undefined,
    startDate: dateRange.start,
    endDate: dateRange.end
  }, 1, 500) // Get more activities for map

  const activities: Activity[] = data?.activities || []

  // Filter activities with location data for map display
  const activitiesWithLocation = activities.filter((activity: Activity) => 
    activity.start_latitude && activity.start_longitude
  )

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Route Map</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Loading map data...
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading map data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Route Map</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Failed to load map data.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-12 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Failed to Load Map Data
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Please try refreshing the page or check your connection.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const availableTypes = [...new Set(activities.map((a: Activity) => a.type))].sort()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Route Map</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Explore your activity routes and locations on an interactive map.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* View Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              View Mode
            </label>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => setViewMode('map')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                🗺️ Map
              </button>
              <button
                onClick={() => setViewMode('waterfall')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'waterfall'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                🌊 Gallery
              </button>
            </div>
          </div>

          {/* Activity Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Activity Types
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableTypes.map((type: ActivityType) => {
                const config = getActivityConfig(type)
                return (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTypes([...selectedTypes, type])
                        } else {
                          setSelectedTypes(selectedTypes.filter(t => t !== type))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="mr-1">{config.icon}</span>
                      {config.displayName}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start?.toISOString().split('T')[0] || ''}
              onChange={(e) => setDateRange({
                ...dateRange,
                start: e.target.value ? new Date(e.target.value) : undefined
              })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end?.toISOString().split('T')[0] || ''}
              onChange={(e) => setDateRange({
                ...dateRange,
                end: e.target.value ? new Date(e.target.value) : undefined
              })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedTypes(getDefaultActivityTypes() as ActivityType[])
                setDateRange({})
              }}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-5">
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
            {activities.length}
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Activities
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-5">
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
            {activitiesWithLocation.length}
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            With GPS Data
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-5">
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
            {formatDistance(activities.reduce((sum: number, a: Activity) => sum + (a.distance || 0), 0))}
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Distance
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-5">
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
            {formatDuration(activities.reduce((sum: number, a: Activity) => sum + (a.moving_time || 0), 0))}
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Time
          </div>
        </div>
      </div>

      {/* Main Content - Conditional based on view mode */}
      {viewMode === 'map' ? (
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <RunningMap 
              activities={activitiesWithLocation}
              height={600}
              showControls={true}
              defaultView="single"
            />
          </div>
        </div>
      ) : (
        <WaterfallMapView 
          key={`${JSON.stringify(selectedTypes)}-${dateRange.start}-${dateRange.end}`}
          filters={{
            type: selectedTypes.length > 0 ? selectedTypes : undefined,
            startDate: dateRange.start,
            endDate: dateRange.end
          }}
        />
      )}
    </div>
  )
}
