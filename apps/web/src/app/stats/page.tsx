'use client'

import { useMemo, useState } from 'react'
import { useActivityStats } from '@/lib/hooks/useActivities'
import { formatDistance, formatDuration } from '@/lib/database/models/Activity'
import ActivityTypeChart from '@/components/charts/ActivityTypeChart'
import ActivityBarChart from '@/components/charts/ActivityBarChart'
import BurnUpChart from '@/components/charts/BurnUpChart'
import PersonalRecords from '@/components/PersonalRecords'
import WeeklyProgressChart from '@/components/charts/WeeklyProgressChart'
import PaceAnalysisChart from '@/components/charts/PaceAnalysisChart'

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel">
      <div className="panel-body">
        <div className="metric-label">{label}</div>
        <div className="metric-value mt-2">{value}</div>
      </div>
    </div>
  )
}

export default function StatsPage() {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const { data: yearStats, isLoading } = useActivityStats(selectedYear)

  const yearOptions = useMemo(() => {
    const options: number[] = []
    for (let year = currentYear; year >= 2020; year--) {
      options.push(year)
    }
    return options
  }, [currentYear])

  const monthlyData = useMemo(() => {
    return (yearStats?.monthlyData || []).map((month: any, index: number) => ({
      month: new Date(0, index).toLocaleDateString('en-US', { month: 'short' }),
      distance: month.distance || 0,
      activities: month.activities || 0,
    }))
  }, [yearStats?.monthlyData])

  const calendarData = useMemo(() => {
    return (yearStats?.monthlyData || []).map((month: any, index: number) => ({
      date: `${selectedYear}-${(index + 1).toString().padStart(2, '0')}-15`,
      count: month.activities || 0,
      distance: month.distance || 0,
      duration: month.duration || 0,
    }))
  }, [yearStats?.monthlyData, selectedYear])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Statistics</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const stats = yearStats?.basicStats

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Statistics</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Yearly and trend-based performance overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-300">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </section>

      {stats && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Activities" value={Number(stats.total_activities || 0)} />
          <MetricCard label="Total Distance" value={formatDistance((stats.total_distance || 0) * 1000)} />
          <MetricCard label="Total Time" value={formatDuration(stats.total_time || 0)} />
          <MetricCard label="Average Distance" value={formatDistance((stats.avg_distance || 0) * 1000)} />
        </section>
      )}

      {monthlyData.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <h2 className="text-base font-semibold">Monthly Progress</h2>
          </div>
          <div className="panel-body">
            <BurnUpChart
              data={monthlyData}
              height={300}
              showTarget={true}
              targetDistance={1000}
              title=""
            />
          </div>
        </section>
      )}

      {calendarData.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <h2 className="text-base font-semibold">Activity Calendar</h2>
          </div>
          <div className="panel-body">
            <ActivityBarChart data={calendarData} height={300} showDistance={true} title="" />
          </div>
        </section>
      )}

      {yearStats?.activityTypes && yearStats.activityTypes.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <h2 className="text-base font-semibold">Activity Type Distribution</h2>
          </div>
          <div className="panel-body grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ActivityTypeChart data={yearStats.activityTypes} height={260} chartType="pie" />
            <ActivityTypeChart data={yearStats.activityTypes} height={260} chartType="bar" />
          </div>
        </section>
      )}

      {yearStats?.personalRecords && Object.keys(yearStats.personalRecords).length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <h2 className="text-base font-semibold">Personal Records</h2>
          </div>
          <div className="panel-body">
            <PersonalRecords records={yearStats.personalRecords} isLoading={false} />
          </div>
        </section>
      )}

      {yearStats?.weeklyStats && yearStats.weeklyStats.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <h2 className="text-base font-semibold">Weekly Progress</h2>
          </div>
          <div className="panel-body">
            <WeeklyProgressChart data={yearStats.weeklyStats} />
          </div>
        </section>
      )}

      {yearStats?.paceAnalysis && yearStats.paceAnalysis.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <h2 className="text-base font-semibold">Pace Analysis</h2>
          </div>
          <div className="panel-body">
            <PaceAnalysisChart data={yearStats.paceAnalysis} />
          </div>
        </section>
      )}
    </div>
  )
}
