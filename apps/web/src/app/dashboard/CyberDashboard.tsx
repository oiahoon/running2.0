'use client'

import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useActivityStats, useRecentActivities } from '@/lib/hooks/useActivities'
import { formatDuration, formatPace } from '@/lib/database/models/Activity'
import { RouteTile } from '@/components/routes'
import { useI18n } from '@/lib/i18n'
import { runnerMuses } from '@/lib/runnerMuses'
import {
  RouteData,
  getEffortColor,
  inferRouteEffort,
  normalizeRoute,
  pointsToPath,
  resolveRoutePoints,
  samplePoints,
} from '@/lib/routes'

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

function formatDate(value: string | undefined, dateLocale: string, unknownLabel: string) {
  if (!value) return unknownLabel
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return unknownLabel
  return date.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })
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

const constellationColors = [
  'var(--route-green)',
  'var(--route-cyan)',
  'var(--route-lime)',
  'var(--route-purple)',
  'var(--route-orange)',
  'var(--route-red)',
]
const SHORTCUT_MUSES = [runnerMuses.sayakaSato, runnerMuses.nozomiTanaka, runnerMuses.seiraFuwa]

function AnimatedRouteConstellation({
  activities,
  noShapeLabel,
  ariaLabel,
  width = 760,
  height = 560,
}: {
  activities: ActivityLike[]
  noShapeLabel: string
  ariaLabel: string
  width?: number
  height?: number
}) {
  const animatedRoutes = useMemo(
    () =>
      activities
        .filter((activity) => resolvePolyline(activity))
        .slice(0, 14)
        .map((activity, index) => {
          const route = routeForActivity(activity)
          const points = samplePoints(resolveRoutePoints(route), 420)
          const path = pointsToPath(normalizeRoute(points, width, height, 54))
          const effortColor = getEffortColor(effortForActivity(activity))

          return {
            id: activity.id,
            path,
            title: activity.name || `${activity.type || 'Run'} route`,
            color: constellationColors[index % constellationColors.length] || effortColor,
            effortColor,
          }
        })
        .filter((route) => route.path.length > 0),
    [activities, height, width]
  )

  const cycleSeconds = Math.max(animatedRoutes.length * 1.15, 7)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className="block h-full w-full overflow-hidden"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect width={width} height={height} rx="18" fill="rgba(7,10,12,0.58)" />
      <g opacity="0.8">
        {Array.from({ length: Math.floor(width / 24) + 1 }, (_, index) => (
          <line key={`vx-${index}`} x1={index * 24} y1={0} x2={index * 24} y2={height} stroke="rgba(139,154,147,0.12)" strokeWidth="1" />
        ))}
        {Array.from({ length: Math.floor(height / 24) + 1 }, (_, index) => (
          <line key={`hy-${index}`} x1={0} y1={index * 24} x2={width} y2={index * 24} stroke="rgba(139,154,147,0.12)" strokeWidth="1" />
        ))}
      </g>

      {animatedRoutes.length > 0 ? (
        <>
          <g>
            {animatedRoutes.map((route, index) => (
              <path
                key={`ghost-${route.id}-${index}`}
                d={route.path}
                fill="none"
                stroke={route.effortColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                opacity="0.18"
              />
            ))}
          </g>
          <g>
            {animatedRoutes.map((route, index) => {
              const animationStyle = {
                '--route-cycle': `${cycleSeconds}s`,
                '--route-delay': `${index * 1.15}s`,
                color: route.color,
              } as CSSProperties

              return (
                <g key={`active-${route.id}-${index}`} style={animationStyle}>
                  <path
                    d={route.path}
                    fill="none"
                    stroke={route.color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    vectorEffect="non-scaling-stroke"
                    className="route-constellation-glow"
                  />
                  <path
                    d={route.path}
                    fill="none"
                    stroke={route.color}
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    vectorEffect="non-scaling-stroke"
                    className="route-constellation-runner"
                  >
                    <title>{route.title}</title>
                  </path>
                </g>
              )
            })}
          </g>
        </>
      ) : (
        <g>
          <path
            d={`M ${width * 0.22} ${height * 0.58} C ${width * 0.34} ${height * 0.34}, ${width * 0.48} ${height * 0.7}, ${width * 0.62} ${height * 0.46} S ${width * 0.82} ${height * 0.48}, ${width * 0.78} ${height * 0.65}`}
            fill="none"
            stroke="rgba(139,154,147,0.5)"
            strokeDasharray="6 10"
            strokeLinecap="round"
            strokeWidth="5"
          />
          <text x={width / 2} y={height / 2 + 42} textAnchor="middle" fill="rgba(238,244,233,0.62)" fontSize="13" fontWeight="600">
            {noShapeLabel}
          </text>
        </g>
      )}
    </svg>
  )
}

function LoadingRouteWall() {
  const { t } = useI18n()

  return (
    <div className="space-y-6">
      <section className="panel route-atlas-surface overflow-hidden">
        <div className="panel-body grid min-h-[520px] place-items-center">
          <div className="text-center">
            <div className="route-atlas-label">{t('dashboard.loadingLabel')}</div>
            <p className="mt-3 text-lg text-[var(--text-muted)]">{t('dashboard.loadingCopy')}</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export function CyberDashboard() {
  const { t, dateLocale } = useI18n()
  const currentYear = new Date().getFullYear()
  const { data: statsData, isLoading: statsLoading } = useActivityStats(currentYear)
  const { data: recentActivities = [], isLoading: recentLoading } = useRecentActivities(36)

  const routeActivities = useMemo(
    () => (recentActivities as ActivityLike[]).filter((activity) => resolvePolyline(activity)).slice(0, 14),
    [recentActivities]
  )

  const latestActivity = (recentActivities as ActivityLike[])[0]

  const basicStats = statsData?.basicStats
  const records = statsData?.personalRecords
  const totalDistanceKm = Number(basicStats?.total_distance || 0)
  const runCount = Number(basicStats?.total_activities || 0)
  const routeCount = routeActivities.length
  const longestRunMeters = Number(records?.longestRun?.distance || 0)
  const latestPace = latestActivity?.average_speed ? formatPace(latestActivity.average_speed) : '--:--/km'
  const latestLocation = latestActivity?.location_city || latestActivity?.locationCity || t('page.routes.title')

  if (statsLoading || recentLoading) {
    return <LoadingRouteWall />
  }

  return (
    <div className="space-y-6">
      <section className="panel route-atlas-surface overflow-hidden">
        <div className="grid min-h-[620px] grid-cols-1 gap-6 p-5 lg:grid-cols-[0.88fr_1.12fr] lg:p-7">
          <div className="relative flex flex-col justify-between gap-8 overflow-hidden">
            <div className="relative z-10">
              <div className="route-atlas-label">{t('dashboard.kicker')}</div>
              <h1 className="mt-5 max-w-[720px] text-[clamp(56px,8vw,112px)] font-black leading-[0.92] tracking-tight text-[var(--text-strong)]">
                {t('dashboard.headline')}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[var(--text-muted)] sm:text-lg">
                {t('dashboard.copy')}
              </p>
              <div className="mt-6 hidden min-h-40 items-end justify-between gap-4 rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-5 pt-4 sm:flex">
                <div className="max-w-[18rem] pb-4">
                  <div className="route-atlas-label">{t('runnerMuses.kicker')}</div>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{t('runnerMuses.copy')}</p>
                </div>
                <Image
                  src={runnerMuses.seiraFuwa.src}
                  alt=""
                  width={768}
                  height={768}
                  priority
                  className="h-40 w-32 shrink-0 object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.24)]"
                />
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-3">
              <StatPill label={t('dashboard.yearDistance', { year: currentYear })} value={`${totalDistanceKm.toFixed(1)} km`} />
              <StatPill label={t('dashboard.runs')} value={runCount} />
              <StatPill label={t('dashboard.recentRoutes')} value={routeCount} sublabel={t('dashboard.withGpsShape')} />
              <StatPill label={t('dashboard.longest')} value={longestRunMeters > 0 ? formatDistanceKm(longestRunMeters) : '--'} />
            </div>
          </div>

          <div className="flex min-h-[420px] flex-col gap-4">
            <div className="relative flex-1 overflow-hidden rounded-3xl border border-[var(--line)] bg-[rgba(7,10,12,0.72)]">
              <AnimatedRouteConstellation
                activities={routeActivities}
                noShapeLabel={t('route.noShape')}
                ariaLabel={t('dashboard.latestConstellation')}
              />
              <div className="pointer-events-none absolute left-5 top-5 rounded-full border border-[var(--line)] bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {t('dashboard.latestConstellation')}
              </div>
              <div className="pointer-events-none absolute bottom-5 right-5 rounded-full border border-[var(--line)] bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {t('dashboard.liveTraces', { count: routeActivities.length })}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              {latestActivity ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="route-atlas-label">{t('dashboard.latest')}</div>
                    <div className="mt-1 truncate text-lg font-semibold text-[var(--text-strong)]">{latestActivity.name || t('dashboard.untitledRun')}</div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">
                      {formatDate(latestActivity.start_date || latestActivity.startDate, dateLocale, t('common.unknownDate'))} · {latestLocation} · {String(effortForActivity(latestActivity)).toUpperCase()}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-right text-sm tabular-nums">
                    <div>
                      <div className="route-atlas-label">{t('common.distance')}</div>
                      <div className="mt-1 font-semibold text-[var(--text-strong)]">{formatDistanceKm(latestActivity.distance)}</div>
                    </div>
                    <div>
                      <div className="route-atlas-label">{t('common.pace')}</div>
                      <div className="mt-1 font-semibold text-[var(--text-strong)]">{latestPace}</div>
                    </div>
                    <div>
                      <div className="route-atlas-label">{t('common.time')}</div>
                      <div className="mt-1 font-semibold text-[var(--text-strong)]">{formatDuration(latestActivity.moving_time)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="route-atlas-label">{t('dashboard.noRoutesYet')}</div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{t('dashboard.noRoutesCopy')}</p>
                  </div>
                  <Link href="/sync" className="action-primary">{t('dashboard.syncSource')}</Link>
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
              <h2 className="text-lg font-semibold text-[var(--text-strong)]">{t('dashboard.recentShapes')}</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{t('dashboard.recentShapesCopy')}</p>
            </div>
            <Link href="/routes" className="action-secondary shrink-0">{t('dashboard.openGallery')}</Link>
          </div>
          <div className="panel-body">
            {routeActivities.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {routeActivities.slice(0, 6).map((activity) => (
                  <RouteTile
                    key={activity.id}
                    activityId={activity.id}
                    title={activity.name || `${activity.type || t('activity.type.Run')} route`}
                    distanceLabel={formatDistanceKm(activity.distance)}
                    dateLabel={formatDate(activity.start_date || activity.startDate, dateLocale, t('common.unknownDate'))}
                    paceLabel={activity.average_speed ? formatPace(activity.average_speed) : undefined}
                    effort={effortForActivity(activity)}
                    route={routeForActivity(activity)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-center text-[var(--text-muted)]">
                {t('dashboard.emptyRouteWall')}
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="text-lg font-semibold text-[var(--text-strong)]">{t('dashboard.shortcuts')}</h2>
          </div>
          <div className="panel-body grid gap-2">
            <div className="mb-3 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-4">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0 pb-1">
                  <div className="route-atlas-label">{t('runnerMuses.kicker')}</div>
                  <p className="mt-2 text-sm leading-5 text-[var(--text-muted)]">{t('runnerMuses.copy')}</p>
                </div>
                <Image
                  src={runnerMuses.shieriDrury.src}
                  alt=""
                  width={768}
                  height={768}
                  loading="eager"
                  className="h-28 w-24 shrink-0 object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.22)]"
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {SHORTCUT_MUSES.map((runner) => (
                  <div
                    key={runner.src}
                    className="grid aspect-[4/3] min-h-0 place-items-center overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg)]"
                  >
                    <Image
                      src={runner.src}
                      alt=""
                      width={768}
                      height={768}
                      loading="eager"
                      className="h-[92%] w-[92%] object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.18)]"
                    />
                  </div>
                ))}
              </div>
            </div>
            <Link href="/activities" className="action-secondary justify-start">{t('dashboard.browseRuns')}</Link>
            <Link href="/routes" className="action-secondary justify-start">{t('dashboard.openGallery')}</Link>
            <Link href="/posters" className="action-secondary justify-start">{t('dashboard.generatePosters')}</Link>
            <Link href="/stats" className="action-secondary justify-start">{t('dashboard.openStatsLab')}</Link>
            <Link href="/map" className="action-secondary justify-start">{t('dashboard.inspectRouteMap')}</Link>
            <Link href="/sync" className="action-primary justify-start">{t('dashboard.syncLatestData')}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
