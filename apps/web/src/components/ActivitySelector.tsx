'use client'

import { useState, useEffect, useMemo } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import { getActivityConfig, shouldShowOnMap } from '@/lib/config/activities'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

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

interface Activity {
  id: number
  name: string
  type: string
  distance: number
  start_date: string
  start_latitude?: number
  start_longitude?: number
}

interface ActivitySelectorProps {
  selectedActivity: Activity | null
  onActivitySelect: (activity: Activity | null) => void
  className?: string
}

export default function ActivitySelector({ 
  selectedActivity, 
  onActivitySelect, 
  className = '' 
}: ActivitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const pageSize = 50 // Increase page size for better UX

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Fetch activities with GPS data only
  const { data, isLoading, error } = useActivities({
    search: debouncedSearchTerm || undefined
  }, 1, pageSize)

  // Filter activities that should show on map
  const activities = (data?.activities || []).filter((activity: Activity) => 
    shouldShowOnMap(activity.type) && activity.start_latitude && activity.start_longitude
  )

  const totalCount = data?.totalCount || 0

  const handleSelect = (activity: Activity) => {
    onActivitySelect(activity)
    setIsOpen(false)
  }

  const handleClear = () => {
    onActivitySelect(null)
    setIsOpen(false)
  }

  if (error) {
    console.error('ActivitySelector error:', error)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
      >
        <span className="block truncate">
          {selectedActivity ? (
            <span className="flex items-center">
              <span className="mr-2">{getActivityConfig(selectedActivity.type).icon}</span>
              {selectedActivity.name} ({(selectedActivity.distance / 1000).toFixed(1)}km)
            </span>
          ) : (
            'Select Activity'
          )}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          {isOpen ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          )}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-96 w-full overflow-hidden rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {/* Search */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Clear Option */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClear}
              className="w-full px-3 py-2 text-left text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear Selection
            </button>
          </div>

          {/* Activities List */}
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                Loading activities...
              </div>
            ) : activities.length > 0 ? (
              <>
                {activities.map((activity: Activity) => {
                  const config = getActivityConfig(activity.type)
                  const isSelected = selectedActivity?.id === activity.id
                  
                  return (
                    <button
                      key={activity.id}
                      onClick={() => handleSelect(activity)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span>{config.icon}</span>
                          <span className="truncate">{activity.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{(activity.distance / 1000).toFixed(1)}km</span>
                          <span>{new Date(activity.start_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
                
                {/* Show count info */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800">
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Showing {activities.length} of {totalCount} activities
                    {debouncedSearchTerm && ` matching "${debouncedSearchTerm}"`}
                  </div>
                </div>
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                {debouncedSearchTerm ? `No activities found for "${debouncedSearchTerm}"` : 'No activities found'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
