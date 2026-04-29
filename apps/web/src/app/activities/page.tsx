'use client'

import { useMemo, useState } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import Link from 'next/link'
import { formatDuration, formatPace, type ActivityFilters, type ActivityType } from '@/lib/database/models/Activity'
import { getDefaultActivityTypes } from '@/lib/config/activityTypes'

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
          <h2 className="section-title">Runs Archive</h2>
          <p className="section-subtitle">Filter your records, compare sessions, and inspect execution quality by date and activity type.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="panel xl:col-span-3">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-[var(--text-strong)]">Filter Workflow</h3>
          </div>
          <div className="panel-body grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search activity name or location"
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
                  {type === 'all' ? 'All Types' : type}
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
              Reset Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <KPI label="Records (Page)" value={String(activities.length)} />
          <KPI label="Distance (Page)" value={`${totalDistanceKm.toFixed(1)} km`} />
          <KPI label="Duration (Page)" value={formatDuration(totalDuration)} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-header flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-strong)]">Runs Table</h3>
          <span className="text-sm text-[var(--text-muted)]">{pagination ? `Total ${pagination.total} runs` : 'Loading...'}</span>
        </div>

        <div className="panel-body">
          {isLoading ? <p className="text-sm text-[var(--text-muted)]">Loading activities...</p> : null}
          {error ? <p className="text-sm text-red-300">{error.message}</p> : null}

          {!isLoading && !error && activities.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No activities found for current filters.</p>
          ) : null}

          {!isLoading && !error && activities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-[var(--text-muted)] dark:border-white/10">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Type</th>
                    <th className="py-2 pr-4 font-medium">Distance</th>
                    <th className="py-2 pr-4 font-medium">Duration</th>
                    <th className="py-2 pr-4 font-medium">Pace</th>
                    <th className="py-2 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity: any) => {
                    const speed = Number(activity.average_speed || activity.averageSpeed || 0)
                    return (
                      <tr key={activity.id} className="border-b border-slate-200 text-[var(--text-strong)] dark:border-white/5 dark:text-gray-200">
                        <td className="py-2 pr-4 text-[var(--text-muted)]">{new Date(activity.start_date || activity.startDate).toLocaleDateString()}</td>
                        <td className="py-2 pr-4">
                          <Link href={`/activities/${activity.id}`} className="hover:text-[var(--route-green)]">
                            {activity.name || '-'}
                          </Link>
                        </td>
                        <td className="py-2 pr-4 text-[var(--text-muted)]">{activity.type || '-'}</td>
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
            Previous
          </button>
          <span className="text-sm text-[var(--text-muted)]">
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={!pagination.hasNext}
            className="action-secondary disabled:opacity-50"
          >
            Next
          </button>
        </section>
      ) : null}
    </div>
  )
}
