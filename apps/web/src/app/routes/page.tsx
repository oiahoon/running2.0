'use client'

import { useMemo, useState } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import { formatPace } from '@/lib/database/models/Activity'
import { RouteTile } from '@/components/routes'
import { inferRouteEffort } from '@/lib/routes'

type RouteFilter = 'all' | 'easy' | 'tempo' | 'long' | 'new' | 'year'

type ActivityLike = {
  id: number
  name?: string
  type?: string
  distance?: number
  moving_time?: number
  total_elevation_gain?: number
  average_speed?: number
  average_heartrate?: number
  start_date?: string
  startDate?: string
  summary_polyline?: string
  summaryPolyline?: string
  location_city?: string
}

const filters: Array<{ id: RouteFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'easy', label: 'Easy' },
  { id: 'tempo', label: 'Tempo' },
  { id: 'long', label: 'Long' },
  { id: 'new', label: 'New Routes' },
  { id: 'year', label: String(new Date().getFullYear()) },
]

function formatDate(value?: string) {
  if (!value) return 'Unknown date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDistanceKm(distanceMeters?: number) {
  return `${(Number(distanceMeters || 0) / 1000).toFixed(1)} km`
}

function routePolyline(activity: ActivityLike) {
  return activity.summary_polyline || activity.summaryPolyline || ''
}

function effortForActivity(activity: ActivityLike) {
  return inferRouteEffort({
    type: activity.type,
    distanceMeters: activity.distance,
    movingTimeSeconds: activity.moving_time,
    averageSpeedMetersPerSecond: activity.average_speed,
    elevationGainMeters: activity.total_elevation_gain,
    averageHeartRate: activity.average_heartrate,
  })
}

export default function RouteWallGalleryPage() {
  const [activeFilter, setActiveFilter] = useState<RouteFilter>('all')
  const currentYear = new Date().getFullYear()
  const { data, isLoading, error } = useActivities({}, 1, 120)
  const activities = useMemo(() => (data?.activities || []) as ActivityLike[], [data?.activities])

  const routeActivities = useMemo(
    () => activities.filter((activity) => routePolyline(activity)),
    [activities]
  )

  const filteredActivities = useMemo(() => {
    return routeActivities.filter((activity, index) => {
      const effort = effortForActivity(activity)
      const startDate = new Date(activity.start_date || activity.startDate || '')
      if (activeFilter === 'all') return true
      if (activeFilter === 'new') return index < 18
      if (activeFilter === 'year') return !Number.isNaN(startDate.getTime()) && startDate.getFullYear() === currentYear
      if (activeFilter === 'tempo') return effort === 'tempo' || effort === 'hard' || effort === 'steady'
      return effort === activeFilter
    })
  }, [activeFilter, currentYear, routeActivities])

  return (
    <div className="space-y-6">
      <section className="panel route-atlas-surface">
        <div className="panel-body py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="route-atlas-label">RUN2 / Route Wall</div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-6xl">Route Wall</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
                Browse the route shapes behind the training log. Every tile is rendered from real synced GPS polyline data.
              </p>
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              {routeActivities.length} route shapes from {activities.length} recent records
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-body">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const active = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={active ? 'action-primary' : 'action-secondary'}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="panel">
          <div className="panel-body text-sm text-[var(--text-muted)]">Drawing route tiles...</div>
        </section>
      ) : null}

      {error ? (
        <section className="panel">
          <div className="panel-body text-sm text-red-300">Failed to load route wall.</div>
        </section>
      ) : null}

      {!isLoading && !error ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredActivities.map((activity) => (
            <RouteTile
              key={activity.id}
              activityId={activity.id}
              title={activity.name || activity.location_city || `${activity.type || 'Run'} route`}
              distanceLabel={formatDistanceKm(activity.distance)}
              dateLabel={formatDate(activity.start_date || activity.startDate)}
              paceLabel={activity.average_speed ? formatPace(activity.average_speed) : undefined}
              effort={effortForActivity(activity)}
              route={{ encodedPolyline: routePolyline(activity) }}
            />
          ))}
        </section>
      ) : null}

      {!isLoading && !error && filteredActivities.length === 0 ? (
        <section className="panel">
          <div className="panel-body rounded-2xl border border-dashed border-[var(--line)] text-center text-sm text-[var(--text-muted)]">
            No route shapes match this filter yet.
          </div>
        </section>
      ) : null}
    </div>
  )
}
