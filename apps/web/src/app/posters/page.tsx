'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useActivities } from '@/lib/hooks/useActivities'
import { RouteGlyph } from '@/components/routes'
import { calculateRouteFingerprint, inferRouteEffort } from '@/lib/routes'
import { useI18n } from '@/lib/i18n'
import { runnerMuseCameos, runnerPosterBackgrounds } from '@/lib/runnerMuses'

type PosterMode = 'month' | 'week'

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

function periodKey(activity: ActivityLike, mode: PosterMode) {
  const date = new Date(activity.start_date || activity.startDate || '')
  if (Number.isNaN(date.getTime())) return 'unknown'
  if (mode === 'month') return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay())
  return `${start.getFullYear()}-W${String(Math.ceil((dayOfYear(start) + 1) / 7)).padStart(2, '0')}`
}

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - start.getTime()) / 86400000)
}

function formatPeriodLabel(key: string, mode: PosterMode, dateLocale: string, t: (key: string, vars?: Record<string, string | number>) => string) {
  if (key === 'unknown') return t('posters.unknownPeriod')
  if (mode === 'week') {
    const [year, week] = key.split('-W')
    return t('posters.weekLabel', { year, week })
  }
  const parsed = new Date(`${key}-01T00:00:00`)
  return parsed.toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' })
}

function formatDuration(seconds?: number) {
  const total = Number(seconds || 0)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

function stableIndex(seed: string, length: number) {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }
  return hash % length
}

function isWalkLikePeriod(items: ActivityLike[], averageSpeedMetersPerSecond: number) {
  const walkLikeCount = items.filter((activity) => {
    const type = String(activity.type || '').toLowerCase()
    return type.includes('walk') || type.includes('hike')
  }).length

  if (walkLikeCount >= Math.ceil(items.length / 2)) return true
  return averageSpeedMetersPerSecond > 0 && averageSpeedMetersPerSecond < 2.35
}

