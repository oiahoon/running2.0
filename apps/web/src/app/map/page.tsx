'use client'

import { useMemo, useState } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import RunningMap from '@/components/maps/RunningMap'
import WaterfallMapView from '@/components/maps/WaterfallMapView'
import { formatDistance, formatDuration, ActivityType } from '@/lib/database/models/Activity'
import { getActivityConfig } from '@/lib/config/activities'
import { getDefaultActivityTypes } from '@/lib/config/activityTypes'
import { ActivityIcon } from '@/components/icons/AtlasIcon'
import { useI18n } from '@/lib/i18n'

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
        <div className="mt-2 text-xl font-semibold text-[var(--text-strong)]">{value}</div>
      </div>
    </div>
  )
}

export default function MapPage() {
  const { t } = useI18n()
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

  const activities = useMemo<Activity[]>(() => data?.activities || [], [data?.activities])
  const activitiesWithLocation = useMemo(
    () => activities.filter((activity: Activity) => activity.start_latitude && activity.start_longitude),
    [activities]
  )
  const availableTypes = useMemo(() => [...new Set(activities.map((a: Activity) => a.type))].sort(), [activities])

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
            <h2 className="section-title">{t('map.title')}</h2>
            <p className="section-subtitle">{t('map.loading')}</p>
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
            <h2 className="section-title">{t('map.title')}</h2>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">{t('map.failed')}</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="panel-body py-6 sm:py-7">
          <h2 className="section-title">{t('map.title')}</h2>
          <p className="section-subtitle">{t('map.copy')}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="panel xl:col-span-3">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-[var(--text-strong)]">{t('map.workflow')}</h3>
          </div>
          <div className="panel-body grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{t('common.view')}</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setViewMode('map')} className={viewMode === 'map' ? 'action-primary !py-2 !px-2' : 'action-secondary !py-2 !px-2'}>{t('map.map')}</button>
                <button onClick={() => setViewMode('waterfall')} className={viewMode === 'waterfall' ? 'action-primary !py-2 !px-2' : 'action-secondary !py-2 !px-2'}>{t('map.gallery')}</button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{t('map.activityTypes')}</label>
              <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-slate-300/70 bg-white p-2.5 dark:border-white/15 dark:bg-white/5">
                {availableTypes.map((type: ActivityType) => {
                  const config = getActivityConfig(type)
                  const translatedType = t(`activity.type.${type}`)
                  return (
                    <label key={type} className="flex items-center gap-2 text-sm text-[var(--text-strong)]">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedTypes([...selectedTypes, type])
                          else setSelectedTypes(selectedTypes.filter((t) => t !== type))
                        }}
                        className="rounded border-slate-300 bg-transparent dark:border-white/20"
                      />
                      <span className="inline-flex items-center gap-1.5">
                        <ActivityIcon type={type} className="h-4 w-4 text-[var(--route-green)]" />
                        {translatedType === `activity.type.${type}` ? config.displayName : translatedType}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{t('common.start')}</label>
              <input
                type="date"
                value={dateRange.start?.toISOString().split('T')[0] || ''}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value ? new Date(e.target.value) : undefined })}
                className="w-full rounded-lg border border-slate-300/70 bg-white px-3 py-2 text-sm text-[var(--text-strong)] dark:border-white/20 dark:bg-white/5 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{t('common.end')}</label>
              <input
                type="date"
                value={dateRange.end?.toISOString().split('T')[0] || ''}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value ? new Date(e.target.value) : undefined })}
                className="w-full rounded-lg border border-slate-300/70 bg-white px-3 py-2 text-sm text-[var(--text-strong)] dark:border-white/20 dark:bg-white/5 dark:text-white"
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
              {t('map.resetFilters')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <Metric label={t('common.activities')} value={String(activities.length)} />
          <Metric label={t('map.withGps')} value={String(activitiesWithLocation.length)} />
          <Metric label={t('common.distance')} value={formatDistance(sourceSummary.totalDistanceMeters)} />
          <Metric label={t('common.duration')} value={formatDuration(sourceSummary.totalTimeSeconds)} />
        </div>
      </section>

      {viewMode === 'map' ? (
        <section className="panel overflow-hidden">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-[var(--text-strong)]">{t('map.spatialReview')}</h3>
          </div>
          <div className="panel-body">
            <RunningMap activities={activitiesWithLocation} height={620} showControls={true} defaultView="single" />
          </div>
        </section>
      ) : (
        <section className="panel overflow-hidden">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-[var(--text-strong)]">{t('map.routeGallery')}</h3>
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
