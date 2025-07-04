'use client'

import { useState } from 'react'
import { useActivityStats } from '@/lib/hooks/useActivities'
import GitHubHeatmap from './GitHubHeatmap'

interface YearAwareHeatmapProps {
  initialYear?: number
  height?: number
  cellSize?: number
  showYearNavigation?: boolean
}

export default function YearAwareHeatmap({
  initialYear = new Date().getFullYear(),
  height = 300,
  cellSize = 14,
  showYearNavigation = true
}: YearAwareHeatmapProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear)
  
  // Fetch stats for the selected year
  const { data: yearStats, isLoading } = useActivityStats(selectedYear)

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              🔥 Activity Heatmap
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading activities for {selectedYear}...
            </p>
          </div>
          
          {showYearNavigation && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleYearChange(selectedYear - 1)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                title="Previous year"
              >
                ←
              </button>
              
              <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-16 text-center">
                {selectedYear}
              </span>
              
              <button
                onClick={() => handleYearChange(selectedYear + 1)}
                disabled={selectedYear >= new Date().getFullYear()}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next year"
              >
                →
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const dailyStats = yearStats?.dailyStats || []
  const heatmapData = dailyStats.map((day: any) => ({
    date: day.date,
    count: day.activities || 0,
    distance: day.distance || 0,
    duration: day.duration || 0
  }))

  return (
    <GitHubHeatmap
      data={heatmapData}
      initialYear={selectedYear}
      height={height}
      cellSize={cellSize}
      showYearNavigation={showYearNavigation}
      onYearChange={handleYearChange}
      showTooltip={true}
    />
  )
}
