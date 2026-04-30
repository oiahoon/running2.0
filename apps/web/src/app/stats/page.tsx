'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useActivityStats, useActivities } from '@/lib/hooks/useActivities'
import { formatDuration } from '@/lib/database/models/Activity'
import { RouteGlyph } from '@/components/routes'
import { inferRouteEffort } from '@/lib/routes'
import { useI18n } from '@/lib/i18n'

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
}

type MonthlyStat = {
  month: string
  activities: number
  distance: number
  time: number
}

type DailyStat = {
  date: string
  activities: number
  distance: number
  duration: number
}

const effortOrder = ['recovery', 'easy', 'steady', 'tempo', 'long', 'hard', 'unknown']

function formatDistanceKm(valueKm?: number) {
  return `${Number(valueKm || 0).toFixed(1)} km`
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function monthLabel(month: string, fallbackIndex: number, dateLocale: string) {
  const parsed = new Date(`${month}-01T00:00:00`)
  if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString(dateLocale, { month: 'short' })
  return new Date(0, fallbackIndex).toLocaleDateString(dateLocale, { month: 'short' })
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

function LabPanel({ title, copy, children }: { title: string; copy: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="text-lg font-semibold text-[var(--text-strong)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{copy}</p>
      </div>
      <div className="panel-body">{children}</div>
    </section>
  )
}

function DistanceField({ data, dateLocale }: { data: MonthlyStat[]; dateLocale: string }) {
  const maxDistance = Math.max(...data.map((item) => item.distance), 1)
  return (
    <div className="flex h-72 items-end gap-2">
      {data.map((item, index) => (
        <div key={item.month || index} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
          <div className="flex flex-1 items-end rounded-t-xl bg-[var(--bg)] px-1">
            <div
              className="w-full rounded-t-lg bg-[linear-gradient(180deg,var(--route-green),var(--route-cyan))]"
              style={{ height: `${Math.max((item.distance / maxDistance) * 100, item.distance > 0 ? 8 : 1)}%` }}
              title={`${monthLabel(item.month, index, dateLocale)} ${formatDistanceKm(item.distance)}`}
            />
          </div>
          <div className="truncate text-center text-[10px] uppercase text-[var(--text-muted)]">{monthLabel(item.month, index, dateLocale)}</div>
        </div>
      ))}
    </div>
  )
}

function EffortMix({ activities }: { activities: ActivityLike[] }) {
  const items = effortOrder
    .map((effort) => {
      const matching = activities.filter((activity) => effortForActivity(activity) === effort)
      const distanceKm = matching.reduce((sum, activity) => sum + Number(activity.distance || 0) / 1000, 0)
      return { effort, count: matching.length, distanceKm }
    })
    .filter((item) => item.count > 0)

  const total = Math.max(items.reduce((sum, item) => sum + item.distanceKm, 0), 1)

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.effort}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium capitalize text-[var(--text-strong)]">{item.effort}</span>
            <span className="text-[var(--text-muted)]">{formatDistanceKm(item.distanceKm)} · {item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--bg)]">
            <div className="h-full rounded-full bg-[var(--route-green)]" style={{ width: `${(item.distanceKm / total) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ConsistencyHeatmap({ data, year, dateLocale }: { data: DailyStat[]; year: number; dateLocale: string }) {
  const { t } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)
  const maxDistance = Math.max(...data.map((item) => item.distance), 1)
  const byDate = new Map(data.map((item) => [item.date, item]))
  const today = new Date()
  const currentYear = today.getFullYear()
  const startDate = new Date(Date.UTC(year, 0, 1))
  const endDate = new Date(Date.UTC(year, 11, 31))
  const firstSunday = new Date(startDate)
  firstSunday.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay())
  const lastSaturday = new Date(endDate)
  lastSaturday.setUTCDate(endDate.getUTCDate() + (6 - endDate.getUTCDay()))
  const activeDate = year === currentYear ? today : endDate
  const visibleEndDate = year === currentYear && activeDate < endDate ? activeDate : endDate
  const dayCount = Math.round((lastSaturday.getTime() - firstSunday.getTime()) / 86400000) + 1
  const columnCount = Math.ceil(dayCount / 7)
  const cellSize = 14
  const cellGap = 4
  const heatmapWidth = columnCount * cellSize + (columnCount - 1) * cellGap
  const activeColumn = Math.max(0, Math.floor((activeDate.getTime() - firstSunday.getTime()) / 86400000 / 7))
  const cells = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(lastSaturday)
    date.setTime(firstSunday.getTime())
    date.setUTCDate(firstSunday.getUTCDate() + index)
    const key = dateKey(date)
    const day = byDate.get(key) || { date: key, activities: 0, distance: 0, duration: 0 }
    const isOutsideYear = date.getUTCFullYear() !== year
    return {
      ...day,
      column: Math.floor(index / 7),
      dayOfWeek: date.getUTCDay(),
      isDimmed: isOutsideYear || date > visibleEndDate,
      month: date.toLocaleDateString(dateLocale, { month: 'short', timeZone: 'UTC' }),
    }
  })
  const monthLabels = cells.reduce<Array<{ month: string; column: number }>>((labels, day) => {
    if (day.dayOfWeek !== 0) return labels
    const previous = labels.at(-1)
    if (previous?.month === day.month || (previous && day.column - previous.column < 3)) return labels
    labels.push({ month: day.month, column: day.column })
    return labels
  }, [])
  const weekdayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    const cellPitch = cellSize + cellGap
    const target = activeColumn * cellPitch - node.clientWidth + 160
    node.scrollLeft = Math.max(target, 0)
  }, [activeColumn])

  return (
    <div className="space-y-3">
      <div ref={scrollRef} className="w-full overflow-x-auto pb-2">
        <div className="grid min-w-full w-fit grid-cols-[2rem_auto] gap-x-2 gap-y-1">
          <div />
          <div
            className="relative h-4 text-[10px] text-[var(--text-muted)]"
            style={{ width: heatmapWidth }}
          >
            {monthLabels.map((label) => (
              <span
                key={`${label.month}-${label.column}`}
                className="absolute top-0"
                style={{ left: label.column * (cellSize + cellGap) }}
              >
                {label.month}
              </span>
            ))}
          </div>
          <div
            className="grid gap-1 text-right text-[10px] leading-none text-[var(--text-muted)]"
            style={{ gridTemplateRows: 'repeat(7, 0.875rem)' }}
          >
            {weekdayLabels.map((label, index) => (
              <div key={index} className="flex items-center justify-end">{label}</div>
            ))}
          </div>
          <div
            className="grid grid-flow-col gap-1"
            style={{
              gridTemplateColumns: `repeat(${columnCount}, ${cellSize}px)`,
              gridTemplateRows: `repeat(7, ${cellSize}px)`,
            }}
          >
            {cells.map((day) => {
              const intensity = day.isDimmed ? 0 : Math.min(day.distance / maxDistance, 1)
              const alpha = day.isDimmed ? 0.04 : 0.08 + intensity * 0.72
              return (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.isDimmed ? 'outside selected range' : formatDistanceKm(day.distance)}`}
                  className="size-3.5 rounded-[3px] border border-[var(--line)]"
                  style={{ backgroundColor: `rgba(93, 255, 157, ${alpha})` }}
                />
              )
            })}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
        <span>{t('stats.less')}</span>
        {[0.08, 0.24, 0.42, 0.62, 0.8].map((alpha) => (
          <span
            key={alpha}
            className="size-3.5 rounded-[3px] border border-[var(--line)]"
            style={{ backgroundColor: `rgba(93, 255, 157, ${alpha})` }}
          />
        ))}
        <span>{t('stats.more')}</span>
      </div>
    </div>
  )
}

