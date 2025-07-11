'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useActivityStats, useActivities } from '@/lib/hooks/useActivities'
import { formatDistance, formatDuration, formatPace, getActivityIcon, Activity } from '@/lib/database/models/Activity'
import { getActivityConfig, shouldShowOnMap } from '@/lib/config/activities'
import { getDefaultActivityTypes } from '@/lib/config/activityTypes'
import RunningMap from '@/components/maps/RunningMap'
import DistanceTrendChart from '@/components/charts/DistanceTrendChart'
import GitHubHeatmap from '@/components/charts/GitHubHeatmap'
import YearAwareHeatmap from '@/components/charts/YearAwareHeatmap'
import { smartTruncate, truncateAddress } from '@/lib/utils/textUtils'

function StatsCard({ title, value, subtitle, icon, trend }: {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  trend?: { value: number; isPositive: boolean }
}) {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="text-2xl">{icon}</div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {value}
              </div>
              {trend && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                </div>
              )}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsGrid() {
  // Don't pass year parameter to get all-time stats
  const { data: stats, isLoading, error } = useActivityStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    console.error('Dashboard stats error:', error)
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="All-Time Activities" value="0" icon="🏃‍♂️" />
        <StatsCard title="Total Distance" value="0 km" icon="📏" />
        <StatsCard title="Total Time" value="0h 0m" icon="⏱️" />
        <StatsCard title="Average Distance" value="0 km" icon="📊" />
      </div>
    )
  }

  const basicStats = stats.basicStats || {}
  console.log('Dashboard basicStats:', basicStats) // Debug log

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="All-Time Activities" 
        value={basicStats.total_activities || 0}
        icon="🏃‍♂️"
        subtitle={`Since ${basicStats.first_activity ? new Date(basicStats.first_activity).getFullYear() : 'N/A'}`}
      />
      <StatsCard 
        title="Total Distance" 
        value={formatDistance((basicStats.total_distance || 0) * 1000)} // Convert km to meters for formatDistance
        icon="📏"
        subtitle="All time"
      />
      <StatsCard 
        title="Total Time" 
        value={formatDuration(basicStats.total_time || 0)}
        icon="⏱️"
        subtitle="All moving time"
      />
      <StatsCard 
        title="Average Distance" 
        value={formatDistance((basicStats.avg_distance || 0) * 1000)} // Convert km to meters for formatDistance
        icon="📊"
        subtitle="Per activity"
      />
    </div>
  )
}

