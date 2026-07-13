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
  const [shouldLoad, setShouldLoad] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.1
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={elementRef} className="h-full">
      {shouldLoad ? (
        <RunningMap
          activities={[activity]}
          height={height}
          showControls={false}
          defaultView="single"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-[var(--route-canvas)]">
          <div className="text-[var(--text-muted)]">
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
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)

  // Create a stable filter key for comparison
  const filterKey = JSON.stringify(filters)
  const prevFilterKeyRef = useRef(filterKey)

  const { data, isLoading, error } = useActivities(filters, currentPage, pageSize)

  // Reset when filters change
  useEffect(() => {
    if (filterKey !== prevFilterKeyRef.current) {
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
      // Filter activities that have GPS data and should show on map
      const gpsActivities = data.activities.filter((activity: Activity) => 
        shouldShowOnMap(activity.type) && 
        activity.start_latitude && 
        activity.start_longitude &&
        activity.summary_polyline // Only show activities with route data
      )
      
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
      setIsLoadingMore(true)
      setCurrentPage(prev => prev + 1)
    }
  }, [allActivities.length, isLoadingMore, hasMore, isLoading, isInitialized])

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current
    if (!trigger) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { rootMargin: '1000px 0px' }
    )
    observer.observe(trigger)
    return () => observer.disconnect()
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
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)] motion-reduce:animate-none">
              <div className="h-48 bg-[var(--bg-2)]"></div>
              <div className="p-4">
                <div className="mb-2 h-4 w-3/4 rounded bg-[var(--bg-2)]"></div>
                <div className="h-3 w-1/2 rounded bg-[var(--bg-2)]"></div>
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allActivities.map((activity) => {
          const config = getActivityConfig(activity.type)
          
          return (
            <div
              key={activity.id}
              className="route-gallery-card group overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)] transition-[border-color,background-color] hover:border-[var(--route-green)] hover:bg-[var(--surface-raised)]"
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
                <h3 className="mb-2 truncate font-medium text-[var(--text-strong)] transition-colors group-hover:text-[var(--route-green)]">
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
                        {formatPace(activity.distance / activity.moving_time)}
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

      <div ref={loadMoreTriggerRef} className="h-px" aria-hidden="true" />

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