function WeekdayRhythm({ activities, dateLocale }: { activities: ActivityLike[]; dateLocale: string }) {
  const weekdayData = Array.from({ length: 7 }, (_, day) => ({ day, count: 0, distanceKm: 0 }))
  activities.forEach((activity) => {
    const date = new Date(activity.start_date || activity.startDate || '')
    if (Number.isNaN(date.getTime())) return
    const item = weekdayData[date.getDay()]
    item.count += 1
    item.distanceKm += Number(activity.distance || 0) / 1000
  })
  const maxDistance = Math.max(...weekdayData.map((item) => item.distanceKm), 1)

  return (
    <div className="space-y-3">
      {weekdayData.map((item) => (
        <div key={item.day} className="grid grid-cols-[48px_1fr_88px] items-center gap-3 text-sm">
          <div className="text-[var(--text-muted)]">{new Date(2024, 0, item.day).toLocaleDateString(dateLocale, { weekday: 'short' })}</div>
          <div className="h-3 overflow-hidden rounded-full bg-[var(--bg)]">
            <div className="h-full rounded-full bg-[var(--route-cyan)]" style={{ width: `${(item.distanceKm / maxDistance) * 100}%` }} />
          </div>
          <div className="text-right tabular-nums text-[var(--text-strong)]">{formatDistanceKm(item.distanceKm)}</div>
        </div>
      ))}
    </div>
  )
}

