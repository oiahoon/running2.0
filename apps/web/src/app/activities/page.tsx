'use client'

import { useState, useEffect, useCallback } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import { formatDistance, formatDuration, formatPace, ActivityType } from '@/lib/database/models/Activity'
import { getActivityConfig, shouldShowOnMap } from '@/lib/config/activities'
import RunningMap from '@/components/maps/RunningMap'

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface ActivityFilters {
  type?: ActivityType[]
  startDate?: Date
  endDate?: Date
  search?: string
}

interface Activity {
  id: number
  name: string
  type: ActivityType
  distance: number
  moving_time: number
  total_elevation_gain: number
  start_date: string
  start_latitude?: number
  start_longitude?: number
  location_city?: string
}

function ActivityCard({ activity }: { activity: Activity }) {
  const config = getActivityConfig(activity.type)
  const hasLocation = activity.start_latitude && activity.start_longitude
  const showMap = shouldShowOnMap(activity.type) && hasLocation

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatDistance(activity.distance)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Distance</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatDuration(activity.moving_time)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Time</div>
            </div>
            {activity.distance > 0 && activity.moving_time > 0 && (
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatPace((activity.moving_time / 60) / (activity.distance / 1000))}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Pace</div>
              </div>
            )}
            {activity.total_elevation_gain > 0 && (
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {Math.round(activity.total_elevation_gain)}m
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Elevation</div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Larger map */}
        {showMap ? (
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="h-64 lg:h-full lg:min-h-48">
              <RunningMap
                activities={[activity]}
                height={256}
                showControls={false}
                defaultView="single"
              />
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-96 flex-shrink-0 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-4xl mb-2">{config.icon}</div>
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
  const [filters, setFilters] = useState<ActivityFilters>({})
  const [allActivities, setAllActivities] = useState<Activity[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const pageSize = 10

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 300)

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: debouncedSearch || undefined
    }))
  }, [debouncedSearch])

  const { data, isLoading, error } = useActivities(filters, currentPage, pageSize)

  // Handle new data
  useEffect(() => {
    if (data?.activities) {
      if (currentPage === 1) {
        setAllActivities(data.activities)
      } else {
        setAllActivities(prev => [...prev, ...data.activities])
      }
      setHasMore(data.activities.length === pageSize)
      setIsLoadingMore(false)
    }
  }, [data, currentPage])

  // Reset when filters change
  useEffect(() => {
    setCurrentPage(1)
    setAllActivities([])
    setHasMore(true)
  }, [filters])

  // Infinite scroll handler
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true)
      setCurrentPage(prev => prev + 1)
    }
  }, [isLoadingMore, hasMore, isLoading])

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMore])

  // Get available activity types for filter
  const availableTypes = [...new Set(allActivities.map((a: Activity) => a.type))].sort()

  if (isLoading && currentPage === 1) {
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
              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="w-full lg:w-96 h-64 lg:h-48 bg-gray-200 dark:bg-gray-700"></div>
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
          Browse and explore your {data?.totalCount?.toLocaleString() || 0} activities.
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
                type: e.target.value ? [e.target.value as ActivityType] : undefined
              })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              {availableTypes.map((type: ActivityType) => {
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
            onClick={() => {
              setFilters({})
              setSearchInput('')
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-6">
        {allActivities.length > 0 ? (
          allActivities.map((activity: Activity) => (
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

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && allActivities.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            You've reached the end of your activities!
          </p>
        </div>
      )}
    </div>
  )
}
