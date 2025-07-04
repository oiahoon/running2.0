'use client'

import { useState } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import { formatDistance, formatDuration, getActivityIcon } from '@/lib/database/models/Activity'
import { Button } from '@/components/catalyst'

interface ActivityFilters {
  type?: string[]
  source?: string[]
  startDate?: Date
  endDate?: Date
  minDistance?: number
  maxDistance?: number
  search?: string
}

function ActivityCard({ activity }: { activity: any }) {
  const startDate = new Date(activity.start_date)
  const hasLocation = activity.location_city || activity.location_state || activity.location_country
  const location = [activity.location_city, activity.location_state, activity.location_country]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">{getActivityIcon(activity.type)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                {activity.name || `${activity.type} Activity`}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{activity.type}</span>
                {hasLocation && <span>{location}</span>}
                <span>{startDate.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Distance</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDistance(activity.distance)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDuration(activity.moving_time)}
            </div>
          </div>
          {activity.average_speed && (
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Speed</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {(activity.average_speed * 3.6).toFixed(1)} km/h
              </div>
            </div>
          )}
          {activity.total_elevation_gain && activity.total_elevation_gain > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Elevation</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.round(activity.total_elevation_gain)}m
              </div>
            </div>
          )}
        </div>

        {activity.description && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {activity.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterBar({ 
  filters, 
  onFiltersChange,
  availableTypes 
}: { 
  filters: ActivityFilters
  onFiltersChange: (filters: ActivityFilters) => void
  availableTypes: string[]
}) {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search activities..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Activity Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Activity Type
          </label>
          <select
            value={filters.type?.[0] || ''}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              type: e.target.value ? [e.target.value] : undefined 
            })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {availableTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate?.toISOString().split('T')[0] || ''}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              startDate: e.target.value ? new Date(e.target.value) : undefined 
            })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate?.toISOString().split('T')[0] || ''}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              endDate: e.target.value ? new Date(e.target.value) : undefined 
            })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {(filters.search || filters.type?.length || filters.startDate || filters.endDate) && (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => onFiltersChange({})}
            color="gray"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}

function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void 
}) {
  const pages = []
  const maxVisiblePages = 5
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          color="gray"
        >
          Previous
        </Button>
        
        {pages.map(page => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            color={page === currentPage ? "blue" : "gray"}
          >
            {page}
          </Button>
        ))}
        
        <Button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          color="gray"
        >
          Next
        </Button>
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  )
}

export default function ActivitiesPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ActivityFilters>({})
  const limit = 12

  const { data, isLoading, error } = useActivities(filters, page, limit)

  const activities = data?.activities || []
  const pagination = data?.pagination || {}
  const summary = data?.summary || {}
  
  // Get available activity types for filter
  const availableTypes = summary.typeDistribution?.map((t: any) => t.type) || []

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activities</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Browse and filter your running activities.
          </p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-red-800 dark:text-red-200">
            <h3 className="font-medium">Error loading activities</h3>
            <p className="text-sm mt-1">Failed to fetch activities. Please try again later.</p>
          </div>
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
          Browse and filter your running activities.
        </p>
      </div>

      {/* Summary Stats */}
      {summary.totalActivities > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-5">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {summary.totalActivities}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Activities
            </div>
          </div>
          
          {summary.typeDistribution?.slice(0, 3).map((type: any) => (
            <div key={type.type} className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-5">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {type.count}
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {type.type} Activities
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <FilterBar 
        filters={filters}
        onFiltersChange={setFilters}
        availableTypes={availableTypes}
      />

      {/* Activities List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {activities.map((activity: any) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏃‍♂️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No activities found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {Object.keys(filters).length > 0 
              ? "Try adjusting your filters to see more activities."
              : "Connect your Strava account to start tracking activities."
            }
          </p>
        </div>
      )}
    </div>
  )
}
