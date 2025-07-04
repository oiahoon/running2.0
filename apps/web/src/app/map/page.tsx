'use client'

import { useState } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import RunningMap from '@/components/maps/RunningMap'
import MapControls from '@/components/maps/MapControls'
import { formatDistance, formatDuration, getActivityIcon } from '@/lib/database/models/Activity'

export default function MapPage() {
  const [mapStyle, setMapStyle] = useState('streets')
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showClusters, setShowClusters] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Run', 'Walk', 'Ride', 'Swim', 'Hike'])
  const [selectedActivity, setSelectedActivity] = useState<any>(null)

  // Fetch activities with location data
  const { data, isLoading, error } = useActivities({}, 1, 200) // Get more activities for map

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Route Map</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Loading your running routes...
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
              Failed to load activities
            </h3>
            <p className="text-red-500">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const activities = data?.activities || []
  
  // Filter activities by selected types
  const filteredActivities = activities.filter(activity => 
    selectedTypes.includes(activity.type)
  )

  // Get unique activity types from data
  const availableTypes = [...new Set(activities.map(activity => activity.type))]

  // Calculate map statistics
  const mapStats = {
    totalRoutes: filteredActivities.filter(a => a.summary_polyline).length,
    totalActivities: filteredActivities.length,
    uniqueLocations: new Set(
      filteredActivities
        .filter(a => a.location_country)
        .map(a => a.location_country)
    ).size,
    totalDistance: filteredActivities.reduce((sum, a) => sum + (a.distance || 0), 0),
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Route Map</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Explore your running routes on interactive maps with various visualization modes.
        </p>
      </div>

      {/* Map Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">🛤️</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Routes with GPS
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {mapStats.totalRoutes}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">📍</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Activities
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {mapStats.totalActivities}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">🌍</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Countries
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {mapStats.uniqueLocations}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">📏</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Distance
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDistance(mapStats.totalDistance)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <MapControls
        mapStyle={mapStyle}
        onMapStyleChange={setMapStyle}
        showHeatmap={showHeatmap}
        onHeatmapToggle={setShowHeatmap}
        showClusters={showClusters}
        onClustersToggle={setShowClusters}
        activityTypes={availableTypes}
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
      />

      {/* Main Map */}
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Interactive Route Map
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredActivities.length} activities
            </div>
          </div>
          
          <RunningMap
            activities={filteredActivities}
            selectedActivity={selectedActivity}
            onActivitySelect={setSelectedActivity}
            height={500}
            showHeatmap={showHeatmap}
            showClusters={showClusters}
            mapStyle={mapStyle}
          />
        </div>
      </div>

      {/* Recent Routes */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <RecentRoutes 
          activities={filteredActivities.slice(0, 5)} 
          onActivitySelect={setSelectedActivity}
          selectedActivity={selectedActivity}
        />
        
        {selectedActivity && (
          <ActivityDetails activity={selectedActivity} />
        )}
      </div>

      {/* Feature Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="text-2xl">🚀</div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Map Features Available
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul className="list-disc list-inside space-y-1">
                <li>Interactive route visualization with GPS tracks</li>
                <li>Multiple map styles (Streets, Satellite, Outdoors, Dark)</li>
                <li>Activity filtering by type and date</li>
                <li>Click on markers to see activity details</li>
                <li>Automatic map bounds fitting for your routes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecentRoutes({ 
  activities, 
  onActivitySelect, 
  selectedActivity 
}: { 
  activities: any[]
  onActivitySelect: (activity: any) => void
  selectedActivity: any
}) {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Recent Routes
        </h3>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                selectedActivity?.id === activity.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => onActivitySelect(activity)}
            >
              <div className="flex items-center">
                <div className="text-lg mr-3">{getActivityIcon(activity.type)}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.name || 'Untitled Activity'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDistance(activity.distance)} • {new Date(activity.start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`w-3 h-3 rounded-full ${
                  activity.summary_polyline ? 'bg-green-500' : 'bg-gray-300'
                }`} title={activity.summary_polyline ? 'Has GPS track' : 'No GPS track'} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ActivityDetails({ activity }: { activity: any }) {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Activity Details
        </h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getActivityIcon(activity.type)}</span>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {activity.name || 'Untitled Activity'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{activity.type}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Distance</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDistance(activity.distance)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDuration(activity.moving_time)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(activity.start_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {activity.location_country || 'Unknown'}
              </p>
            </div>
          </div>

          {activity.summary_polyline && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                GPS track available
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
