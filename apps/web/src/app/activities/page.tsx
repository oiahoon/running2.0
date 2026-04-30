'use client'

import { useMemo, useState } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import Link from 'next/link'
import { formatDuration, formatPace, type ActivityFilters, type ActivityType } from '@/lib/database/models/Activity'
import { getDefaultActivityTypes } from '@/lib/config/activityTypes'
import { useI18n } from '@/lib/i18n'

const typeOptions: Array<'all' | ActivityType> = ['all', 'Run', 'Walk', 'Hike', 'Ride', 'Swim', 'WeightTraining', 'Rowing']

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel">
        <div className="panel-body">
          <div className="metric-label">{label}</div>
        <div className="mt-2 text-xl font-semibold text-[var(--text-strong)]">{value}</div>
      </div>
    </div>
  )
}

export default function ActivitiesPage() {
  const { t, dateLocale } = useI18n()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | ActivityType>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const filters = useMemo<ActivityFilters>(
    () => ({
      search: searchTerm || undefined,
      type: selectedType === 'all' ? getDefaultActivityTypes() : [selectedType],
    }),
    [searchTerm, selectedType]
  )

  const { data, isLoading, error } = useActivities(filters, currentPage, pageSize)
  const activities = data?.activities || []
  const pagination = data?.pagination

  const totalDistanceKm = activities.reduce((sum: number, a: any) => sum + Number(a.distance || 0) / 1000, 0)
  const totalDuration = activities.reduce((sum: number, a: any) => sum + Number(a.moving_time || a.movingTime || 0), 0)

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="panel-body py-6 sm:py-7">
          <h2 className="section-title">{t('activities.title')}</h2>
          <p className="section-subtitle">{t('activities.copy')}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="panel xl:col-span-3">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-[var(--text-strong)]">{t('activities.filterWorkflow')}</h3>
          </div>
          <div className="panel-body grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder={t('activities.searchPlaceholder')}
              className="w-full rounded-lg border border-slate-300/70 bg-white px-3 py-2.5 text-sm text-[var(--text-strong)] placeholder:text-slate-400 focus:border-blue-400/60 focus:outline-none dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-400"
            />

            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as 'all' | ActivityType)
                setCurrentPage(1)
              }}
              className="w-full rounded-lg border border-slate-300/70 bg-white px-3 py-2.5 text-sm text-[var(--text-strong)] focus:border-blue-400/60 focus:outline-none dark:border-white/20 dark:bg-white/5 dark:text-white"
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? t('activity.type.all') : t(`activity.type.${type}`)}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedType('all')
                setCurrentPage(1)
              }}
              className="action-secondary"
            >
              {t('activities.resetFilters')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <KPI label={t('activities.recordsPage')} value={String(activities.length)} />
          <KPI label={t('activities.distancePage')} value={`${totalDistanceKm.toFixed(1)} km`} />
          <KPI label={t('activities.durationPage')} value={formatDuration(totalDuration)} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-header flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-strong)]">{t('activities.table')}</h3>
          <span className="text-sm text-[var(--text-muted)]">{pagination ? t('activities.totalRuns', { total: pagination.total }) : t('common.loading')}</span>
        </div>

        <div className="panel-body">
          {isLoading ? <p className="text-sm text-[var(--text-muted)]">{t('activities.loading')}</p> : null}
          {error ? <p className="text-sm text-red-300">{error.message}</p> : null}

          {!isLoading && !error && activities.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">{t('activities.empty')}</p>
          ) : null}

          {!isLoading && !error && activities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-[var(--text-muted)] dark:border-white/10">
                    <th className="py-2 pr-4 font-medium">{t('common.date')}</th>
                    <th className="py-2 pr-4 font-medium">{t('common.name')}</th>
                    <th className="py-2 pr-4 font-medium">{t('common.type')}</th>
                    <th className="py-2 pr-4 font-medium">{t('common.distance')}</th>
                    <th className="py-2 pr-4 font-medium">{t('common.duration')}</th>
                    <th className="py-2 pr-4 font-medium">{t('common.pace')}</th>
                    <th className="py-2 font-medium">{t('common.source')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity: any) => {
                    const speed = Number(activity.average_speed || activity.averageSpeed || 0)
                    return (
                      <tr key={activity.id} className="border-b border-slate-200 text-[var(--text-strong)] dark:border-white/5 dark:text-gray-200">
                        <td className="py-2 pr-4 text-[var(--text-muted)]">{new Date(activity.start_date || activity.startDate).toLocaleDateString(dateLocale)}</td>
                        <td className="py-2 pr-4">
                          <Link href={`/activities/${activity.id}`} className="hover:text-[var(--route-green)]">
                            {activity.name || '-'}
                          </Link>
                        </td>
                        <td className="py-2 pr-4 text-[var(--text-muted)]">{activity.type ? t(`activity.type.${activity.type}`) : '-'}</td>
                        <td className="py-2 pr-4">{(Number(activity.distance || 0) / 1000).toFixed(1)} km</td>
                        <td className="py-2 pr-4">{formatDuration(Number(activity.moving_time || activity.movingTime || 0))}</td>
                        <td className="py-2 pr-4">{speed > 0 ? formatPace(speed) : '--:--/km'}</td>
                        <td className="py-2 text-[var(--text-muted)]">{activity.source || '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </section>

      {pagination && pagination.totalPages > 1 ? (
        <section className="flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrev}
            className="action-secondary disabled:opacity-50"
          >
            {t('activities.previous')}
          </button>
          <span className="text-sm text-[var(--text-muted)]">
            {t('activities.pageXofY', { page: pagination.page, totalPages: pagination.totalPages })}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={!pagination.hasNext}
            className="action-secondary disabled:opacity-50"
          >
            {t('activities.next')}
          </button>
        </section>
      ) : null}
    </div>
  )
}
