'use client'

import { useState, useEffect } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import { getActivityConfig, shouldShowOnMap } from '@/lib/config/activities'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

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
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const pageSize = 20

  // Fetch activities with GPS data only
  const { data, isLoading } = useActivities({
    search: searchTerm || undefined
  }, currentPage, pageSize)

  const activities = (data?.activities || []).filter((activity: Activity) => 
    shouldShowOnMap(activity.type) && activity.start_latitude && activity.start_longitude
  )

  const totalPages = Math.ceil((data?.totalCount || 0) / pageSize)
  const hasMore = currentPage < totalPages

  const handleSelect = (activity: Activity) => {
    onActivitySelect(activity)
    setIsOpen(false)
  }

  const handleClear = () => {
    onActivitySelect(null)
    setIsOpen(false)
  }

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1)
    }
  }

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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
            {isLoading && currentPage === 1 ? (
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
                
                {/* Load More Button */}
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : `Load More (Page ${currentPage + 1})`}
                  </button>
                )}
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No activities found
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
