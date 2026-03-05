'use client'

import { useRouter } from 'next/navigation'
import { useActivityStats, useRecentActivities } from '@/lib/hooks/useActivities'
import { formatDuration, formatPace } from '@/lib/database/models/Activity'

function MetricCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <div className="panel">
      <div className="panel-body">
        <div className="metric-label">{title}</div>
        <div className="metric-value mt-2">{value}</div>
        {subtitle ? <div className="mt-1 text-sm text-gray-400">{subtitle}</div> : null}
      </div>
    </div>
  )
}

export function CyberDashboard() {
  const router = useRouter()
  const currentYear = new Date().getFullYear()

  const { data: statsData, isLoading: statsLoading } = useActivityStats(currentYear)
  const { data: recentActivities = [], isLoading: recentLoading } = useRecentActivities(8)

  const basicStats = statsData?.basicStats
  const totalDistanceKm = Number(basicStats?.total_distance || 0)
  const totalTimeSeconds = Number(basicStats?.total_time || 0)
  const averageSpeedMps = totalTimeSeconds > 0 ? (totalDistanceKm * 1000) / totalTimeSeconds : 0

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)

  const weeklyActivities = recentActivities.filter((activity: any) => {
    const startDate = new Date(activity.start_date || '')
    return !Number.isNaN(startDate.getTime()) && startDate >= weekStart
  })

  const thisWeekDistanceKm = weeklyActivities.reduce((sum: number, activity: any) => {
    return sum + Number(activity.distance || 0) / 1000
  }, 0)

  const weeklyGoalKm = 50
  const goalProgress = weeklyGoalKm > 0 ? Math.min(Math.round((thisWeekDistanceKm / weeklyGoalKm) * 100), 100) : 0

  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden">
        <div className="panel-body py-6 sm:py-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="section-title">Today&apos;s Command View</h2>
              <p className="section-subtitle">Quickly check status, review progress, and jump into core workflows.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => router.push('/sync')} className="action-secondary">Run Sync</button>
              <button onClick={() => router.push('/map')} className="action-primary">Open Map</button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Distance" value={statsLoading ? '...' : `${totalDistanceKm.toFixed(1)} km`} />
        <MetricCard title="Activities" value={statsLoading ? '...' : Number(basicStats?.total_activities || 0)} />
        <MetricCard title="Average Pace" value={statsLoading ? '...' : averageSpeedMps > 0 ? formatPace(averageSpeedMps) : '--:--/km'} />
        <MetricCard title="Total Time" value={statsLoading ? '...' : formatDuration(totalTimeSeconds)} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="panel xl:col-span-2">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-white">This Week Progress</h3>
          </div>
          <div className="panel-body">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MetricCard title="Distance" value={`${thisWeekDistanceKm.toFixed(1)} km`} />
              <MetricCard title="Activities" value={weeklyActivities.length} />
              <MetricCard title="Goal" value={`${goalProgress}%`} subtitle={`Target: ${weeklyGoalKm} km`} />
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-white">Workflow Shortcuts</h3>
          </div>
          <div className="panel-body grid grid-cols-1 gap-2">
            <button onClick={() => router.push('/activities')} className="action-secondary justify-start">Review Activities</button>
            <button onClick={() => router.push('/stats')} className="action-secondary justify-start">Analyze Statistics</button>
            <button onClick={() => router.push('/map')} className="action-secondary justify-start">Inspect Routes</button>
            <button onClick={() => router.push('/data-sources')} className="action-secondary justify-start">Manage Sources</button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Activities</h3>
          <button onClick={() => router.push('/activities')} className="text-sm text-gray-300 hover:text-white">View all</button>
        </div>
        <div className="panel-body">
          {recentLoading ? (
            <p className="text-sm text-gray-400">Loading recent activities...</p>
          ) : recentActivities.length === 0 ? (
            <p className="text-sm text-gray-400">No activities yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-gray-400">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Type</th>
                    <th className="py-2 pr-4 font-medium">Distance</th>
                    <th className="py-2 pr-4 font-medium">Duration</th>
                    <th className="py-2 font-medium">Pace</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.slice(0, 8).map((activity: any) => {
                    const speed = Number(activity.average_speed || 0)
                    return (
                      <tr key={activity.id} className="border-b border-white/5 text-gray-200">
                        <td className="py-2 pr-4 text-gray-300">{new Date(activity.start_date).toLocaleDateString()}</td>
                        <td className="py-2 pr-4">{activity.name || '-'}</td>
                        <td className="py-2 pr-4 text-gray-300">{activity.type || '-'}</td>
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
