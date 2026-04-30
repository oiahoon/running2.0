'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import { getActivityConfig, shouldShowOnMap } from '@/lib/config/activities'
import { formatDistance, formatDuration, formatPace, ActivityType } from '@/lib/database/models/Activity'
import RunningMap from './RunningMap'
import { ActivityIcon, AtlasIcon } from '@/components/icons/AtlasIcon'
import { useI18n } from '@/lib/i18n'

// Lazy loading component for maps
function LazyRunningMap({ activity, height = 192 }: { activity: Activity; height?: number }) {
  const { t } = useI18n()
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true)
          setHasLoaded(true)
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.1
      }
    )

    const element = elementRef.current

    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [hasLoaded])

  return (
    <div ref={elementRef} className="h-full">
      {isVisible ? (
        <RunningMap
          activities={[activity]}
          height={height}
          showControls={false}
          defaultView="single"
        />
      ) : (
        <div className="h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-500">
            <AtlasIcon name="map" className="mx-auto mb-2 h-7 w-7" />
            <div className="text-sm">{t('map.loadingMap')}</div>
          </div>
        </div>
      )}
    </div>
  )
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
  summary_polyline?: string
}

interface ActivityFilters {
  type?: ActivityType[]
  startDate?: Date
  endDate?: Date
  search?: string
}

interface WaterfallMapViewProps {
  filters?: ActivityFilters
  className?: string
}

export default function WaterfallMapView({ 
  filters = {}, 
  className = '' 
}: WaterfallMapViewProps) {
  const { t, dateLocale } = useI18n()
  const [allActivities, setAllActivities] = useState<Activity[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const pageSize = 20
  const filtersRef = useRef(filters)

  // Create a stable filter key for comparison
  const filterKey = JSON.stringify(filters)
  const prevFilterKeyRef = useRef(filterKey)

  const { data, isLoading, error } = useActivities(filters, currentPage, pageSize)

  // Reset when filters change
  useEffect(() => {
    if (filterKey !== prevFilterKeyRef.current) {
      console.log('Filters changed, resetting state')
      // Filter changes intentionally reset the paged gallery state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(1)
      setAllActivities([])
      setHasMore(true)
      setIsInitialized(false)
      prevFilterKeyRef.current = filterKey
      filtersRef.current = filters
    }
  }, [filterKey, filters])

  // Handle new data - accumulate for infinite scroll with limits
  useEffect(() => {
    if (data?.activities) {
      console.log(`Received ${data.activities.length} activities for page ${currentPage}`)
      
      // Filter activities that have GPS data and should show on map
      const gpsActivities = data.activities.filter((activity: Activity) => 
        shouldShowOnMap(activity.type) && 
        activity.start_latitude && 
        activity.start_longitude &&
        activity.summary_polyline // Only show activities with route data
      )
      
      console.log(`Filtered to ${gpsActivities.length} GPS activities`)
      
      if (currentPage === 1) {
        // Accumulate server pages into a bounded client-side gallery.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAllActivities(gpsActivities)
        setIsInitialized(true)
      } else {
        setAllActivities(prev => {
          // Avoid duplicates and limit total activities to prevent performance issues
          const existingIds = new Set(prev.map(a => a.id))
          const newActivities = gpsActivities.filter((a: Activity) => !existingIds.has(a.id))
          const combined = [...prev, ...newActivities]
          
          // Limit to 100 activities to prevent performance issues
          return combined.slice(0, 100)
        })
      }
      
      // Stop loading more if we have too many activities
      const shouldHaveMore = data.activities.length === pageSize && allActivities.length < 100
      setHasMore(shouldHaveMore)
      setIsLoadingMore(false)
    }
  }, [data, currentPage, allActivities.length])

  // Throttled infinite scroll handler
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading && isInitialized && allActivities.length < 100) {
      console.log('Loading more activities...')
      setIsLoadingMore(true)
      setCurrentPage(prev => prev + 1)
    }
  }, [allActivities.length, isLoadingMore, hasMore, isLoading, isInitialized])

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

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <AtlasIcon name="warning" className="mx-auto mb-2 h-10 w-10" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            {t('map.failedActivities')}
          </h3>
          <p className="text-red-600 dark:text-red-300">
            {error.message}
          </p>
        </div>
      </div>
    )
  }

  if (isLoading && currentPage === 1) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('map.routeGallery')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('map.loadingGps')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (allActivities.length === 0 && !isLoading && isInitialized) {
    return (
      <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center ${className}`}>
        <AtlasIcon name="map" className="mx-auto mb-4 h-12 w-12 text-[var(--route-green)]" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('map.noGpsRoutes')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {t('map.noGpsRoutesCopy')}
        </p>
        <div className="text-sm text-gray-400 dark:text-gray-500">
          <p>{t('map.routesShownFor')}</p>
          <ul className="mt-2 space-y-1">
            <li>• {t('map.requireCoordinates')}</li>
            <li>• {t('map.requirePolyline')}</li>
            <li>• {t('map.requireTypes')}</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('map.routeGallery')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('map.waterfallCopy')}
        </p>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {t('map.showingRoutes', { count: allActivities.length })} {hasMore ? `• ${t('map.scrollMore')}` : ''}
        </div>
      </div>

      {/* Waterfall Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allActivities.map((activity) => {
          const config = getActivityConfig(activity.type)
          
          return (
            <div
              key={activity.id}
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Map */}
              <div className="h-48 relative overflow-hidden">
                <LazyRunningMap
                  activity={activity}
                  height={192}
                />
                
                {/* Activity type badge */}
                <div className="absolute top-3 left-3">
                  <div 
                    className="px-2 py-1 rounded-full text-xs font-medium text-white shadow-lg"
                    style={{ backgroundColor: config.color }}
                  >
                    <ActivityIcon type={config.type} className="h-3.5 w-3.5" /> {t(`activity.type.${config.type}`) === `activity.type.${config.type}` ? config.displayName : t(`activity.type.${config.type}`)}
                  </div>
                </div>
                
                {/* Date badge */}
                <div className="absolute top-3 right-3">
                  <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {new Date(activity.start_date).toLocaleDateString(dateLocale)}
                  </div>
                </div>
              </div>

              {/* Activity Details */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {activity.name}
                </h3>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">{t('common.distance')}</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDistance(activity.distance)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">{t('common.time')}</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDuration(activity.moving_time)}
                    </p>
                  </div>
                  {activity.distance > 0 && activity.moving_time > 0 && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('common.pace')}</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatPace((activity.moving_time / 60) / (activity.distance / 1000))}
                      </p>
                    </div>
                  )}
                  {activity.total_elevation_gain > 0 && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('stats.elevation')}</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {Math.round(activity.total_elevation_gain)}m
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Full date */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.start_date).toLocaleDateString(dateLocale, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>{t('map.loadingMore')}</span>
          </div>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && allActivities.length > 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <AtlasIcon name="finish" className="h-4 w-4" />
            <span>{t('map.seenAll', { count: allActivities.length })}</span>
          </div>
        </div>
      )}
    </div>
  )
}
