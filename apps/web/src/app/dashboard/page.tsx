'use client'

import { useState } from 'react'

// Mock data for development
const mockStats = [
  { name: 'Total Distance', value: '1,234.5 km', change: '+12%', changeType: 'increase' as const },
  { name: 'Total Time', value: '123h 45m', change: '+8%', changeType: 'increase' as const },
  { name: 'Activities', value: '156', change: '+23%', changeType: 'increase' as const },
  { name: 'Avg Pace', value: '5:32/km', change: '-3%', changeType: 'decrease' as const },
]

const mockRecentActivities = [
  { id: 1, name: 'Morning Run', distance: '5.2 km', time: '28:45', date: '2024-07-04', type: 'Run' },
  { id: 2, name: 'Evening Jog', distance: '3.8 km', time: '22:15', date: '2024-07-03', type: 'Run' },
  { id: 3, name: 'Long Run', distance: '12.1 km', time: '1:05:30', date: '2024-07-02', type: 'Run' },
  { id: 4, name: 'Recovery Walk', distance: '2.5 km', time: '25:00', date: '2024-07-01', type: 'Walk' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function StatsGrid() {
  return (
    <div>
      <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
        Running Statistics
      </h3>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {mockStats.map((item) => (
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
            <dd className="mt-1 flex items-baseline text-sm font-semibold">
              <span
                className={classNames(
                  item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {item.change}
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">from last month</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function RecentActivities() {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Recent Activities
        </h3>
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
            {mockRecentActivities.map((activity) => (
              <li key={activity.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {activity.type === 'Run' ? '🏃' : '🚶'}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.distance} • {activity.time} • {activity.date}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
