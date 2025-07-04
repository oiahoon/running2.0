'use client'

import { useState } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import { formatDistance, formatDuration, formatPace } from '@/lib/database/models/Activity'
import { getActivityConfig, shouldShowOnMap } from '@/lib/config/activities'
import RunningMap from '@/components/maps/RunningMap'

interface ActivityFilters {
  type?: string[]
  startDate?: Date
  endDate?: Date
  search?: string
}

function ActivityCard({ activity }: { activity: any }) {
  const config = getActivityConfig(activity.type)
  const hasLocation = activity.start_latitude && activity.start_longitude
  const showMap = shouldShowOnMap(activity.type) && hasLocation

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Left side - Activity info */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-semibold"
                style={{ backgroundColor: config.color }}
              >
                {config.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {activity.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(activity.start_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <span 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${config.color}20`,
                color: config.color
              }}
            >
              {config.displayName}
            </span>
          </div>

          {/* Activity metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDistance(activity.distance)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Distance</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDuration(activity.moving_time)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Time</div>
            </div>
            {activity.distance > 0 && activity.moving_time > 0 && (
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPace((activity.moving_time / 60) / (activity.distance / 1000))}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Pace</div>
              </div>
            )}
            {activity.total_elevation_gain > 0 && (
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(activity.total_elevation_gain)}m
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Elevation</div>
              </div>
            )}
          </div>

          {/* Location info */}
          {hasLocation && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              📍 {activity.start_latitude?.toFixed(4)}, {activity.start_longitude?.toFixed(4)}
              {activity.location_city && (
                <span className="ml-2">• {activity.location_city}</span>
              )}
            </div>
          )}
        </div>

        {/* Right side - Mini map */}
        {showMap ? (
          <div className="w-64 flex-shrink-0">
            <div className="h-full min-h-48">
              <RunningMap
                activities={[activity]}
                height={200}
                showControls={false}
                defaultView="single"
              />
            </div>
          </div>
        ) : (
          <div className="w-64 flex-shrink-0 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">{config.icon}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {config.displayName}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                No route data
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ActivitiesPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ActivityFilters>({})
  const pageSize = 10

  const { data, isLoading, error } = useActivities(filters, currentPage, pageSize)

  const activities = data?.activities || []
  const totalPages = data?.totalPages || 1
  const totalCount = data?.totalCount || 0

  // Get available activity types for filter
  const availableTypes = [...new Set(activities.map(a => a.type))].sort()

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activities</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Loading your activities...
          </p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="flex">
                <div className="flex-1 p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="w-64 bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activities</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Failed to load activities.
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Error loading activities. Please try refreshing the page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activities</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Browse and explore your {totalCount.toLocaleString()} activities.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Activity Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Activity Type
            </label>
            <select
              value={filters.type?.[0] || ''}
              onChange={(e) => setFilters({
                ...filters,
                type: e.target.value ? [e.target.value] : undefined
              })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              {availableTypes.map(type => {
                const config = getActivityConfig(type)
                return (
                  <option key={type} value={type}>
                    {config.icon} {config.displayName}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search activities..."
              value={filters.search || ''}
              onChange={(e) => setFilters({
                ...filters,
                search: e.target.value || undefined
              })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => setFilters({
                ...filters,
                startDate: e.target.value ? new Date(e.target.value) : undefined
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
              value={filters.endDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => setFilters({
                ...filters,
                endDate: e.target.value ? new Date(e.target.value) : undefined
              })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({})}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-4xl mb-4">🏃‍♂️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Activities Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {Object.keys(filters).length > 0 
                ? 'Try adjusting your filters to see more activities.'
                : 'Start tracking your activities to see them here.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} activities
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
