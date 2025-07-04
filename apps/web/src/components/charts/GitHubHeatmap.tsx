'use client'

import { useMemo, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface HeatmapData {
  date: string
  count: number
  distance?: number
  duration?: number
}

interface GitHubHeatmapProps {
  data: HeatmapData[]
  initialYear?: number
  height?: number
  cellSize?: number
  showMonthLabels?: boolean
  showWeekLabels?: boolean
  showTooltip?: boolean
  showYearNavigation?: boolean
  onYearChange?: (year: number) => void
  yearData?: { [year: number]: HeatmapData[] } // Add support for multi-year data
}

export default function GitHubHeatmap({ 
  data, 
  initialYear = new Date().getFullYear(),
  height = 300,
  cellSize = 14,
  showMonthLabels = true,
  showWeekLabels = true,
  showTooltip = true,
  showYearNavigation = true,
  onYearChange,
  yearData
}: GitHubHeatmapProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear)
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number; x: number; y: number } | null>(null)

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear)
    onYearChange?.(newYear)
  }

  // Use year-specific data if available, otherwise filter from main data
  const currentYearData = useMemo(() => {
    if (yearData && yearData[selectedYear]) {
      return yearData[selectedYear]
    }
    
    // Filter data for selected year
    return data.filter(d => {
      const date = new Date(d.date)
      return date.getFullYear() === selectedYear
    })
  }, [data, selectedYear, yearData])

  const calendarData = useMemo(() => {
    // Create a map for quick lookup
    const dataMap = new Map(currentYearData.map(d => [d.date, d]))
    
    // Generate all dates for the year
    const startDate = new Date(selectedYear, 0, 1)
    const endDate = new Date(selectedYear, 11, 31)
    const dates = []
    
    // Start from the first Sunday of the year or before
    const firstSunday = new Date(startDate)
    firstSunday.setDate(startDate.getDate() - startDate.getDay())
    
    // End at the last Saturday of the year or after
    const lastSaturday = new Date(endDate)
    lastSaturday.setDate(endDate.getDate() + (6 - endDate.getDay()))
    
    for (let d = new Date(firstSunday); d <= lastSaturday; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const dayData = dataMap.get(dateStr)
      const isCurrentYear = d.getFullYear() === selectedYear
      
      dates.push({
        date: dateStr,
        dayOfYear: Math.floor((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        dayOfWeek: d.getDay(),
        week: Math.floor((d.getTime() - firstSunday.getTime()) / (1000 * 60 * 60 * 24 * 7)),
        month: d.getMonth(),
        day: d.getDate(),
        count: dayData?.count || 0,
        distance: dayData?.distance || 0,
        duration: dayData?.duration || 0,
        isCurrentYear
      })
    }
    
    return dates
  }, [currentYearData, selectedYear])

  const maxCount = useMemo(() => {
    return Math.max(...calendarData.map(d => d.count), 1)
  }, [calendarData])

  const getIntensity = (count: number) => {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= maxCount * 0.25) return 1
    if (count <= maxCount * 0.5) return 2
    if (count <= maxCount * 0.75) return 3
    return 4
  }

  const getColor = (intensity: number, isCurrentYear: boolean) => {
    if (!isCurrentYear) {
      return 'fill-gray-100 dark:fill-gray-800'
    }
    
    const colors = [
      'fill-gray-100 dark:fill-gray-800', // 0 activities
      'fill-green-200 dark:fill-green-900', // 1 activity
      'fill-green-300 dark:fill-green-700', // low
      'fill-green-500 dark:fill-green-500', // medium
      'fill-green-700 dark:fill-green-300', // high
    ]
    return colors[intensity] || colors[0]
  }

  const weeks = Math.ceil(calendarData.length / 7)
  const svgWidth = weeks * (cellSize + 2) + 50
  const svgHeight = 7 * (cellSize + 2) + 50

  const monthLabels = useMemo(() => {
    const labels = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    for (let month = 0; month < 12; month++) {
      const firstDayOfMonth = calendarData.find(d => d.month === month && d.isCurrentYear)
      if (firstDayOfMonth) {
        labels.push({
          month: months[month],
          x: firstDayOfMonth.week * (cellSize + 2) + 25
        })
      }
    }
    
    return labels
  }, [calendarData, cellSize])

  const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const totalActivities = calendarData.filter(d => d.isCurrentYear).reduce((sum, d) => sum + d.count, 0)
  const totalDistance = calendarData.filter(d => d.isCurrentYear).reduce((sum, d) => sum + (d.distance || 0), 0)

  return (
    <div className="space-y-4">
      {/* Header with Year Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            🔥 Activity Heatmap
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {totalActivities} activities • {(totalDistance / 1000).toFixed(0)}km in {selectedYear}
          </p>
        </div>
        
        {showYearNavigation && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleYearChange(selectedYear - 1)}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              title="Previous year"
            >
              <ChevronLeftIcon className="w-5 h-5" />
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
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Heatmap */}
      <div className="relative bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} className="font-mono text-xs">
          {/* Month labels */}
          {showMonthLabels && monthLabels.map((label, index) => (
            <text
              key={index}
              x={label.x}
              y={15}
              className="fill-gray-600 dark:fill-gray-400 text-xs"
              textAnchor="middle"
            >
              {label.month}
            </text>
          ))}
          
          {/* Week day labels */}
          {showWeekLabels && weekLabels.map((label, index) => (
            <text
              key={index}
              x={15}
              y={30 + index * (cellSize + 2) + cellSize / 2}
              className="fill-gray-600 dark:fill-gray-400 text-xs"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {label}
            </text>
          ))}
          
          {/* Calendar cells */}
          {calendarData.map((day, index) => {
            const x = 25 + day.week * (cellSize + 2)
            const y = 25 + day.dayOfWeek * (cellSize + 2)
            const intensity = getIntensity(day.count)
            
            return (
              <rect
                key={day.date}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={2}
                className={`${getColor(intensity, day.isCurrentYear)} stroke-gray-200 dark:stroke-gray-700 hover:stroke-gray-400 dark:hover:stroke-gray-500 cursor-pointer transition-colors`}
                strokeWidth={0.5}
                onMouseEnter={(e) => {
                  if (showTooltip && day.isCurrentYear) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setHoveredCell({
                      date: day.date,
                      count: day.count,
                      x: rect.left + rect.width / 2,
                      y: rect.top
                    })
                  }
                }}
                onMouseLeave={() => setHoveredCell(null)}
              />
            )
          })}
        </svg>
        
        {/* Tooltip */}
        {hoveredCell && showTooltip && (
          <div
            className="fixed z-50 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-md px-2 py-1 pointer-events-none shadow-lg"
            style={{
              left: hoveredCell.x,
              top: hoveredCell.y - 40,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="text-center">
              <div className="font-medium">
                {hoveredCell.count} {hoveredCell.count === 1 ? 'activity' : 'activities'}
              </div>
              <div className="text-gray-300">
                {new Date(hoveredCell.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex items-center space-x-1">
          {[0, 1, 2, 3, 4].map((intensity) => (
            <div
              key={intensity}
              className={`w-3 h-3 rounded-sm ${getColor(intensity, true)}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
