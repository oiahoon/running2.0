'use client'

import { useMemo } from 'react'

interface CalendarData {
  date: string
  count: number
  distance?: number
}

interface CalendarHeatmapProps {
  data: CalendarData[]
  year?: number
  height?: number
  cellSize?: number
}

export default function CalendarHeatmap({ 
  data, 
  year = new Date().getFullYear(),
  height = 200,
  cellSize = 12
}: CalendarHeatmapProps) {
  const calendarData = useMemo(() => {
    // Create a map for quick lookup
    const dataMap = new Map(data.map(d => [d.date, d]))
    
    // Generate all dates for the year
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)
    const dates = []
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const dayData = dataMap.get(dateStr)
      
      dates.push({
        date: dateStr,
        dayOfYear: Math.floor((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        dayOfWeek: d.getDay(),
        month: d.getMonth(),
        day: d.getDate(),
        count: dayData?.count || 0,
        distance: dayData?.distance || 0,
      })
    }
    
    return dates
  }, [data, year])

  // Calculate intensity levels (0-4)
  const maxCount = Math.max(...data.map(d => d.count), 1)
  const getIntensity = (count: number) => {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= maxCount * 0.25) return 1
    if (count <= maxCount * 0.5) return 2
    if (count <= maxCount * 0.75) return 3
    return 4
  }

  const getColor = (intensity: number) => {
    const colors = [
      '#ebedf0', // 0 - no activity
      '#9be9a8', // 1 - low
      '#40c463', // 2 - medium-low  
      '#30a14e', // 3 - medium-high
      '#216e39', // 4 - high
    ]
    return colors[intensity]
  }

  const weeks = useMemo(() => {
    const weeksArray = []
    let currentWeek = []
    
    // Add empty cells for the first week if needed
    const firstDay = calendarData[0]?.dayOfWeek || 0
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null)
    }
    
    calendarData.forEach((day, index) => {
      currentWeek.push(day)
      
      if (currentWeek.length === 7) {
        weeksArray.push([...currentWeek])
        currentWeek = []
      }
    })
    
    // Add the last partial week if needed
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeksArray.push(currentWeek)
    }
    
    return weeksArray
  }, [calendarData])

  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-gray-500 dark:text-gray-400">No activity data for {year}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Month labels */}
        <div className="flex mb-2" style={{ marginLeft: 20 }}>
          {monthLabels.map((month, index) => (
            <div
              key={month}
              className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0"
              style={{ 
                width: cellSize * 4.33, // Approximate weeks per month
                textAlign: 'left'
              }}
            >
              {month}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col mr-2">
            {dayLabels.map((day, index) => (
              <div
                key={day}
                className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-end"
                style={{ 
                  height: cellSize + 2,
                  width: 18
                }}
              >
                {index % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col mr-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="mb-1 rounded-sm cursor-pointer hover:ring-2 hover:ring-gray-400 transition-all"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: day ? getColor(getIntensity(day.count)) : 'transparent',
                    }}
                    title={
                      day
                        ? `${day.date}: ${day.count} activities${day.distance ? `, ${day.distance.toFixed(1)}km` : ''}`
                        : ''
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div className="flex items-center space-x-1">
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

        {/* Stats */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Total activities in {year}: {data.reduce((sum, d) => sum + d.count, 0)}</span>
            <span>
              Total distance: {data.reduce((sum, d) => sum + (d.distance || 0), 0).toFixed(1)} km
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
