'use client'

import { useMemo } from 'react'

interface HeatmapData {
  date: string
  count: number
  distance?: number
  duration?: number
}

interface GitHubHeatmapProps {
  data: HeatmapData[]
  year?: number
  height?: number
  cellSize?: number
  showMonthLabels?: boolean
  showWeekLabels?: boolean
  showTooltip?: boolean
}

export default function GitHubHeatmap({ 
  data, 
  year = new Date().getFullYear(),
  height = 200,
  cellSize = 11,
  showMonthLabels = true,
  showWeekLabels = true,
  showTooltip = true
}: GitHubHeatmapProps) {
  const calendarData = useMemo(() => {
    // Create a map for quick lookup
    const dataMap = new Map(data.map(d => [d.date, d]))
    
    // Generate all dates for the year
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)
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
      const isCurrentYear = d.getFullYear() === year
      
      dates.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        month: d.getMonth(),
        day: d.getDate(),
        count: isCurrentYear ? (dayData?.count || 0) : 0,
        distance: isCurrentYear ? (dayData?.distance || 0) : 0,
        duration: isCurrentYear ? (dayData?.duration || 0) : 0,
        isCurrentYear,
      })
    }
    
    return dates
  }, [data, year])

  // Calculate intensity levels (0-4) like GitHub
  const maxCount = Math.max(...data.map(d => d.count), 1)
  const getIntensity = (count: number) => {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= Math.ceil(maxCount * 0.25)) return 1
    if (count <= Math.ceil(maxCount * 0.5)) return 2
    if (count <= Math.ceil(maxCount * 0.75)) return 3
    return 4
  }

  const getColor = (intensity: number) => {
    const colors = [
      '#ebedf0', // 0 - no activity (light gray)
      '#9be9a8', // 1 - low activity (light green)
      '#40c463', // 2 - medium-low activity (medium green)
      '#30a14e', // 3 - medium-high activity (dark green)
      '#216e39', // 4 - high activity (darkest green)
    ]
    return colors[intensity]
  }

  const weeks = useMemo(() => {
    const weeksArray = []
    let currentWeek = []
    
    calendarData.forEach((day, index) => {
      currentWeek.push(day)
      
      if (currentWeek.length === 7) {
        weeksArray.push([...currentWeek])
        currentWeek = []
      }
    })
    
    if (currentWeek.length > 0) {
      weeksArray.push(currentWeek)
    }
    
    return weeksArray
  }, [calendarData])

  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Calculate month positions
  const monthPositions = useMemo(() => {
    const positions = []
    let currentMonth = -1
    
    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week.find(day => day?.isCurrentYear)
      if (firstDayOfWeek && firstDayOfWeek.month !== currentMonth) {
        currentMonth = firstDayOfWeek.month
        positions.push({
          month: currentMonth,
          x: weekIndex * (cellSize + 2),
          label: monthLabels[currentMonth]
        })
      }
    })
    
    return positions
  }, [weeks, cellSize, monthLabels])

  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-gray-500 dark:text-gray-400">No activity data for {year}</p>
        </div>
      </div>
    )
  }

  const totalActivities = data.reduce((sum, d) => sum + d.count, 0)
  const totalDistance = data.reduce((sum, d) => sum + (d.distance || 0), 0)
  const activeDays = data.filter(d => d.count > 0).length

  return (
    <div className="w-full">
      {/* Header Stats */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span><strong>{totalActivities}</strong> activities in {year}</span>
        <span><strong>{activeDays}</strong> active days</span>
        {totalDistance > 0 && (
          <span><strong>{(totalDistance / 1000).toFixed(1)}</strong> km total</span>
        )}
      </div>

      <div className="inline-block">
        {/* Month labels */}
        {showMonthLabels && (
          <div className="flex mb-2" style={{ marginLeft: showWeekLabels ? 20 : 0 }}>
            {monthPositions.map((pos) => (
              <div
                key={pos.month}
                className="text-xs text-gray-600 dark:text-gray-400"
                style={{ 
                  position: 'absolute',
                  left: pos.x,
                  fontSize: '11px'
                }}
              >
                {pos.label}
              </div>
            ))}
          </div>
        )}

        <div className="flex" style={{ marginTop: showMonthLabels ? 16 : 0 }}>
          {/* Day labels */}
          {showWeekLabels && (
            <div className="flex flex-col mr-2">
              {dayLabels.map((day, index) => (
                <div
                  key={day}
                  className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-end"
                  style={{ 
                    height: cellSize + 2,
                    width: 18,
                    fontSize: '9px'
                  }}
                >
                  {index % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>
          )}

          {/* Calendar grid */}
          <div className="flex gap-0.5">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {week.map((day, dayIndex) => {
                  if (!day) return <div key={dayIndex} style={{ width: cellSize, height: cellSize }} />
                  
                  const intensity = day.isCurrentYear ? getIntensity(day.count) : 0
                  const color = getColor(intensity)
                  
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="rounded-sm cursor-pointer hover:ring-1 hover:ring-gray-400 transition-all group relative"
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: color,
                      }}
                    >
                      {/* Tooltip */}
                      {showTooltip && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          <div className="text-center">
                            <div className="font-medium">{day.date}</div>
                            <div>{day.count} activities</div>
                            {day.distance > 0 && (
                              <div>{(day.distance / 1000).toFixed(1)} km</div>
                            )}
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div className="flex items-center gap-1 mx-2">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="rounded-sm"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: getColor(level),
                }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
