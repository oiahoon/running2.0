'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useActivityStats, useRecentActivities } from '@/lib/hooks/useActivities'
import { formatDuration, formatPace } from '@/lib/database/models/Activity'
import { RouteGlyph, RouteTile } from '@/components/routes'
import { RouteData, inferRouteEffort } from '@/lib/routes'

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
  start_date_local?: string
  summary_polyline?: string
  summaryPolyline?: string
  location_city?: string
  locationCity?: string
}

function formatDate(value?: string) {
  if (!value) return 'Unknown date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDistanceKm(distanceMeters?: number) {
  return `${(Number(distanceMeters || 0) / 1000).toFixed(1)} km`
}

function resolvePolyline(activity?: ActivityLike) {
  return activity?.summary_polyline || activity?.summaryPolyline || ''
}

function routeForActivity(activity?: ActivityLike): RouteData | null {
  const encodedPolyline = resolvePolyline(activity)
  return encodedPolyline ? { encodedPolyline } : null
}

function effortForActivity(activity?: ActivityLike) {
  if (!activity) return 'unknown'
  return inferRouteEffort({
    type: activity.type,
    distanceMeters: activity.distance,
    movingTimeSeconds: activity.moving_time,
    averageSpeedMetersPerSecond: activity.average_speed,
    elevationGainMeters: activity.total_elevation_gain,
    averageHeartRate: activity.average_heartrate,
  })
}

function StatPill({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
      <div className="route-atlas-label">{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text-strong)] sm:text-3xl">{value}</div>
      {sublabel ? <div className="mt-1 text-xs text-[var(--text-muted)]">{sublabel}</div> : null}
    </div>
  )
}

