'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ActivityData {
  date: string
  count: number
  distance: number
  duration: number
}

interface ActivityBarChartProps {
  data: ActivityData[]
  height?: number
  showDistance?: boolean
  title?: string
}

export default function ActivityBarChart({ 
  data, 
  height = 300, 
  showDistance = true,
  title = "Daily Activity"
}: ActivityBarChartProps) {
  
  // Process data for chart - group by week or month depending on data range
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Group by week for better visualization
    const weeklyData = new Map<string, { count: number; distance: number; duration: number }>()
    
    sortedData.forEach(item => {
      const date = new Date(item.date)
      // Get Monday of the week
      const monday = new Date(date)
      monday.setDate(date.getDate() - date.getDay() + 1)
      const weekKey = monday.toISOString().split('T')[0]
      
      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, { count: 0, distance: 0, duration: 0 })
      }
      
      const week = weeklyData.get(weekKey)!
      week.count += item.count
      week.distance += item.distance
      week.duration += item.duration
    })
    
    // Convert to array and format
    return Array.from(weeklyData.entries()).map(([date, data]) => ({
      week: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      activities: data.count,
      distance: Math.round(data.distance / 1000 * 10) / 10, // Convert to km with 1 decimal
      duration: Math.round(data.duration / 3600 * 10) / 10, // Convert to hours with 1 decimal
      fullDate: date
    }))
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white mb-2">
            Week of {label}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-600 dark:text-blue-400">Activities:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {payload[0]?.value || 0}
              </span>
            </div>
            {showDistance && payload[1] && (
              <div className="flex items-center justify-between">
                <span className="text-green-600 dark:text-green-400">Distance:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {payload[1].value}km
                </span>
              </div>
            )}
            {payload[2] && (
              <div className="flex items-center justify-between">
                <span className="text-purple-600 dark:text-purple-400">Duration:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {payload[2].value}h
                </span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500 dark:text-gray-400">No activity data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && (
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {title}
        </h4>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="week" 
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Bar 
            dataKey="activities" 
            fill="#3B82F6" 
            name="Activities"
            radius={[2, 2, 0, 0]}
          />
          
          {showDistance && (
            <Bar 
              dataKey="distance" 
              fill="#10B981" 
              name="Distance (km)"
              radius={[2, 2, 0, 0]}
            />
          )}
          
          <Bar 
            dataKey="duration" 
            fill="#8B5CF6" 
            name="Duration (h)"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Activities</span>
        </div>
        {showDistance && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Distance (km)</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Duration (h)</span>
        </div>
      </div>
    </div>
  )
}