function RouteDiversity({ activities }: { activities: ActivityLike[] }) {
  const { t } = useI18n()
  const routeActivities = activities.filter((activity) => routePolyline(activity))
  const representatives = routeActivities.slice(0, 4)

  return (
    <div className="grid grid-cols-2 gap-3">
      {representatives.map((activity) => (
        <div key={activity.id} className="aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg)]">
          <RouteGlyph
            route={{ encodedPolyline: routePolyline(activity) }}
            effort={effortForActivity(activity)}
            padding={26}
            strokeWidth={4}
            maxPoints={140}
            label={`${activity.name || 'Route'} diversity sample`}
          />
        </div>
      ))}
      {representatives.length === 0 ? (
        <div className="col-span-2 rounded-2xl border border-dashed border-[var(--line)] p-8 text-center text-sm text-[var(--text-muted)]">
          {t('stats.noRouteDiversity')}
        </div>
      ) : null}
    </div>
  )
}

function YearSpiral({ activities }: { activities: ActivityLike[] }) {
  const { t } = useI18n()
  const points = activities
    .map((activity) => {
      const date = new Date(activity.start_date || activity.startDate || '')
      if (Number.isNaN(date.getTime())) return null
      const progress = dayOfYear(date) / 366
      const angle = progress * Math.PI * 2 * 2.35 - Math.PI / 2
      const radius = 22 + progress * 118
      const distanceKm = Number(activity.distance || 0) / 1000
      return {
        id: activity.id,
        x: 150 + Math.cos(angle) * radius,
        y: 150 + Math.sin(angle) * radius,
        distanceKm,
        effort: effortForActivity(activity),
        name: activity.name || activity.type || 'Activity',
      }
    })
    .filter(Boolean) as Array<{ id: number; x: number; y: number; distanceKm: number; effort: string; name: string }>

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
      <svg viewBox="0 0 300 300" className="aspect-square w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)]">
        <path
          d={Array.from({ length: 180 }, (_, index) => {
            const progress = index / 179
            const angle = progress * Math.PI * 2 * 2.35 - Math.PI / 2
            const radius = 22 + progress * 118
            return `${index === 0 ? 'M' : 'L'} ${(150 + Math.cos(angle) * radius).toFixed(2)} ${(150 + Math.sin(angle) * radius).toFixed(2)}`
          }).join(' ')}
          fill="none"
          stroke="rgba(139,154,147,0.22)"
          strokeWidth="1"
        />
        {points.map((point) => (
          <circle
            key={point.id}
            cx={point.x}
            cy={point.y}
            r={Math.max(3, Math.min(12, point.distanceKm * 0.65))}
            fill={point.effort === 'hard' ? 'var(--route-red)' : point.effort === 'easy' ? 'var(--route-green)' : 'var(--route-lime)'}
            opacity="0.82"
          >
            <title>{point.name}: {point.distanceKm.toFixed(1)} km</title>
          </circle>
        ))}
      </svg>
      <div className="grid content-center gap-3">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4">
          <div className="route-atlas-label">{t('stats.constellation')}</div>
          <div className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">{points.length}</div>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{t('stats.constellationCopy')}</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4">
          <div className="route-atlas-label">{t('stats.orbitDistance')}</div>
          <div className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">
            {points.reduce((sum, point) => sum + point.distanceKm, 0).toFixed(1)} km
          </div>
        </div>
      </div>
    </div>
  )
}

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - start.getTime()) / 86400000)
}

