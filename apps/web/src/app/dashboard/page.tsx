'use client'

import { useActivityStats, useRecentActivities } from '@/lib/hooks/useActivities'
import { formatDistance, formatDuration, formatPace, getActivityIcon } from '@/lib/database/models/Activity'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function StatsGrid() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  
  const { data: yearStats, isLoading: yearLoading } = useActivityStats(currentYear)
  const { data: monthStats, isLoading: monthLoading } = useActivityStats(currentYear, currentMonth)
  const { data: allTimeStats, isLoading: allTimeLoading } = useActivityStats()

  if (yearLoading || monthLoading || allTimeLoading) {
    return (
      <div>
        <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          Running Statistics
        </h3>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 px-4 py-5 shadow sm:p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Distance',
      value: formatDistance(allTimeStats?.summary?.totalDistance * 1000),
      change: yearStats?.comparison?.percentageChange?.distance 
        ? `${yearStats.comparison.percentageChange.distance > 0 ? '+' : ''}${yearStats.comparison.percentageChange.distance.toFixed(1)}%`
        : null,
      changeType: (yearStats?.comparison?.percentageChange?.distance || 0) >= 0 ? 'increase' : 'decrease',
    },
    {
      name: 'This Year',
      value: formatDistance(yearStats?.summary?.totalDistance * 1000),
      change: yearStats?.comparison?.percentageChange?.distance 
        ? `${yearStats.comparison.percentageChange.distance > 0 ? '+' : ''}${yearStats.comparison.percentageChange.distance.toFixed(1)}%`
        : null,
      changeType: (yearStats?.comparison?.percentageChange?.distance || 0) >= 0 ? 'increase' : 'decrease',
    },
    {
      name: 'This Month',
      value: formatDistance(monthStats?.summary?.totalDistance * 1000),
      change: monthStats?.comparison?.percentageChange?.distance 
        ? `${monthStats.comparison.percentageChange.distance > 0 ? '+' : ''}${monthStats.comparison.percentageChange.distance.toFixed(1)}%`
        : null,
      changeType: (monthStats?.comparison?.percentageChange?.distance || 0) >= 0 ? 'increase' : 'decrease',
    },
    {
      name: 'Activities',
      value: allTimeStats?.summary?.totalActivities?.toString() || '0',
      change: yearStats?.comparison?.percentageChange?.activities 
        ? `${yearStats.comparison.percentageChange.activities > 0 ? '+' : ''}${yearStats.comparison.percentageChange.activities.toFixed(1)}%`
        : null,
      changeType: (yearStats?.comparison?.percentageChange?.activities || 0) >= 0 ? 'increase' : 'decrease',
    },
  ]

  return (
    <div>
      <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
        Running Statistics
      </h3>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 px-4 py-5 shadow sm:p-6 border border-gray-200 dark:border-gray-700"
          >
            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              {item.name}
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {item.value}
            </dd>
            {item.change && (
              <dd className="mt-1 flex items-baseline text-sm font-semibold">
                <span
                  className={classNames(
                    item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {item.change}
                </span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">vs last period</span>
              </dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  )
}

function RecentActivities() {
  const { data: activities, isLoading, error } = useRecentActivities(5)

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Activities
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Activities
          </h3>
          <p className="text-red-500">Failed to load activities</p>
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
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
            {activities?.map((activity: any) => (
              <li key={activity.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.name || 'Untitled Activity'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistance(activity.distance)} • {formatDuration(activity.moving_time)} • {new Date(activity.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <button className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                      View
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6">
          <button className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            View all activities
          </button>
        </div>
      </div>
    </div>
  )
}

function MapPlaceholder() {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Route Map
        </h3>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-500 dark:text-gray-400">Interactive map coming soon</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Your running routes will be displayed here
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChartPlaceholder() {
  const { data: yearStats } = useActivityStats(new Date().getFullYear())
  
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Performance Trends
        </h3>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-500 dark:text-gray-400">Charts coming soon</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Distance, pace, and heart rate trends will be displayed here
            </p>
            {yearStats?.monthlyData && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {yearStats.monthlyData.length} months of data available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Welcome back! Here's an overview of your running activities.
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
    </div>
  )
}