function RecentActivitiesWithMap() {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [allActivities, setAllActivities] = useState<Activity[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const pageSize = 10

  // Use default activity types for filtering
  const defaultTypes = getDefaultActivityTypes()
  const { data, isLoading } = useActivities({ 
    type: defaultTypes as any[] 
  }, currentPage, pageSize)

  // Handle new data - accumulate for infinite scroll
  useEffect(() => {
    if (data?.activities && Array.isArray(data.activities)) {
      if (currentPage === 1) {
        setAllActivities(data.activities)
      } else {
        setAllActivities(prev => [...prev, ...data.activities])
      }
      setHasMore(data.activities.length === pageSize)
      setIsLoadingMore(false)
    }
  }, [data, currentPage])

  // Auto-select first activity with GPS data
  useEffect(() => {
    if (!selectedActivity && allActivities.length > 0) {
      const firstGpsActivity = allActivities.find(a => 
        a.start_latitude && a.start_longitude && shouldShowOnMap(a.type)
      )
      setSelectedActivity(firstGpsActivity || allActivities[0])
    }
  }, [allActivities, selectedActivity])

  const loadMore = () => {
    if (hasMore && !isLoading && !isLoadingMore) {
      setIsLoadingMore(true)
      setCurrentPage(prev => prev + 1)
    }
  }

  // Scroll event listener for the activities container
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop <= clientHeight + 100) { // 100px threshold
      loadMore()
    }
  }

  if (isLoading && currentPage === 1) {
    return (
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Activities & Routes
          </h3>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-full overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Activities & Routes
          </h3>
          <Link 
            href="/activities"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
          >
            View all →
          </Link>
        </div>

        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col xl:flex-row xl:space-x-6 space-y-6 xl:space-y-0">
          {/* Left: Activities List */}
          <div className="xl:w-1/2">
            <div 
              className="space-y-3 max-h-96 overflow-y-auto"
              onScroll={handleScroll}
            >
              {Array.isArray(allActivities) && allActivities.map((activity) => {
                const config = getActivityConfig(activity.type)
                const isSelected = selectedActivity?.id === activity.id
                const hasGps = activity.start_latitude && activity.start_longitude
                
                return (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: config.color }}
                        >
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            <span className="block sm:hidden">
                              {truncateAddress(activity.name, 25)}
                            </span>
                            <span className="hidden sm:block lg:hidden">
                              {smartTruncate(activity.name, 40)}
                            </span>
                            <span className="hidden lg:block truncate">
                              {activity.name}
                            </span>
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex-shrink-0">{formatDistance(activity.distance)}</span>
                            <span className="flex-shrink-0">•</span>
                            <span className="flex-shrink-0">{formatDuration(activity.moving_time)}</span>
                            {hasGps && (
                              <>
                                <span className="hidden sm:inline flex-shrink-0">•</span>
                                <span className="text-green-600 dark:text-green-400 hidden sm:inline flex-shrink-0">📍 GPS</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 hidden md:block">
                        <div className="text-right">
                          {new Date(activity.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Loading More Indicator */}
              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
              
              {/* End of Results */}
              {!hasMore && allActivities.length > 0 && (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    All activities loaded
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Selected Activity Map & Details */}
          <div className="xl:w-1/2">
            <div className="space-y-4">
              {selectedActivity ? (
                <>
                  {/* Map */}
                  <div className="h-48 sm:h-64 xl:h-80">
                    <RunningMap
                      key={selectedActivity.id} // Force re-render when activity changes
                      activities={[selectedActivity]}
                      height={192}
                      showControls={false}
                      showActivityInfo={false} // Disable redundant activity info
                      defaultView="single"
                    />
                  </div>
                  
                  {/* Activity Details - Optimized */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate flex-1 mr-2">
                        {selectedActivity.name}
                      </h4>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex-shrink-0">
                        {selectedActivity.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="min-w-0">
                        <span className="text-gray-500 dark:text-gray-400 block text-xs">Distance</span>
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {formatDistance(selectedActivity.distance)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-gray-500 dark:text-gray-400 block text-xs">Time</span>
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {formatDuration(selectedActivity.moving_time)}
                        </p>
                      </div>
                      {selectedActivity.distance > 0 && selectedActivity.moving_time > 0 && (
                        <div className="min-w-0">
                          <span className="text-gray-500 dark:text-gray-400 block text-xs">Avg Pace</span>
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {formatPace((selectedActivity.moving_time / 60) / (selectedActivity.distance / 1000))}
                          </p>
                        </div>
                      )}
                      {selectedActivity.total_elevation_gain > 0 && (
                        <div className="min-w-0">
                          <span className="text-gray-500 dark:text-gray-400 block text-xs">Elevation</span>
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {Math.round(selectedActivity.total_elevation_gain)}m
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
                        {new Date(selectedActivity.start_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {selectedActivity.start_latitude && selectedActivity.start_longitude && (
                        <span className="text-xs text-green-600 dark:text-green-400 ml-2 flex-shrink-0">
                          📍 GPS
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-48 sm:h-64 xl:h-80 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🏃‍♂️</div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Select an activity to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MapPlaceholder() {
  const { data } = useActivities({}, 1, 50) // Get more activities for map
  const activities = data?.activities || []

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Activity Map
        </h3>
        <RunningMap activities={activities || []} height={300} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const currentYear = new Date().getFullYear()
  const { data: stats, isLoading, error } = useActivityStats()
  
  // Debug logging
  console.log('Dashboard stats:', stats)
  console.log('Dashboard stats loading:', isLoading)
  console.log('Dashboard stats error:', error)
  
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Welcome back! Here&apos;s an overview of your all-time running activities and recent progress.
          </p>
        </div>

        {/* Stats Grid */}
        <StatsGrid />

        {/* Main Content - Mobile Responsive */}
        <div className="space-y-8">
          {/* Recent Activities with Integrated Map */}
          <RecentActivitiesWithMap />

          {/* GitHub Style Heatmap - Enhanced */}
          <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <YearAwareHeatmap 
                initialYear={currentYear}
                showYearNavigation={true}
                height={300}
                cellSize={10}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
