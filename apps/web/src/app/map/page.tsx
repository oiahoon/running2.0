'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useActivities, useActivitySummary } from '@/lib/hooks/useActivities'
import { formatDistance, formatDuration, ActivityType } from '@/lib/database/models/Activity'
import { getActivityConfig, shouldShowOnMap } from '@/lib/config/activities'
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

const RunningMap = dynamic(() => import('@/components/maps/RunningMap'), {
  ssr: false,
  loading: () => <div className="h-[620px] animate-pulse rounded-lg bg-[var(--bg-2)]" aria-hidden="true" />,
})

const WaterfallMapView = dynamic(() => import('@/components/maps/WaterfallMapView'), {
  ssr: false,
  loading: () => <div className="h-[480px] animate-pulse rounded-lg bg-[var(--bg-2)]" aria-hidden="true" />,
})

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 bg-[var(--surface)] px-3 py-4 xl:px-5">
      <div className="metric-label truncate">{label}</div>
      <div className="mt-2 truncate text-lg font-semibold tabular-nums text-[var(--text-strong)] sm:text-xl">{value}</div>
    </div>
  )
}

export default function MapPage() {
  const { t } = useI18n()
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>(getDefaultActivityTypes() as ActivityType[])
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({})
  const [viewMode, setViewMode] = useState<ViewMode>('waterfall')

  const queryFilters = useMemo(
    () => ({
      type: selectedTypes.length > 0 ? selectedTypes : undefined,
      startDate: dateRange.start,
      endDate: dateRange.end,
    }),
    [dateRange.end, dateRange.start, selectedTypes]
  )

  const availableSummaryQuery = useActivitySummary()
  const filteredSummaryQuery = useActivitySummary(queryFilters)
  const mapActivitiesQuery = useActivities(queryFilters, 1, 500, { enabled: viewMode === 'map' })
  const isLoading = availableSummaryQuery.isLoading || filteredSummaryQuery.isLoading || (viewMode === 'map' && mapActivitiesQuery.isLoading)
  const error = availableSummaryQuery.error || filteredSummaryQuery.error || (viewMode === 'map' ? mapActivitiesQuery.error : null)

  const activities = useMemo<Activity[]>(() => mapActivitiesQuery.data?.activities || [], [mapActivitiesQuery.data?.activities])
  const activitiesWithLocation = useMemo(
    () => activities.filter((activity: Activity) => activity.start_latitude && activity.start_longitude),
    [activities]
  )
  const availableTypes = useMemo(
    () => (availableSummaryQuery.data?.summary?.typeDistribution || [])
      .map((item: { type: ActivityType }) => item.type)
      .filter((type: ActivityType) => shouldShowOnMap(type))
      .sort(),
    [availableSummaryQuery.data?.summary?.typeDistribution]
  )

  const sourceSummary = filteredSummaryQuery.data?.summary

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
      <section className="panel route-atlas-surface">
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
                <button aria-pressed={viewMode === 'map'} onClick={() => setViewMode('map')} className={viewMode === 'map' ? 'action-primary !px-2 !py-2' : 'action-secondary !px-2 !py-2'}>{t('map.map')}</button>
                <button aria-pressed={viewMode === 'waterfall'} onClick={() => setViewMode('waterfall')} className={viewMode === 'waterfall' ? 'action-primary !px-2 !py-2' : 'action-secondary !px-2 !py-2'}>{t('map.gallery')}</button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{t('map.activityTypes')}</label>
              <div className="grid grid-cols-2 gap-x-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5">
                {availableTypes.map((type: ActivityType) => {
                  const config = getActivityConfig(type)
                  const translatedType = t(`activity.type.${type}`)
                  return (
                    <label key={type} className="flex min-h-11 items-center gap-2 text-sm text-[var(--text-strong)]">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={(e) => {
                          setSelectedTypes((currentTypes) => e.target.checked
                            ? [...currentTypes, type]
                            : currentTypes.filter((currentType) => currentType !== type))
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
              className="action-secondary w-full sm:w-auto"
            >
              {t('map.resetFilters')}
            </button>
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="grid grid-cols-2 gap-px bg-[var(--line)] sm:grid-cols-4 xl:grid-cols-1">
            <Metric label={t('common.activities')} value={String(sourceSummary?.totalActivities || 0)} />
            <Metric label={t('map.withGps')} value={String(sourceSummary?.withGps || 0)} />
            <Metric label={t('common.distance')} value={formatDistance(Number(sourceSummary?.totalDistance || 0))} />
            <Metric label={t('common.duration')} value={formatDuration(Number(sourceSummary?.totalTime || 0))} />
          </div>
        </div>
      </section>

      {viewMode === 'map' ? (
        <section className="panel overflow-hidden">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-[var(--text-strong)]">{t('map.spatialReview')}</h3>
          </div>
          <div className="panel-body p-3 sm:p-5">
            <RunningMap activities={activitiesWithLocation} height={620} showControls={true} defaultView="single" />
          </div>
        </section>
      ) : (
        <section className="panel overflow-hidden">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-[var(--text-strong)]">{t('map.routeGallery')}</h3>
          </div>
          <div className="panel-body p-3 sm:p-5">
            <WaterfallMapView
              key={`${JSON.stringify(selectedTypes)}-${dateRange.start}-${dateRange.end}`}
              filters={queryFilters}
            />
          </div>
        </section>
      )}
    </div>
  )
}