function LoadingRouteWall() {
  return (
    <div className="space-y-6">
      <section className="panel route-atlas-surface overflow-hidden">
        <div className="panel-body grid min-h-[520px] place-items-center">
          <div className="text-center">
            <div className="route-atlas-label">Route Wall</div>
            <p className="mt-3 text-lg text-[var(--text-muted)]">Drawing the latest route shapes...</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export function CyberDashboard() {
  const currentYear = new Date().getFullYear()
  const { data: statsData, isLoading: statsLoading } = useActivityStats(currentYear)
  const { data: recentActivities = [], isLoading: recentLoading } = useRecentActivities(18)

  const routeActivities = useMemo(
    () => (recentActivities as ActivityLike[]).filter((activity) => resolvePolyline(activity)).slice(0, 12),
    [recentActivities]
  )

  const latestActivity = (recentActivities as ActivityLike[])[0]
  const latestRouteActivity = routeActivities[0] || latestActivity
  const latestRoute = routeForActivity(latestRouteActivity)
  const ghostRoutes = routeActivities.slice(1, 7).map(routeForActivity)
  const latestEffort = effortForActivity(latestRouteActivity)

  const basicStats = statsData?.basicStats
  const records = statsData?.personalRecords
  const totalDistanceKm = Number(basicStats?.total_distance || 0)
  const runCount = Number(basicStats?.total_activities || 0)
  const routeCount = routeActivities.length
  const longestRunMeters = Number(records?.longestRun?.distance || 0)
  const latestPace = latestActivity?.average_speed ? formatPace(latestActivity.average_speed) : '--:--/km'
  const latestLocation = latestActivity?.location_city || latestActivity?.locationCity || 'Route archive'

  if (statsLoading || recentLoading) {
    return <LoadingRouteWall />
  }

  return (
    <div className="space-y-6">
      <section className="panel route-atlas-surface overflow-hidden">
        <div className="grid min-h-[620px] grid-cols-1 gap-6 p-5 lg:grid-cols-[0.88fr_1.12fr] lg:p-7">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <div className="route-atlas-label">RUN2 / Route Wall</div>
              <h1 className="mt-5 max-w-[720px] text-[clamp(56px,8vw,112px)] font-black leading-[0.92] tracking-tight text-[var(--text-strong)]">
                Every Run Leaves A Shape.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[var(--text-muted)] sm:text-lg">
                Your personal running atlas: routes, effort, pace, elevation, and memories compressed into one visual system.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatPill label={`${currentYear} Distance`} value={`${totalDistanceKm.toFixed(1)} km`} />
              <StatPill label="Runs" value={runCount} />
              <StatPill label="Recent Routes" value={routeCount} sublabel="with GPS shape" />
              <StatPill label="Longest" value={longestRunMeters > 0 ? formatDistanceKm(longestRunMeters) : '--'} />
            </div>
          </div>

          <div className="flex min-h-[420px] flex-col gap-4">
            <div className="relative flex-1 overflow-hidden rounded-3xl border border-[var(--line)] bg-[rgba(7,10,12,0.72)]">
              <RouteGlyph
                route={latestRoute}
                ghostRoutes={ghostRoutes}
                effort={latestEffort}
                width={760}
                height={560}
                padding={54}
                strokeWidth={7}
                maxPoints={520}
                label={`${latestRouteActivity?.name || 'Latest'} route constellation`}
              />
              <div className="pointer-events-none absolute left-5 top-5 rounded-full border border-[var(--line)] bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Latest constellation
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              {latestActivity ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="route-atlas-label">Latest</div>
                    <div className="mt-1 truncate text-lg font-semibold text-[var(--text-strong)]">{latestActivity.name || 'Untitled run'}</div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">
                      {formatDate(latestActivity.start_date || latestActivity.startDate)} · {latestLocation} · {String(effortForActivity(latestActivity)).toUpperCase()}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-right text-sm tabular-nums">
                    <div>
                      <div className="route-atlas-label">Distance</div>
                      <div className="mt-1 font-semibold text-[var(--text-strong)]">{formatDistanceKm(latestActivity.distance)}</div>
                    </div>
                    <div>
                      <div className="route-atlas-label">Pace</div>
                      <div className="mt-1 font-semibold text-[var(--text-strong)]">{latestPace}</div>
                    </div>
                    <div>
                      <div className="route-atlas-label">Time</div>
                      <div className="mt-1 font-semibold text-[var(--text-strong)]">{formatDuration(latestActivity.moving_time)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="route-atlas-label">No routes yet</div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Connect a source to start drawing your running atlas.</p>
                  </div>
                  <Link href="/sync" className="action-primary">Sync Source</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="panel">
          <div className="panel-header flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-strong)]">Recent Route Shapes</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">A quick wall of real GPS shapes from the latest synced activities.</p>
            </div>
            <Link href="/routes" className="action-secondary shrink-0">Open Gallery</Link>
          </div>
          <div className="panel-body">
            {routeActivities.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {routeActivities.slice(0, 6).map((activity) => (
                  <RouteTile
                    key={activity.id}
                    activityId={activity.id}
                    title={activity.name || `${activity.type || 'Run'} route`}
                    distanceLabel={formatDistanceKm(activity.distance)}
                    dateLabel={formatDate(activity.start_date || activity.startDate)}
                    paceLabel={activity.average_speed ? formatPace(activity.average_speed) : undefined}
                    effort={effortForActivity(activity)}
                    route={routeForActivity(activity)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-center text-[var(--text-muted)]">
                No route shapes are available yet. Sync Strava or import route data to fill the wall.
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="text-lg font-semibold text-[var(--text-strong)]">Atlas Shortcuts</h2>
          </div>
          <div className="panel-body grid gap-2">
            <Link href="/activities" className="action-secondary justify-start">Browse Runs</Link>
            <Link href="/routes" className="action-secondary justify-start">Open Route Gallery</Link>
            <Link href="/posters" className="action-secondary justify-start">Generate Posters</Link>
            <Link href="/stats" className="action-secondary justify-start">Open Stats Lab</Link>
            <Link href="/map" className="action-secondary justify-start">Inspect Route Map</Link>
            <Link href="/sync" className="action-primary justify-start">Sync Latest Data</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
