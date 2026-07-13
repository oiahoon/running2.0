'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowTopRightOnSquareIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  HeartIcon,
  MapIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'
import { RouteGlyph } from '@/components/routes'
import { useActivityStats, useRecentActivities } from '@/lib/hooks/useActivities'
import { formatDuration, formatPace } from '@/lib/database/models/Activity'
import { useI18n } from '@/lib/i18n'
import { runnerMuseCameos } from '@/lib/runnerMuses'
import { getEffortColor, inferRouteEffort } from '@/lib/routes'

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

type RouteFilter = 'all' | 'easy' | 'tempo' | 'long' | 'new'

const filters: Array<{ value: RouteFilter; labelKey: string }> = [
  { value: 'all', labelKey: 'common.all' },
  { value: 'easy', labelKey: 'dashboard.filterEasy' },
  { value: 'tempo', labelKey: 'dashboard.filterTempo' },
  { value: 'long', labelKey: 'dashboard.filterLong' },
  { value: 'new', labelKey: 'dashboard.filterNew' },
]

function activityDate(activity?: ActivityLike) {
  return activity?.start_date_local || activity?.start_date || activity?.startDate
}

function parsedYear(activity: ActivityLike) {
  const value = activityDate(activity)
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.getFullYear()
}

function formatActivityDate(value: string | undefined, dateLocale: string, unknownLabel: string) {
  if (!value) return unknownLabel
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return unknownLabel
  return date.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatLedgerDate(value: string | undefined, dateLocale: string, unknownLabel: string) {
  if (!value) return unknownLabel
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return unknownLabel
  const isCjkLocale = dateLocale.startsWith('zh') || dateLocale.startsWith('ja')
  return date.toLocaleDateString(dateLocale, isCjkLocale
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatWeekday(value: string | undefined, dateLocale: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(dateLocale, { weekday: 'short' })
}

function formatDistanceKm(distanceMeters?: number) {
  return `${(Number(distanceMeters || 0) / 1000).toFixed(1)} km`
}

function resolvePolyline(activity?: ActivityLike) {
  return activity?.summary_polyline || activity?.summaryPolyline || ''
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

function LoadingRouteLedger() {
  const { t } = useI18n()

  return (
    <section className="dashboard-ledger-shell min-h-[calc(100vh-7.25rem)]">
      <div className="grid min-h-[620px] place-items-center">
        <div className="text-center">
          <div className="route-atlas-label">{t('dashboard.loadingLabel')}</div>
          <p className="mt-3 text-lg text-[var(--text-muted)]">{t('dashboard.loadingCopy')}</p>
        </div>
      </div>
    </section>
  )
}

function SummaryMetric({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="min-w-0 border-t border-[var(--line)] pt-4">
      <div className="route-atlas-label">{label}</div>
      <div className="mt-2 whitespace-nowrap text-[clamp(1rem,1.3vw,1.3rem)] font-semibold tabular-nums tracking-tight text-[var(--text-strong)]">
        {value}
      </div>
      {note ? <div className="mt-1 text-[10px] text-[var(--text-muted)]">{note}</div> : null}
    </div>
  )
}

function DetailMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapIcon
  label: string
  value: string
}) {
  return (
    <div className="grid grid-cols-[1.25rem_1fr_auto] items-center gap-2 border-t border-[var(--line)] py-3 first:border-t-0">
      <Icon className="h-4 w-4 text-[var(--route-green)]" aria-hidden="true" />
      <span className="route-atlas-label">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-[var(--text-strong)]">{value}</span>
    </div>
  )
}

function TotalMetric({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof MapIcon }) {
  return (
    <div className="min-w-0 border-l border-[var(--line)] px-3 first:border-l-0 first:pl-0 last:pr-0">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 shrink-0 text-[var(--route-green)]" aria-hidden="true" />
        <div className="route-atlas-label truncate">{label}</div>
      </div>
      <div className="mt-2 truncate text-xl font-semibold tabular-nums tracking-tight text-[var(--text-strong)]">{value}</div>
    </div>
  )
}

function DesktopRunnerMuse() {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1280px)')
    const updateVisibility = () => setShouldRender(desktopQuery.matches)
    updateVisibility()
    desktopQuery.addEventListener('change', updateVisibility)
    return () => desktopQuery.removeEventListener('change', updateVisibility)
  }, [])

  if (!shouldRender) return null

  return (
    <Image
      src={runnerMuseCameos.dashboardHero.src}
      alt=""
      width={410}
      height={615}
      sizes="205px"
      loading="eager"
      fetchPriority="high"
      className="hero-runner-float pointer-events-none absolute z-20 hidden object-contain drop-shadow-[0_22px_32px_rgba(0,0,0,0.34)] xl:-bottom-[230px] xl:left-0 xl:block xl:h-[290px] xl:w-[205px]"
    />
  )
}

