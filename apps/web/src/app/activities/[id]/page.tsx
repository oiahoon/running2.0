'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { formatDuration, formatPace } from '@/lib/database/models/Activity'
import { RouteGlyph } from '@/components/routes'
import { calculateRouteFingerprint, inferRouteEffort } from '@/lib/routes'
import { useI18n } from '@/lib/i18n'

type ActivityDetail = {
  id: number
  name?: string
  type?: string
  source?: string
  distance?: number
  moving_time?: number
  elapsed_time?: number
  total_elevation_gain?: number
  average_speed?: number
  average_heartrate?: number
  max_heartrate?: number
  calories?: number
  start_date?: string
  startDate?: string
  location_city?: string
  location_state?: string
  location_country?: string
  summary_polyline?: string
  summaryPolyline?: string
}

function formatDate(value: string | undefined, dateLocale: string, unknownLabel: string) {
  if (!value) return unknownLabel
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return unknownLabel
  return date.toLocaleDateString(dateLocale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDistanceKm(distanceMeters?: number) {
  return `${(Number(distanceMeters || 0) / 1000).toFixed(2)} km`
}

function routePolyline(activity?: ActivityDetail) {
  return activity?.summary_polyline || activity?.summaryPolyline || ''
}

function effortForActivity(activity?: ActivityDetail) {
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

function StatRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex items-baseline justify-between border-b border-[var(--line)] py-3">
      <div className="route-atlas-label">{label}</div>
      <div className="text-2xl font-semibold tabular-nums text-[var(--text-strong)]">{value}</div>
    </div>
  )
}

function ShareCard({ activity }: { activity: ActivityDetail }) {
  const { t, dateLocale } = useI18n()

  return (
    <div className="aspect-[4/5] rounded-3xl border border-[var(--line)] bg-[var(--bg)] p-5">
      <div className="route-atlas-label">{t('activityDetail.shareCard')}</div>
      <h3 className="mt-3 text-2xl font-black leading-tight text-[var(--text-strong)]">{activity.name || t('activityDetail.untitled')}</h3>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{formatDate(activity.start_date || activity.startDate, dateLocale, t('common.unknownDate'))}</p>
      <div className="mt-5 aspect-square overflow-hidden rounded-2xl border border-[var(--line)]">
        <RouteGlyph route={{ encodedPolyline: routePolyline(activity) }} effort={effortForActivity(activity)} padding={30} maxPoints={220} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-sm tabular-nums">
        <div>
          <div className="route-atlas-label">{t('common.distance')}</div>
          <div className="mt-1 font-semibold text-[var(--text-strong)]">{formatDistanceKm(activity.distance)}</div>
        </div>
        <div>
          <div className="route-atlas-label">{t('common.pace')}</div>
          <div className="mt-1 font-semibold text-[var(--text-strong)]">{activity.average_speed ? formatPace(activity.average_speed) : '--:--/km'}</div>
        </div>
        <div>
          <div className="route-atlas-label">{t('common.time')}</div>
          <div className="mt-1 font-semibold text-[var(--text-strong)]">{formatDuration(activity.moving_time)}</div>
        </div>
      </div>
    </div>
  )
}

function FingerprintPanel({ activity }: { activity: ActivityDetail }) {
  const { t } = useI18n()
  const fingerprint = calculateRouteFingerprint({ encodedPolyline: routePolyline(activity) })

  if (!fingerprint) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] p-5 text-sm text-[var(--text-muted)]">
        {t('activityDetail.noFingerprint')}
      </div>
    )
  }

  const metrics = [
    { label: t('activityDetail.shape'), value: fingerprint.shapeLabel },
    { label: t('activityDetail.complexity'), value: `${Math.round(fingerprint.complexity * 100)}` },
    { label: t('activityDetail.loop'), value: `${Math.round(fingerprint.loopScore * 100)}` },
    { label: t('activityDetail.compact'), value: `${Math.round(fingerprint.compactness * 100)}` },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4">
          <div className="route-atlas-label">{metric.label}</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">{metric.value}</div>
        </div>
      ))}
    </div>
  )
}

export default function ActivityPosterPage() {
  const { t, dateLocale } = useI18n()
  const params = useParams<{ id: string }>()
  const activityId = params.id

  const { data, isLoading, error } = useQuery({
    queryKey: ['activity', activityId],
    queryFn: async () => {
      const response = await fetch(`/api/activities/${activityId}`)
      if (!response.ok) throw new Error(t('activityDetail.fetchFailed'))
      return response.json() as Promise<{ activity: ActivityDetail }>
    },
  })

  const activity = data?.activity
  const effort = effortForActivity(activity)
  const location = [activity?.location_city, activity?.location_state, activity?.location_country].filter(Boolean).join(', ')

  if (isLoading) {
    return (
      <section className="panel">
        <div className="panel-body py-10 text-sm text-[var(--text-muted)]">{t('activityDetail.preparing')}</div>
      </section>
    )
  }

  if (error || !activity) {
    return (
      <section className="panel">
        <div className="panel-body py-10">
          <p className="text-sm text-red-300">{t('activityDetail.failed')}</p>
          <Link href="/routes" className="action-secondary mt-4">{t('activityDetail.back')}</Link>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="panel route-atlas-surface overflow-hidden">
        <div className="grid min-h-[680px] grid-cols-1 gap-6 p-5 lg:grid-cols-[1.15fr_0.85fr] lg:p-7">
          <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[rgba(7,10,12,0.72)]">
            <RouteGlyph
              route={{ encodedPolyline: routePolyline(activity) }}
              effort={effort}
              width={820}
              height={720}
              padding={62}
              strokeWidth={8}
              maxPoints={520}
              label={`${activity.name || 'Activity'} poster route`}
            />
          </div>

          <div className="flex flex-col justify-between gap-8">
            <div>
              <div className="route-atlas-label">{String(effort).toUpperCase()} / {activity.type || t('activityDetail.activity')}</div>
              <h1 className="mt-4 text-4xl font-black leading-none tracking-tight text-[var(--text-strong)] sm:text-6xl">
                {activity.name || t('activityDetail.untitled')}
              </h1>
              <p className="mt-4 text-sm text-[var(--text-muted)]">
                {formatDate(activity.start_date || activity.startDate, dateLocale, t('common.unknownDate'))}
                {location ? ` · ${location}` : ''}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-3">
              <StatRow label={t('common.distance')} value={formatDistanceKm(activity.distance)} />
              <StatRow label={t('common.pace')} value={activity.average_speed ? formatPace(activity.average_speed) : '--:--/km'} />
              <StatRow label={t('common.time')} value={formatDuration(activity.moving_time)} />
              <StatRow label={t('stats.elevation')} value={activity.total_elevation_gain ? `+${Math.round(activity.total_elevation_gain)} m` : null} />
              <StatRow label={t('activityDetail.heartRate')} value={activity.average_heartrate ? `${Math.round(activity.average_heartrate)} bpm` : null} />
              <StatRow label={t('activityDetail.calories')} value={activity.calories ? Math.round(activity.calories) : null} />
              <StatRow label={t('common.source')} value={activity.source?.toUpperCase()} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <div className="panel">
          <div className="panel-header">
            <h2 className="text-lg font-semibold text-[var(--text-strong)]">{t('activityDetail.routeFingerprint')}</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t('activityDetail.routeFingerprintCopy')}</p>
          </div>
          <div className="panel-body">
            <FingerprintPanel activity={activity} />
          </div>
        </div>
        <ShareCard activity={activity} />
      </section>
    </div>
  )
}
