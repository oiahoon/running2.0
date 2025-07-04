'use client'

import { useActivityStats, useRecentActivities } from '@/lib/hooks/useActivities'
import { formatDistance, formatDuration, getActivityIcon } from '@/lib/database/models/Activity'
import RunningMap from '@/components/maps/RunningMap'
import DistanceTrendChart from '@/components/charts/DistanceTrendChart'
import GitHubHeatmap from '@/components/charts/GitHubHeatmap'

function StatsCard({ title, value, subtitle, icon, trend }: {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  trend?: { value: number; isPositive: boolean }
}) {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="text-2xl">{icon}</div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {value}
              </div>
              {trend && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                </div>
              )}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsGrid() {
  const { data: stats, isLoading, error } = useActivityStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Activities" value="0" icon="🏃‍♂️" />
        <StatsCard title="Total Distance" value="0 km" icon="📏" />
        <StatsCard title="Total Time" value="0h 0m" icon="⏱️" />
        <StatsCard title="Avg Distance" value="0 km" icon="📊" />
      </div>
    )
  }

  const basicStats = stats.basicStats || {}

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="Total Activities" 
        value={basicStats.totalActivities || 0}
        icon="🏃‍♂️"
        subtitle={`Since ${basicStats.firstActivity ? new Date(basicStats.firstActivity).getFullYear() : 'N/A'}`}
      />
      <StatsCard 
        title="Total Distance" 
        value={formatDistance(basicStats.totalDistance || 0)}
        icon="📏"
        subtitle="All time"
      />
      <StatsCard 
        title="Total Time" 
        value={formatDuration(basicStats.totalTime || 0)}
        icon="⏱️"
        subtitle="Moving time"
      />
      <StatsCard 
        title="Avg Distance" 
        value={formatDistance(basicStats.avgDistance || 0)}
        icon="📊"
        subtitle="Per activity"
      />
    </div>
  )
}

function RecentActivities() {
  const { data: activities, isLoading } = useRecentActivities(5)

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Activities
          </h3>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Recent Activities
        </h3>
        {activities && activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity: any) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.name || `${activity.type} Activity`}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDistance(activity.distance)}</span>
                    <span>{formatDuration(activity.moving_time)}</span>
                    <span>{new Date(activity.start_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏃‍♂️</div>
            <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Connect your Strava account to see activities
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function MapPlaceholder() {
  const { data: activities } = useRecentActivities(50) // Get more activities for map

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Activity Map
        </h3>
        <RunningMap activities={activities || []} height={300} />
      </div>
    </div>
  )
}

function ChartPlaceholder() {
  const { data: stats } = useActivityStats()

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Monthly Progress
        </h3>
        {stats?.monthlyStats && stats.monthlyStats.length > 0 ? (
          <DistanceTrendChart data={stats.monthlyStats} />
        ) : (
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-gray-500 dark:text-gray-400">Monthly progress chart</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Data will appear after syncing activities
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const currentYear = new Date().getFullYear()
  const { data: stats } = useActivityStats()
  
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Welcome back! Here&apos;s an overview of your running activities.
        </p>
      </div>

      {/* Stats Grid */}
      <StatsGrid />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Activities */}
        <RecentActivities />

        {/* Map Placeholder */}
        <MapPlaceholder />
      </div>

      {/* Chart Placeholder */}
      <ChartPlaceholder />

      {/* GitHub Style Heatmap */}
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            🔥 Activity Heatmap - {currentYear}
          </h3>
          {stats?.dailyStats && stats.dailyStats.length > 0 ? (
            <GitHubHeatmap 
              data={stats.dailyStats.map((day: any) => ({
                date: day.date,
                count: day.activities,
                distance: day.distance,
                duration: day.duration
              }))}
              year={currentYear}
              showTooltip={true}
            />
          ) : (
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-gray-500 dark:text-gray-400">Loading activity heatmap...</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  GitHub-style activity calendar will be displayed here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
