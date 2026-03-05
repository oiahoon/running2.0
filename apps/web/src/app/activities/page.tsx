'use client'

import { useMemo, useState } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import { formatDuration, formatPace } from '@/lib/database/models/Activity'
import { getDefaultActivityTypes } from '@/lib/config/activityTypes'

export default function ActivitiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const filters = useMemo(() => ({
    search: searchTerm || undefined,
    type: selectedType === 'all' ? getDefaultActivityTypes() : [selectedType],
  }), [searchTerm, selectedType])

  const { data, isLoading, error } = useActivities(filters, currentPage, pageSize)
  const activities = data?.activities || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Activities</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Search and review your training records.
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-body grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search activity name or description"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
          />

          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="all">All Types</option>
            <option value="Run">Run</option>
            <option value="Walk">Walk</option>
            <option value="Hike">Hike</option>
            <option value="Ride">Ride</option>
            <option value="Swim">Swim</option>
          </select>

          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center md:justify-end">
            {pagination ? `Total ${pagination.total} activities` : 'Loading...'}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-body">
          {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading activities...</p>}
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>}

          {!isLoading && !error && activities.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No activities found for current filters.</p>
          )}

          {!isLoading && !error && activities.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
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
                      <tr key={activity.id} className="border-b border-gray-50 dark:border-gray-800">
                        <td className="py-2 pr-4">{new Date(activity.start_date || activity.startDate).toLocaleDateString()}</td>
                        <td className="py-2 pr-4">{activity.name || '-'}</td>
                        <td className="py-2 pr-4">{activity.type || '-'}</td>
                        <td className="py-2 pr-4">{(Number(activity.distance || 0) / 1000).toFixed(1)} km</td>
                        <td className="py-2 pr-4">{formatDuration(Number(activity.moving_time || activity.movingTime || 0))}</td>
                        <td className="py-2 pr-4">{speed > 0 ? formatPace(speed) : '--:--/km'}</td>
                        <td className="py-2">{activity.source || '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {pagination && pagination.totalPages > 1 && (
        <section className="flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrev}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={!pagination.hasNext}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800"
          >
            Next
          </button>
        </section>
      )}
    </div>
  )
}