export default function PostersPage() {
  const { t, dateLocale } = useI18n()
  const [mode, setMode] = useState<PosterMode>('month')
  const { data, isLoading, error } = useActivities({}, 1, 240)
  const activities = (data?.activities || []) as ActivityLike[]
  const routeActivities = activities.filter((activity) => routePolyline(activity))

  const periods = useMemo(() => {
    const buckets = new Map<string, ActivityLike[]>()
    routeActivities.forEach((activity) => {
      const key = periodKey(activity, mode)
      buckets.set(key, [...(buckets.get(key) || []), activity])
    })
    return Array.from(buckets.entries())
      .map(([key, items]) => ({ key, items }))
      .sort((a, b) => b.key.localeCompare(a.key))
      .slice(0, 6)
  }, [mode, routeActivities])

  return (
    <div className="space-y-6">
      <section className="panel route-atlas-surface overflow-visible">
        <div className="panel-body relative py-7 md:min-h-[220px] lg:min-h-[232px]">
          <div className="relative grid gap-5 md:grid-cols-[1fr_auto] lg:items-end">
            <div className="relative z-10">
              <div className="route-atlas-label">{t('posters.kicker')}</div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-6xl">{t('posters.title')}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base md:pr-40">
                {t('posters.copy')}
              </p>
            </div>
            <Image
              src={runnerMuseCameos.posterLab.src}
              alt=""
              width={768}
              height={768}
              loading="eager"
              className="pointer-events-none absolute -top-5 right-28 z-20 hidden h-56 w-44 -rotate-2 object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.22)] md:block lg:-top-8 lg:right-40 lg:h-64 lg:w-52"
            />
            <div className="relative z-30 flex gap-2 self-end">
              <button onClick={() => setMode('month')} className={mode === 'month' ? 'action-primary' : 'action-secondary'}>{t('posters.monthly')}</button>
              <button onClick={() => setMode('week')} className={mode === 'week' ? 'action-primary' : 'action-secondary'}>{t('posters.weekly')}</button>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="panel"><div className="panel-body text-sm text-[var(--text-muted)]">{t('posters.composing')}</div></section>
      ) : null}
      {error ? (
        <section className="panel"><div className="panel-body text-sm text-red-300">{t('posters.failed')}</div></section>
      ) : null}

      {!isLoading && !error ? (
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {periods.map((period, index) => {
            const totalDistanceMeters = period.items.reduce((sum, activity) => sum + Number(activity.distance || 0), 0)
            const totalDistanceKm = totalDistanceMeters / 1000
            const totalTime = period.items.reduce((sum, activity) => sum + Number(activity.moving_time || 0), 0)
            const representative = period.items[0]
            const averageSpeed = totalTime > 0 ? totalDistanceMeters / totalTime : Number(representative.average_speed || 0)
            const movementKind = isWalkLikePeriod(period.items, averageSpeed) ? 'walk' : 'run'
            const backgroundOptions = runnerPosterBackgrounds[movementKind]
            const backgroundRunner = backgroundOptions[stableIndex(`${period.key}-${mode}`, backgroundOptions.length)]
            const fingerprints = period.items
              .map((activity) => calculateRouteFingerprint({ encodedPolyline: routePolyline(activity) }))
              .filter(Boolean)
            const averageComplexity =
              fingerprints.reduce((sum, fingerprint) => sum + (fingerprint?.complexity || 0), 0) /
              Math.max(fingerprints.length, 1)

            return (
              <article key={period.key} className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                <div className="relative z-10 flex h-full flex-col">
                  <Image
                    src={backgroundRunner.src}
                    alt=""
                    width={768}
                    height={768}
                    loading="lazy"
                    className="pointer-events-none absolute bottom-2 right-1 z-20 h-[48%] w-[44%] rotate-2 object-contain opacity-[0.11] dark:opacity-[0.16]"
                  />
                  <div className="relative z-30 flex items-start justify-between gap-4">
                    <div>
                      <div className="route-atlas-label">RUN2 / {mode === 'month' ? t('posters.monthlyPoster') : t('posters.weeklyPoster')}</div>
                      <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-strong)]">{formatPeriodLabel(period.key, mode, dateLocale, t)}</h2>
                    </div>
                    <div className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--route-green)]">
                      {t('posters.routes', { count: period.items.length })}
                    </div>
                  </div>

                  <div className="relative z-10 mt-5 aspect-square overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--bg)]">
                    <RouteGlyph
                      route={{ encodedPolyline: routePolyline(representative) }}
                      ghostRoutes={period.items.slice(1, 8).map((activity) => ({ encodedPolyline: routePolyline(activity) }))}
                      effort={effortForActivity(representative)}
                      padding={42}
                      strokeWidth={6}
                      maxPoints={360}
                      label={`${formatPeriodLabel(period.key, mode, dateLocale, t)} route poster`}
                    />
                  </div>

                  <div className="relative z-30 mt-5 grid grid-cols-3 gap-3">
                    <div>
                      <div className="route-atlas-label">{t('common.distance')}</div>
                      <div className="mt-1 text-2xl font-semibold text-[var(--text-strong)]">{totalDistanceKm.toFixed(1)} km</div>
                    </div>
                    <div>
                      <div className="route-atlas-label">{t('common.time')}</div>
                      <div className="mt-1 text-2xl font-semibold text-[var(--text-strong)]">{formatDuration(totalTime)}</div>
                    </div>
                    <div>
                      <div className="route-atlas-label">{t('posters.shape')}</div>
                      <div className="mt-1 text-2xl font-semibold text-[var(--text-strong)]">{Math.round(averageComplexity * 100)}</div>
                    </div>
                  </div>

                  <p className={index === 0 ? 'relative z-30 mt-5 pr-28 text-sm leading-6 text-[var(--text-muted)] sm:pr-32' : 'relative z-30 mt-5 text-sm leading-6 text-[var(--text-muted)]'}>
                    {t('posters.artifactCopy')}
                  </p>
                </div>
              </article>
            )
          })}
        </section>
      ) : null}
    </div>
  )
}
