'use client'

import { useState } from 'react'
import { useActivityStats } from '@/lib/hooks/useActivities'
import { formatDistance, formatDuration, formatPace } from '@/lib/database/models/Activity'
import DistanceTrendChart from '@/components/charts/DistanceTrendChart'
import ActivityTypeChart from '@/components/charts/ActivityTypeChart'
import CalendarHeatmap from '@/components/charts/CalendarHeatmap'
import ActivityBarChart from '@/components/charts/ActivityBarChart'
import BurnUpChart from '@/components/charts/BurnUpChart'
import PersonalRecords from '@/components/PersonalRecords'
import WeeklyProgressChart from '@/components/charts/WeeklyProgressChart'
import PaceAnalysisChart from '@/components/charts/PaceAnalysisChart'

function YearSelector({ selectedYear, onYearChange }: { 
  selectedYear: number
  onYearChange: (year: number) => void 
}) {
  // Generate years from 2020 to current year
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear; year >= 2020; year--) {
    years.push(year)
  }

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
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
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

function YearlyStatsGrid({ stats }: { stats: any }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="p-5">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statItems = [
    { name: 'Total Distance', value: formatDistance(stats.totalDistance), icon: '📏' },
    { name: 'Total Time', value: formatDuration(stats.totalTime), icon: '⏱️' },
    { name: 'Activities', value: stats.totalActivities.toString(), icon: '🏃' },
    { name: 'Average Pace', value: formatPace(stats.averageDistance > 0 ? stats.totalTime / (stats.totalDistance / 1000) : 0), icon: '⚡' },
    { name: 'Longest Run', value: formatDistance(stats.longestRun), icon: '🎯' },
    { name: 'Average Distance', value: formatDistance(stats.averageDistance), icon: '📊' },
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

function MonthlyChart({ yearStats }: { yearStats: any }) {
  // Transform data for burn-up chart
  const monthlyData = yearStats?.monthlyData ? 
    yearStats.monthlyData.map((month: any, index: number) => ({
      month: new Date(0, index).toLocaleDateString('en-US', { month: 'short' }),
      distance: month.distance || 0,
      activities: month.activities || 0
    })) : []

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <BurnUpChart 
          data={monthlyData}
          height={300}
          showTarget={true}
          targetDistance={1000} // 1000km annual target
          title="Monthly Progress (Burn-up Chart)"
        />
        
        {/* Simple data table */}
        {yearStats?.monthlyData && yearStats.monthlyData.length > 0 && (
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
                  {yearStats.monthlyData.map((month: any) => (
                    <tr key={month.month}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {month.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {month.distance.toFixed(1)} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {month.activities}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatPace(1000 / month.avgPace)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ActivityCalendarSection({ selectedYear, yearStats }: { selectedYear: number, yearStats: any }) {
  // Transform monthly data for bar chart
  const activityData = yearStats?.monthlyData ? 
    yearStats.monthlyData.map((month: any, index: number) => ({
      date: `${selectedYear}-${(index + 1).toString().padStart(2, '0')}-15`, // Use mid-month as representative
      count: month.activities || 0,
      distance: month.distance || 0,
      duration: month.duration || 0
    })) : []

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Activity Calendar - {selectedYear}
        </h3>
        <ActivityBarChart 
          data={activityData}
          height={300}
          showDistance={true}
          title=""
        />
      </div>
    </div>
  )
}

function YearOverviewStats({ yearStats }: { yearStats: any }) {
  if (!yearStats?.basicStats) {
    return (
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Year Overview Statistics
          </h3>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = yearStats.basicStats

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Year Overview Statistics
        </h3>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🏃‍♂️</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total_activities || 0}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Total Activities
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📏</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatDistance((stats.total_distance || 0) * 1000)}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Total Distance
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⏱️</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatDuration(stats.total_time || 0)}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Total Time
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatDistance((stats.avg_distance || 0) * 1000)}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">
                  Avg Distance
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Activity Types Distribution
        </h3>
        {yearStats?.activityTypes && yearStats.activityTypes.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Pie Chart
              </h4>
              <ActivityTypeChart 
                data={yearStats.activityTypes}
                height={250}
                chartType="pie"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Bar Chart
              </h4>
              <ActivityTypeChart 
                data={yearStats.activityTypes}
                height={250}
                chartType="bar"
              />
            </div>
          </div>
        ) : (
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500 dark:text-gray-400">Loading activity types...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function StatsPage() {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const { data: yearStats, isLoading } = useActivityStats(selectedYear)

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistics</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Loading your running analytics...
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="p-5">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

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
      <YearlyStatsGrid stats={yearStats?.summary} />

      {/* Charts and Visualizations */}
      <div className="space-y-8">
        {/* Monthly Chart */}
        <MonthlyChart yearStats={yearStats} />

        {/* Activity Types */}
        <ActivityTypesSection yearStats={yearStats} />

        {/* Personal Records */}
        <PersonalRecords 
          records={yearStats?.personalRecords || {}} 
          isLoading={isLoading}
        />

        {/* Weekly Progress */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              📈 Weekly Progress
            </h3>
            {yearStats?.weeklyStats && yearStats.weeklyStats.length > 0 ? (
              <WeeklyProgressChart data={yearStats.weeklyStats} />
            ) : (
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-gray-500 dark:text-gray-400">Loading weekly progress...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pace Analysis */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              ⚡ Pace Analysis
            </h3>
            {yearStats?.paceAnalysis && yearStats.paceAnalysis.length > 0 ? (
              <PaceAnalysisChart data={yearStats.paceAnalysis} />
            ) : (
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">⚡</div>
                  <p className="text-gray-500 dark:text-gray-400">No pace data available</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Pace analysis shows after running activities
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Heatmap */}
        <ActivityCalendarSection selectedYear={selectedYear} yearStats={yearStats} />

        {/* Year Overview Statistics */}
        <YearOverviewStats yearStats={yearStats} />
      </div>
    </div>
  )
}