export function CyberDashboard() {
  const { t, dateLocale } = useI18n()
  const currentYear = new Date().getFullYear()
  const { data: statsData, isLoading: statsLoading } = useActivityStats(currentYear)
  const { data: recentActivities = [], isLoading: recentLoading } = useRecentActivities(100)
  const [activeFilter, setActiveFilter] = useState<RouteFilter>('all')
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null)

  const routeActivities = useMemo(
    () => (recentActivities as ActivityLike[]).filter((activity) => resolvePolyline(activity)),
    [recentActivities]
  )

  const yearOptions = useMemo(() => {
    const years = new Set(routeActivities.map(parsedYear).filter((year): year is number => Boolean(year)))
    years.add(currentYear)
    return Array.from(years).sort((a, b) => b - a)
  }, [currentYear, routeActivities])

  const filteredRoutes = useMemo(() => {
    const inYear = routeActivities.filter((activity) => parsedYear(activity) === selectedYear)
    if (activeFilter === 'all') return inYear
    if (activeFilter === 'new') return inYear.slice(0, 8)
    if (activeFilter === 'tempo') {
      return inYear.filter((activity) => ['tempo', 'hard', 'steady'].includes(effortForActivity(activity)))
    }
    return inYear.filter((activity) => effortForActivity(activity) === activeFilter)
  }, [activeFilter, routeActivities, selectedYear])

  const visibleRoutes = filteredRoutes.slice(0, 5)
  const selectedActivity =
    filteredRoutes.find((activity) => activity.id === selectedActivityId) ||
    filteredRoutes[0]
  const hasRouteActivities = routeActivities.length > 0

  const basicStats = statsData?.basicStats
  const records = statsData?.personalRecords
  const totalDistanceKm = Number(basicStats?.total_distance || 0)
  const runCount = Number(basicStats?.total_activities || 0)
  const routeCount = routeActivities.filter((activity) => parsedYear(activity) === currentYear).length
  const longestRunMeters = Number(records?.longestRun?.distance || 0)
  const totalTime = formatDuration(Number(basicStats?.total_time || 0))
  const totalElevation = `${Math.round(Number(basicStats?.total_elevation || 0))} m`
  const selectedEffort = effortForActivity(selectedActivity)
  const selectedEffortColor = getEffortColor(selectedEffort)
  const selectedLocation = selectedActivity?.location_city || selectedActivity?.locationCity || selectedActivity?.name || t('page.routes.title')
  const selectedActivityLabel = selectedActivity?.name && selectedActivity.name !== selectedLocation
    ? selectedActivity.name
    : t(`dashboard.effort.${selectedEffort}`)
  const todayLabel = new Date().toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })

  function resetRouteFilters() {
    setActiveFilter('all')
    setSelectedYear(parsedYear(routeActivities[0]) || currentYear)
    setSelectedActivityId(null)
  }

  if (statsLoading || recentLoading) return <LoadingRouteLedger />

  return (
    <section className="dashboard-ledger-shell xl:-mx-8 xl:-mb-8 xl:-mt-5">
      <div className="grid min-h-[calc(100vh-4.5rem)] xl:grid-cols-[minmax(0,1.63fr)_minmax(500px,1fr)]">
        <div className="relative min-w-0 px-1 pb-10 pt-3 sm:px-2 lg:px-5 lg:pt-7 xl:px-8">
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(450px,1.15fr)_minmax(330px,0.85fr)]">
            <div>
              <h1 className="dashboard-display-title max-w-[620px] text-[var(--text-strong)]">
                {t('dashboard.headline')}
              </h1>
              <p className="mt-4 max-w-[590px] text-sm leading-6 text-[var(--text-muted)] sm:mt-5 sm:text-base sm:leading-7">
                {t('dashboard.copy')}
              </p>
            </div>

            <div>
              <div className="mb-5 flex items-center justify-between border-b border-[var(--line)] pb-2">
                <span className="font-mono text-xs font-semibold tracking-[0.16em] text-[var(--text-muted)]">{currentYear}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 sm:gap-y-5">
                <SummaryMetric label={t('dashboard.yearDistance', { year: currentYear })} value={`${totalDistanceKm.toFixed(1)} km`} />
                <SummaryMetric label={t('dashboard.runs')} value={runCount} />
                <SummaryMetric label={t('dashboard.recentRoutes')} value={routeCount} note={t('dashboard.withGpsShape')} />
                <SummaryMetric label={t('dashboard.longest')} value={longestRunMeters > 0 ? formatDistanceKm(longestRunMeters) : '—'} />
              </div>
            </div>
          </div>

          <div className="relative mt-6 flex min-h-[500px] flex-col overflow-visible rounded-[18px] border border-[var(--line-strong)] bg-[var(--route-canvas)] sm:mt-8 lg:block">
            {selectedActivity ? (
              <>
                <div className="relative z-10 order-2 w-full border-t border-[var(--line)] p-5 sm:p-6 lg:absolute lg:inset-y-0 lg:left-0 lg:w-[280px] lg:border-b-0 lg:border-r lg:border-t-0">
                  <div className="route-atlas-label text-[var(--route-green)]">{t('dashboard.latestActivity')}</div>
                  <h2 className="mt-4 truncate text-3xl font-semibold tracking-tight text-[var(--text-strong)]">{selectedLocation}</h2>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    {formatActivityDate(activityDate(selectedActivity), dateLocale, t('common.unknownDate'))}
                  </p>
                  <p className="mt-3 text-sm font-semibold capitalize" style={{ color: selectedEffortColor }}>
                    {selectedActivityLabel}
                  </p>

                  <div className="mt-7">
                    <DetailMetric icon={MapIcon} label={t('common.distance')} value={formatDistanceKm(selectedActivity.distance)} />
                    <DetailMetric icon={MapPinIcon} label={t('common.pace')} value={formatPace(selectedActivity.average_speed)} />
                    <DetailMetric icon={ClockIcon} label={t('common.time')} value={formatDuration(selectedActivity.moving_time)} />
                    <DetailMetric icon={ArrowTrendingUpIcon} label={t('stats.elevation')} value={`+${Math.round(Number(selectedActivity.total_elevation_gain || 0))} m`} />
                    <DetailMetric icon={HeartIcon} label={t('activityDetail.heartRate')} value={selectedActivity.average_heartrate ? `${Math.round(selectedActivity.average_heartrate)} bpm` : '—'} />
                  </div>

                  <Link href={`/activities/${selectedActivity.id}`} className="action-secondary mt-5 w-full gap-2">
                    {t('dashboard.viewActivity')}
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>

                <div className="order-1 h-[300px] p-4 sm:h-[390px] sm:p-7 lg:ml-[280px] lg:h-[498px]">
                  <RouteGlyph
                    key={selectedActivity.id}
                    encodedPolyline={resolvePolyline(selectedActivity)}
                    effort={selectedEffort}
                    width={720}
                    height={520}
                    padding={64}
                    maxPoints={420}
                    strokeWidth={6}
                    loop
                    label={`${selectedActivity.name || selectedLocation} ${t('dashboard.routeShape')}`}
                  />
                </div>
              </>
            ) : (
              <div className="grid min-h-[480px] place-items-center px-6 text-center sm:min-h-[560px]">
                <div>
                  <div className="route-atlas-label">{hasRouteActivities ? t('dashboard.noFilterMatches') : t('dashboard.noRoutesYet')}</div>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    {hasRouteActivities ? t('dashboard.noFilterMatchesCopy') : t('dashboard.noRoutesCopy')}
                  </p>
                  {hasRouteActivities ? (
                    <button type="button" onClick={resetRouteFilters} className="action-secondary mt-5">{t('dashboard.clearFilters')}</button>
                  ) : (
                    <Link href="/sync" className="action-primary mt-5">{t('dashboard.syncSource')}</Link>
                  )}
                </div>
              </div>
            )}

            <DesktopRunnerMuse />
          </div>
        </div>

        <aside className="flex min-w-0 flex-col border-t border-[var(--line-strong)] px-1 pb-5 pt-8 sm:px-2 lg:px-5 xl:border-l xl:border-t-0 xl:px-7 xl:pt-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-strong)]">{t('dashboard.recentRoutes')}</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{t('dashboard.recentLedgerCopy')}</p>
            </div>
            <div className="shrink-0 pt-1 text-xs tabular-nums text-[var(--text-muted)]">
              {t('dashboard.showingCount', { shown: visibleRoutes.length, total: filteredRoutes.length })}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => {
                  setActiveFilter(filter.value)
                  setSelectedActivityId(null)
                }}
                className={activeFilter === filter.value ? 'ledger-filter ledger-filter-active' : 'ledger-filter'}
                aria-pressed={activeFilter === filter.value}
              >
                {t(filter.labelKey)}
              </button>
            ))}
            <select
              aria-label={t('common.year')}
              value={selectedYear}
              onChange={(event) => {
                setSelectedYear(Number(event.target.value))
                setSelectedActivityId(null)
              }}
              className="ledger-filter bg-[var(--surface)]"
            >
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>

          <div className="mt-8 hidden grid-cols-[88px_minmax(144px,1fr)_62px_62px_68px] gap-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] md:grid 2xl:grid-cols-[88px_minmax(180px,1fr)_78px_76px_70px] 2xl:gap-3">
            <span>{t('common.date')}</span>
            <span>{t('dashboard.routeColumn')}</span>
            <span className="text-right">{t('common.distance')}</span>
            <span className="text-right">{t('common.pace')}</span>
            <span className="text-right">{t('dashboard.effortColumn')}</span>
          </div>

          <div className="mt-2 min-h-[430px]">
            {visibleRoutes.length > 0 ? visibleRoutes.map((activity) => {
              const effort = effortForActivity(activity)
              const isSelected = selectedActivity?.id === activity.id
              const effortColor = getEffortColor(effort)
              const location = activity.location_city || activity.locationCity
              const routeTitle = location || activity.name || t('dashboard.untitledRun')
              const routeSubtitle = location && activity.name && activity.name !== location
                ? activity.name
                : activity.type
                  ? t(`activity.type.${activity.type}`)
                  : t('dashboard.routeShape')
              return (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => setSelectedActivityId(activity.id)}
                  className={isSelected ? 'route-ledger-row route-ledger-row-active' : 'route-ledger-row'}
                  aria-pressed={isSelected}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs text-[var(--text-strong)]">{formatLedgerDate(activityDate(activity), dateLocale, t('common.unknownDate'))}</span>
                    <span className="mt-1 block text-[11px] text-[var(--text-muted)]">{formatWeekday(activityDate(activity), dateLocale)}</span>
                  </span>
                  <span className="grid min-w-0 grid-cols-[60px_1fr] items-center gap-3">
                    <span className="block h-12 w-[60px] overflow-hidden">
                      <RouteGlyph encodedPolyline={resolvePolyline(activity)} effort={effort} width={96} height={64} padding={8} maxPoints={72} strokeWidth={3} showGrid={false} showGlow={false} animate={false} />
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block truncate text-sm font-semibold text-[var(--text-strong)]">{routeTitle}</span>
                      <span className="mt-1 block truncate text-xs text-[var(--text-muted)]">{routeSubtitle}</span>
                    </span>
                  </span>
                  <span className="text-right text-xs tabular-nums text-[var(--text-strong)]">{formatDistanceKm(activity.distance)}</span>
                  <span className="text-right text-xs tabular-nums text-[var(--text-strong)]">{formatPace(activity.average_speed)}</span>
                  <span className="text-right text-xs font-semibold capitalize" style={{ color: effortColor }}>{t(`dashboard.effort.${effort}`)}</span>
                </button>
              )
            }) : (
              <div className="grid min-h-[320px] place-items-center border-y border-dashed border-[var(--line)] px-6 text-center">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">{t('dashboard.noFilterMatches')}</p>
                  {hasRouteActivities ? (
                    <button type="button" onClick={resetRouteFilters} className="action-secondary mt-4">{t('dashboard.clearFilters')}</button>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto border-y border-[var(--line)] py-6">
            <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-y-0">
              <TotalMetric icon={MapIcon} label={t('dashboard.runs')} value={runCount} />
              <TotalMetric icon={MapPinIcon} label={t('common.distance')} value={`${totalDistanceKm.toFixed(1)} km`} />
              <TotalMetric icon={ClockIcon} label={t('common.time')} value={totalTime} />
              <TotalMetric icon={ArrowTrendingUpIcon} label={t('stats.elevation')} value={totalElevation} />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-5 text-[11px] text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
            <span>{t('dashboard.distanceNote')}</span>
            <span>{t('dashboard.dataAsOf', { date: todayLabel })}</span>
          </div>
        </aside>
      </div>
    </section>
  )
}
