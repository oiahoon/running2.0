'use client'

import { useRouter } from 'next/navigation'
import { useActivityStats, useRecentActivities } from '@/lib/hooks/useActivities'
import { formatDuration, formatPace } from '@/lib/database/models/Activity'

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <div className="panel">
      <div className="panel-body">
        <div className="metric-label">{title}</div>
        <div className="metric-value mt-2">{value}</div>
        {subtitle && <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>}
      </div>
    </div>
  )
}

export function CyberDashboard() {
  const router = useRouter()
  const currentYear = new Date().getFullYear()

  const { data: statsData, isLoading: statsLoading } = useActivityStats(currentYear)
  const { data: recentActivities = [], isLoading: recentLoading } = useRecentActivities(6)

  const basicStats = statsData?.basicStats
  const totalDistanceKm = Number(basicStats?.total_distance || 0)
  const totalTimeSeconds = Number(basicStats?.total_time || 0)
  const averageSpeedMps = totalTimeSeconds > 0 ? (totalDistanceKm * 1000) / totalTimeSeconds : 0

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 7)

  const weeklyActivities = recentActivities.filter((activity: any) => {
    const startDate = new Date(activity.start_date || '')
    return !Number.isNaN(startDate.getTime()) && startDate >= weekStart
  })

  const thisWeekDistanceKm = weeklyActivities.reduce((sum: number, activity: any) => {
    return sum + Number(activity.distance || 0) / 1000
  }, 0)

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            A concise view of your running data.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/sync')}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Sync
          </button>
          <button
            onClick={() => router.push('/map')}
            className="rounded-lg border border-gray-900 bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Open Map
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Distance"
          value={statsLoading ? '...' : `${totalDistanceKm.toFixed(1)} km`}
        />
        <StatCard
          title="Activities"
          value={statsLoading ? '...' : Number(basicStats?.total_activities || 0)}
        />
        <StatCard
          title="Average Pace"
          value={statsLoading ? '...' : averageSpeedMps > 0 ? formatPace(averageSpeedMps) : '--:--/km'}
        />
        <StatCard
          title="Total Time"
          value={statsLoading ? '...' : formatDuration(totalTimeSeconds)}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <div className="panel-header">
            <h2 className="text-base font-semibold">This Week</h2>
          </div>
          <div className="panel-body">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard title="Distance" value={`${thisWeekDistanceKm.toFixed(1)} km`} />
              <StatCard title="Activities" value={weeklyActivities.length} />
              <StatCard title="Goal Progress" value={`${Math.min(Math.round((thisWeekDistanceKm / 50) * 100), 100)}%`} subtitle="Target: 50 km" />
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="text-base font-semibold">Navigation</h2>
          </div>
          <div className="panel-body flex flex-col gap-2">
            <button onClick={() => router.push('/activities')} className="rounded-md border border-gray-300 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">Activities</button>
            <button onClick={() => router.push('/stats')} className="rounded-md border border-gray-300 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">Statistics</button>
            <button onClick={() => router.push('/map')} className="rounded-md border border-gray-300 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">Map & Routes</button>
            <button onClick={() => router.push('/sync')} className="rounded-md border border-gray-300 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">Sync Status</button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent Activities</h2>
          <button
            onClick={() => router.push('/activities')}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            View all
          </button>
        </div>
        <div className="panel-body">
          {recentLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading recent activities...</p>
          ) : recentActivities.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No activities yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Type</th>
                    <th className="py-2 pr-4 font-medium">Distance</th>
                    <th className="py-2 pr-4 font-medium">Duration</th>
                    <th className="py-2 font-medium">Pace</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.slice(0, 6).map((activity: any) => {
                    const speed = Number(activity.average_speed || 0)
                    return (
                      <tr key={activity.id} className="border-b border-gray-50 dark:border-gray-800">
                        <td className="py-2 pr-4">{new Date(activity.start_date).toLocaleDateString()}</td>
                        <td className="py-2 pr-4">{activity.name || '-'}</td>
                        <td className="py-2 pr-4">{activity.type || '-'}</td>
                        <td className="py-2 pr-4">{(Number(activity.distance || 0) / 1000).toFixed(1)} km</td>
                        <td className="py-2 pr-4">{formatDuration(Number(activity.moving_time || 0))}</td>
                        <td className="py-2">{speed > 0 ? formatPace(speed) : '--:--/km'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
