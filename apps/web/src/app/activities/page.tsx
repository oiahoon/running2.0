'use client'

import { useMemo, useState } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import { formatDuration, formatPace } from '@/lib/database/models/Activity'
import { getDefaultActivityTypes } from '@/lib/config/activityTypes'

const typeOptions = ['all', 'Run', 'Walk', 'Hike', 'Ride', 'Swim', 'WeightTraining', 'Rowing']

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel">
      <div className="panel-body">
        <div className="metric-label">{label}</div>
        <div className="mt-2 text-xl font-semibold text-white">{value}</div>
      </div>
    </div>
  )
}

export default function ActivitiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const filters = useMemo(
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
          <h2 className="section-title">Training Ledger</h2>
          <p className="section-subtitle">Filter your records, compare sessions, and inspect execution quality by date and activity type.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="panel xl:col-span-3">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-white">Filter Workflow</h3>
          </div>
          <div className="panel-body grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search activity name or location"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-400 focus:border-blue-300/60 focus:outline-none"
            />

            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-blue-300/60 focus:outline-none"
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
          <h3 className="text-lg font-semibold text-white">Activities Table</h3>
          <span className="text-sm text-gray-300">{pagination ? `Total ${pagination.total} activities` : 'Loading...'}</span>
        </div>

        <div className="panel-body">
          {isLoading ? <p className="text-sm text-gray-400">Loading activities...</p> : null}
          {error ? <p className="text-sm text-red-300">{error.message}</p> : null}

          {!isLoading && !error && activities.length === 0 ? (
            <p className="text-sm text-gray-400">No activities found for current filters.</p>
          ) : null}

          {!isLoading && !error && activities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-gray-400">
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
                      <tr key={activity.id} className="border-b border-white/5 text-gray-200">
                        <td className="py-2 pr-4 text-gray-300">{new Date(activity.start_date || activity.startDate).toLocaleDateString()}</td>
                        <td className="py-2 pr-4">{activity.name || '-'}</td>
                        <td className="py-2 pr-4 text-gray-300">{activity.type || '-'}</td>
                        <td className="py-2 pr-4">{(Number(activity.distance || 0) / 1000).toFixed(1)} km</td>
                        <td className="py-2 pr-4">{formatDuration(Number(activity.moving_time || activity.movingTime || 0))}</td>
                        <td className="py-2 pr-4">{speed > 0 ? formatPace(speed) : '--:--/km'}</td>
                        <td className="py-2 text-gray-300">{activity.source || '-'}</td>
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
          <span className="text-sm text-gray-300">
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
