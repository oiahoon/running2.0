'use client'

import { useState } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import RunningMap from '@/components/maps/RunningMap'
import WaterfallMapView from '@/components/maps/WaterfallMapView'
import { formatDistance, formatDuration, ActivityType } from '@/lib/database/models/Activity'
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
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>(getDefaultActivityTypes() as ActivityType[])
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({})
  const [viewMode, setViewMode] = useState<ViewMode>('waterfall')

  const { data, isLoading, error } = useActivities({
    type: selectedTypes.length > 0 ? selectedTypes : undefined,
    startDate: dateRange.start,
    endDate: dateRange.end,
  }, 1, 500)

  const activities: Activity[] = data?.activities || []
  const activitiesWithLocation = activities.filter((activity: Activity) => activity.start_latitude && activity.start_longitude)
  const availableTypes = [...new Set(activities.map((a: Activity) => a.type))].sort()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">Map</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Loading routes...</p>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">Map</h1>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">Failed to load map data.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Map</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Explore routes and trajectories with simple filters.
        </p>
      </section>

      <section className="panel">
        <div className="panel-body grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">View</label>
            <div className="flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => setViewMode('map')}
                className={`flex-1 px-3 py-2 text-sm ${viewMode === 'map' ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-white dark:bg-gray-800'}`}
              >
                Map
              </button>
              <button
                onClick={() => setViewMode('waterfall')}
                className={`flex-1 px-3 py-2 text-sm ${viewMode === 'waterfall' ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-white dark:bg-gray-800'}`}
              >
                Gallery
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">Type</label>
            <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border border-gray-200 p-2 dark:border-gray-700">
              {availableTypes.map((type: ActivityType) => {
                const config = getActivityConfig(type)
                return (
                  <label key={type} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTypes([...selectedTypes, type])
                        else setSelectedTypes(selectedTypes.filter(t => t !== type))
                      }}
                      className="rounded border-gray-300"
                    />
                    <span>{config.icon} {config.displayName}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">Start Date</label>
            <input
              type="date"
              value={dateRange.start?.toISOString().split('T')[0] || ''}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value ? new Date(e.target.value) : undefined })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">End Date</label>
            <input
              type="date"
              value={dateRange.end?.toISOString().split('T')[0] || ''}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value ? new Date(e.target.value) : undefined })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedTypes(getDefaultActivityTypes() as ActivityType[])
                setDateRange({})
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel"><div className="panel-body"><div className="metric-label">Total Activities</div><div className="metric-value mt-2">{activities.length}</div></div></div>
        <div className="panel"><div className="panel-body"><div className="metric-label">With GPS</div><div className="metric-value mt-2">{activitiesWithLocation.length}</div></div></div>
        <div className="panel"><div className="panel-body"><div className="metric-label">Total Distance</div><div className="metric-value mt-2">{formatDistance(activities.reduce((sum: number, a: Activity) => sum + (a.distance || 0), 0))}</div></div></div>
        <div className="panel"><div className="panel-body"><div className="metric-label">Total Time</div><div className="metric-value mt-2">{formatDuration(activities.reduce((sum: number, a: Activity) => sum + (a.moving_time || 0), 0))}</div></div></div>
      </section>

      {viewMode === 'map' ? (
        <section className="panel">
          <div className="panel-body">
            <RunningMap activities={activitiesWithLocation} height={600} showControls={true} defaultView="single" />
          </div>
        </section>
      ) : (
        <WaterfallMapView
          key={`${JSON.stringify(selectedTypes)}-${dateRange.start}-${dateRange.end}`}
          filters={{ type: selectedTypes.length > 0 ? selectedTypes : undefined, startDate: dateRange.start, endDate: dateRange.end }}
        />
      )}
    </div>
  )
}
