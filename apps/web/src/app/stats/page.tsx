'use client'

import { useState } from 'react'

// Mock data for development
const mockYearlyStats = {
  2024: {
    totalDistance: 1234.5,
    totalTime: 7425, // minutes
    totalActivities: 156,
    averagePace: 332, // seconds per km
    longestRun: 21.1,
    fastestPace: 285,
  },
  2023: {
    totalDistance: 1156.2,
    totalTime: 6890,
    totalActivities: 142,
    averagePace: 345,
    longestRun: 18.5,
    fastestPace: 295,
  }
}

const mockMonthlyData = [
  { month: 'Jan', distance: 95.2, activities: 12, avgPace: 330 },
  { month: 'Feb', distance: 108.5, activities: 14, avgPace: 325 },
  { month: 'Mar', distance: 125.8, activities: 16, avgPace: 320 },
  { month: 'Apr', distance: 142.3, activities: 18, avgPace: 315 },
  { month: 'May', distance: 156.7, activities: 20, avgPace: 310 },
  { month: 'Jun', distance: 134.2, activities: 17, avgPace: 318 },
]

const mockAchievements = [
  { title: 'Marathon Finisher', description: 'Completed your first marathon', icon: '🏆', date: '2024-05-15' },
  { title: '100km Month', description: 'Ran over 100km in a single month', icon: '💯', date: '2024-03-31' },
  { title: 'Consistency King', description: '30 days running streak', icon: '🔥', date: '2024-02-28' },
  { title: 'Early Bird', description: '50 morning runs completed', icon: '🌅', date: '2024-01-20' },
]

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

function formatPace(secondsPerKm: number): string {
  const minutes = Math.floor(secondsPerKm / 60)
  const seconds = secondsPerKm % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`
}

function YearSelector({ selectedYear, onYearChange }: { 
  selectedYear: number
  onYearChange: (year: number) => void 
}) {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Year Overview
          </h3>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:text-white"
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
            </select>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function YearlyStatsGrid({ stats }: { stats: typeof mockYearlyStats[2024] }) {
  const statItems = [
    { name: 'Total Distance', value: `${stats.totalDistance.toFixed(1)} km`, icon: '📏' },
    { name: 'Total Time', value: formatTime(stats.totalTime), icon: '⏱️' },
    { name: 'Activities', value: stats.totalActivities.toString(), icon: '🏃' },
    { name: 'Average Pace', value: formatPace(stats.averagePace), icon: '⚡' },
    { name: 'Longest Run', value: `${stats.longestRun} km`, icon: '🎯' },
    { name: 'Fastest Pace', value: formatPace(stats.fastestPace), icon: '🚀' },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {statItems.map((item) => (
        <div
          key={item.name}
          className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">{item.icon}</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {item.name}
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {item.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MonthlyChart() {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Monthly Progress
        </h3>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-500 dark:text-gray-400">Interactive charts coming soon</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Monthly distance and pace trends will be displayed here
            </p>
          </div>
        </div>
        
        {/* Simple data table for now */}
        <div className="mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Activities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg Pace
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {mockMonthlyData.map((month) => (
                  <tr key={month.month}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {month.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {month.distance} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {month.activities}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatPace(month.avgPace)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function CalendarHeatmap() {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Activity Calendar
        </h3>
        <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-gray-500 dark:text-gray-400">Calendar heatmap coming soon</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              GitHub-style activity calendar will be displayed here
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Achievements() {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Achievements
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {mockAchievements.map((achievement, index) => (
            <div
              key={index}
              className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className="text-2xl">{achievement.icon}</div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {achievement.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {achievement.description}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {achievement.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function StatsPage() {
  const [selectedYear, setSelectedYear] = useState(2024)
  const currentStats = mockYearlyStats[selectedYear as keyof typeof mockYearlyStats]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistics</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Dive deep into your running data with comprehensive analytics and insights.
        </p>
      </div>

      {/* Year Selector */}
      <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />

      {/* Yearly Stats Grid */}
      <YearlyStatsGrid stats={currentStats} />

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Monthly Chart */}
        <div className="lg:col-span-2">
          <MonthlyChart />
        </div>

        {/* Calendar Heatmap */}
        <div className="lg:col-span-2">
          <CalendarHeatmap />
        </div>

        {/* Achievements */}
        <div className="lg:col-span-2">
          <Achievements />
        </div>
      </div>
    </div>
  )
}
