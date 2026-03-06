'use client'

import { useMemo, useState } from 'react'
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel">
      <div className="panel-body">
        <div className="metric-label">{label}</div>
        <div className="mt-2 text-xl font-semibold text-white">{value}</div>
      </div>
    </div>
  )
}

export default function MapPage() {
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>(getDefaultActivityTypes() as ActivityType[])
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({})
  const [viewMode, setViewMode] = useState<ViewMode>('waterfall')

  const { data, isLoading, error } = useActivities(
    {
      type: selectedTypes.length > 0 ? selectedTypes : undefined,
      startDate: dateRange.start,
      endDate: dateRange.end,
    },
    1,
    500
  )

  const activities: Activity[] = data?.activities || []
  const activitiesWithLocation = activities.filter((activity: Activity) => activity.start_latitude && activity.start_longitude)
  const availableTypes = [...new Set(activities.map((a: Activity) => a.type))].sort()

  const sourceSummary = useMemo(() => {
    const totalDistanceMeters = activities.reduce((sum: number, a: Activity) => sum + (a.distance || 0), 0)
    const totalTimeSeconds = activities.reduce((sum: number, a: Activity) => sum + (a.moving_time || 0), 0)
    return {
      totalDistanceMeters,
      totalTimeSeconds,
    }
  }, [activities])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <section className="panel">
          <div className="panel-body py-6 sm:py-7">
            <h2 className="section-title">Route Intelligence</h2>
            <p className="section-subtitle">Loading routes and trajectory data...</p>
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <section className="panel">
          <div className="panel-body py-6 sm:py-7">
            <h2 className="section-title">Route Intelligence</h2>
            <p className="mt-2 text-sm text-red-300">Failed to load map data.</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="panel-body py-6 sm:py-7">
          <h2 className="section-title">Route Intelligence</h2>
          <p className="section-subtitle">Switch between map and gallery review, then narrow by date and activity type to inspect route behavior.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="panel xl:col-span-3">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-white">Exploration Workflow</h3>
          </div>
          <div className="panel-body grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">View</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setViewMode('map')} className={viewMode === 'map' ? 'action-primary !py-2 !px-2' : 'action-secondary !py-2 !px-2'}>Map</button>
                <button onClick={() => setViewMode('waterfall')} className={viewMode === 'waterfall' ? 'action-primary !py-2 !px-2' : 'action-secondary !py-2 !px-2'}>Gallery</button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Activity Types</label>
              <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-white/15 bg-white/5 p-2.5">
                {availableTypes.map((type: ActivityType) => {
                  const config = getActivityConfig(type)
                  return (
                    <label key={type} className="flex items-center gap-2 text-sm text-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedTypes([...selectedTypes, type])
                          else setSelectedTypes(selectedTypes.filter((t) => t !== type))
                        }}
                        className="rounded border-white/20 bg-transparent"
                      />
                      <span>
                        {config.icon} {config.displayName}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Start</label>
              <input
                type="date"
                value={dateRange.start?.toISOString().split('T')[0] || ''}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value ? new Date(e.target.value) : undefined })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">End</label>
              <input
                type="date"
                value={dateRange.end?.toISOString().split('T')[0] || ''}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value ? new Date(e.target.value) : undefined })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
          <div className="px-5 pb-4">
            <button
              onClick={() => {
                setSelectedTypes(getDefaultActivityTypes() as ActivityType[])
                setDateRange({})
              }}
              className="action-secondary"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <Metric label="Activities" value={String(activities.length)} />
          <Metric label="With GPS" value={String(activitiesWithLocation.length)} />
          <Metric label="Distance" value={formatDistance(sourceSummary.totalDistanceMeters)} />
          <Metric label="Duration" value={formatDuration(sourceSummary.totalTimeSeconds)} />
        </div>
      </section>

      {viewMode === 'map' ? (
        <section className="panel overflow-hidden">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-white">Spatial Review</h3>
          </div>
          <div className="panel-body">
            <RunningMap activities={activitiesWithLocation} height={620} showControls={true} defaultView="single" />
          </div>
        </section>
      ) : (
        <section className="panel overflow-hidden">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-white">Route Gallery</h3>
          </div>
          <div className="panel-body">
            <WaterfallMapView
              key={`${JSON.stringify(selectedTypes)}-${dateRange.start}-${dateRange.end}`}
              filters={{ type: selectedTypes.length > 0 ? selectedTypes : undefined, startDate: dateRange.start, endDate: dateRange.end }}
            />
          </div>
        </section>
      )}
    </div>
  )
}