export default function StatsPage() {
  const { t, dateLocale } = useI18n()
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const { data: yearStats, isLoading } = useActivityStats(selectedYear)
  const { data: activitiesData } = useActivities(
    {
      startDate: new Date(`${selectedYear}-01-01T00:00:00`),
      endDate: new Date(`${selectedYear}-12-31T23:59:59`),
    },
    1,
    500
  )

  const yearOptions = useMemo(() => {
    const options: number[] = []
    for (let year = currentYear; year >= 2020; year -= 1) options.push(year)
    return options
  }, [currentYear])

  const monthlyData: MonthlyStat[] = yearStats?.monthlyStats || yearStats?.monthlyData || []
  const dailyData: DailyStat[] = yearStats?.dailyStats || []
  const activities = (activitiesData?.activities || []) as ActivityLike[]
  const stats = yearStats?.basicStats
  const records = yearStats?.personalRecords || {}
  const longest = records.longestRun
  const fastest = records.fastestPace
  const elevation = records.mostElevation

  return (
    <div className="space-y-6">
      <section className="panel route-atlas-surface">
        <div className="panel-body py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="route-atlas-label">{t('stats.kicker')}</div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-6xl">{t('page.stats.title')}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
                {t('stats.copy')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="route-atlas-label" htmlFor="stats-year">{t('common.year')}</label>
              <select
                id="stats-year"
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-strong)]"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="panel"><div className="panel-body"><div className="route-atlas-label">{t('common.distance')}</div><div className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">{formatDistanceKm(stats?.total_distance)}</div></div></div>
        <div className="panel"><div className="panel-body"><div className="route-atlas-label">{t('dashboard.runs')}</div><div className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">{Number(stats?.total_activities || 0)}</div></div></div>
        <div className="panel"><div className="panel-body"><div className="route-atlas-label">{t('common.time')}</div><div className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">{formatDuration(stats?.total_time)}</div></div></div>
        <div className="panel"><div className="panel-body"><div className="route-atlas-label">{t('stats.elevation')}</div><div className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">{Math.round(stats?.total_elevation || 0)} m</div></div></div>
      </section>

      {isLoading ? (
        <section className="panel">
          <div className="panel-body text-sm text-[var(--text-muted)]">{t('stats.assembling')}</div>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <LabPanel title={t('stats.distanceField')} copy={t('stats.distanceFieldCopy')}>
          <DistanceField data={monthlyData} dateLocale={dateLocale} />
        </LabPanel>
        <LabPanel title={t('stats.effortMix')} copy={t('stats.effortMixCopy')}>
          <EffortMix activities={activities} />
        </LabPanel>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <LabPanel title={t('stats.heatmap')} copy={t('stats.heatmapCopy')}>
          <ConsistencyHeatmap data={dailyData} year={selectedYear} dateLocale={dateLocale} />
        </LabPanel>
        <LabPanel title={t('stats.weekdayRhythm')} copy={t('stats.weekdayRhythmCopy')}>
          <WeekdayRhythm activities={activities} dateLocale={dateLocale} />
        </LabPanel>
      </section>

      <LabPanel title={t('stats.yearSpiral')} copy={t('stats.yearSpiralCopy')}>
        <YearSpiral activities={activities} />
      </LabPanel>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <LabPanel title={t('stats.routeDiversity')} copy={t('stats.routeDiversityCopy')}>
          <RouteDiversity activities={activities} />
        </LabPanel>
        <LabPanel title={t('stats.recordsStrip')} copy={t('stats.recordsStripCopy')}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4">
              <div className="route-atlas-label">{t('dashboard.longest')}</div>
              <div className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">{longest ? `${(Number(longest.distance || 0) / 1000).toFixed(1)} km` : '--'}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">{longest?.name || t('common.noRecord')}</div>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4">
              <div className="route-atlas-label">{t('stats.fastestPace')}</div>
              <div className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">{fastest?.pace_per_km ? `${Number(fastest.pace_per_km).toFixed(2)} min/km` : '--'}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">{fastest?.name || t('stats.noPaceRecord')}</div>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4">
              <div className="route-atlas-label">{t('stats.mostClimb')}</div>
              <div className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">{elevation?.total_elevation_gain ? `${Math.round(elevation.total_elevation_gain)} m` : '--'}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">{elevation?.name || t('stats.noClimbRecord')}</div>
            </div>
          </div>
        </LabPanel>
      </section>
    </div>
  )
}
