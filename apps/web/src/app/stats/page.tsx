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
    for (let year = currentYear; year >= 2020; year--) options.push(year)
    return options
  }, [currentYear])

  const monthlyData = useMemo(
    () =>
      (yearStats?.monthlyData || []).map((month: any, index: number) => ({
        month: new Date(0, index).toLocaleDateString('en-US', { month: 'short' }),
        distance: month.distance || 0,
        activities: month.activities || 0,
      })),
    [yearStats?.monthlyData]
  )

  const calendarData = useMemo(
    () =>
      (yearStats?.monthlyData || []).map((month: any, index: number) => ({
        date: `${selectedYear}-${(index + 1).toString().padStart(2, '0')}-15`,
        count: month.activities || 0,
        distance: month.distance || 0,
        duration: month.duration || 0,
      })),
    [yearStats?.monthlyData, selectedYear]
  )

  const stats = yearStats?.basicStats

  if (isLoading) {
    return (
      <div className="space-y-6">
        <section className="panel">
          <div className="panel-body py-6 sm:py-7">
            <h2 className="section-title">Analytics Studio</h2>
            <p className="section-subtitle">Loading yearly analysis...</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="panel-body py-6 sm:py-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="section-title">Analytics Studio</h2>
              <p className="section-subtitle">Review yearly performance, distribution, progression, and record-level breakthroughs.</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-300/60 focus:outline-none"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {stats ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Activities" value={Number(stats.total_activities || 0)} />
          <MetricCard label="Total Distance" value={formatDistance((stats.total_distance || 0) * 1000)} />
          <MetricCard label="Total Time" value={formatDuration(stats.total_time || 0)} />
          <MetricCard label="Average Distance" value={formatDistance((stats.avg_distance || 0) * 1000)} />
        </section>
      ) : null}

      {monthlyData.length > 0 ? (
        <section className="panel">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-white">Distance Burn-up</h3>
          </div>
          <div className="panel-body">
            <BurnUpChart data={monthlyData} height={300} showTarget={true} targetDistance={1000} title="" />
          </div>
        </section>
      ) : null}

      {calendarData.length > 0 ? (
        <section className="panel">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-white">Activity Distribution by Month</h3>
          </div>
          <div className="panel-body">
            <ActivityBarChart data={calendarData} height={300} showDistance={true} title="" />
          </div>
        </section>
      ) : null}

      {yearStats?.activityTypes && yearStats.activityTypes.length > 0 ? (
        <section className="panel">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-white">Activity Type Mix</h3>
          </div>
          <div className="panel-body grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ActivityTypeChart data={yearStats.activityTypes} height={260} chartType="pie" />
            <ActivityTypeChart data={yearStats.activityTypes} height={260} chartType="bar" />
          </div>
        </section>
      ) : null}

      {yearStats?.weeklyStats && yearStats.weeklyStats.length > 0 ? (
        <section className="panel">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-white">Weekly Progress Pattern</h3>
          </div>
          <div className="panel-body">
            <WeeklyProgressChart data={yearStats.weeklyStats} />
          </div>
        </section>
      ) : null}

      {yearStats?.paceAnalysis && yearStats.paceAnalysis.length > 0 ? (
        <section className="panel">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-white">Pace Pattern</h3>
          </div>
          <div className="panel-body">
            <PaceAnalysisChart data={yearStats.paceAnalysis} />
          </div>
        </section>
      ) : null}

      {yearStats?.personalRecords && Object.keys(yearStats.personalRecords).length > 0 ? (
        <section className="panel">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-white">Personal Records</h3>
          </div>
          <div className="panel-body">
            <PersonalRecords records={yearStats.personalRecords} isLoading={false} />
          </div>
        </section>
      ) : null}
    </div>
  )
}
