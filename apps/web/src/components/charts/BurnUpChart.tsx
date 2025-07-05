'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface MonthlyData {
  month: string
  distance: number
  activities: number
  target?: number
}

interface BurnUpChartProps {
  data: MonthlyData[]
  height?: number
  showTarget?: boolean
  targetDistance?: number
  title?: string
}

export default function BurnUpChart({ 
  data, 
  height = 300, 
  showTarget = true,
  targetDistance = 1000, // Default 1000km annual target
  title = "Monthly Progress"
}: BurnUpChartProps) {
  
  // Process data for cumulative burn-up chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    let cumulativeDistance = 0
    let cumulativeActivities = 0
    const monthlyTarget = targetDistance / 12 // Distribute target evenly across months
    
    return data.map((item, index) => {
      cumulativeDistance += item.distance / 1000 // Convert to km
      cumulativeActivities += item.activities
      
      return {
        month: item.month,
        cumulative: Math.round(cumulativeDistance * 10) / 10,
        target: Math.round((index + 1) * monthlyTarget * 10) / 10,
        monthly: Math.round(item.distance / 1000 * 10) / 10,
        activities: item.activities,
        totalActivities: cumulativeActivities
      }
    })
  }, [data, targetDistance])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-600 dark:text-blue-400">Cumulative:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data?.cumulative}km
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-600 dark:text-green-400">This Month:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data?.monthly}km
              </span>
            </div>
            {showTarget && (
              <div className="flex items-center justify-between">
                <span className="text-red-600 dark:text-red-400">Target:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data?.target}km
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-purple-600 dark:text-purple-400">Activities:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data?.activities} ({data?.totalActivities} total)
              </span>
            </div>
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
          <div className="text-4xl mb-2">📈</div>
          <p className="text-gray-500 dark:text-gray-400">No progress data available</p>
        </div>
      </div>
    )
  }

  // Calculate if user is ahead or behind target
  const latestData = chartData[chartData.length - 1]
  const isAheadOfTarget = latestData && latestData.cumulative > latestData.target
  const progressPercentage = latestData ? Math.round((latestData.cumulative / latestData.target) * 100) : 0

  return (
    <div className="w-full">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h4>
          {showTarget && latestData && (
            <div className="text-sm">
              <span className={`font-medium ${
                isAheadOfTarget 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {progressPercentage}% of target
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                ({latestData.cumulative}km / {latestData.target}km)
              </span>
            </div>
          )}
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
            label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Cumulative progress area */}
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="#3B82F6"
            strokeWidth={3}
            fill="url(#cumulativeGradient)"
            name="Cumulative Distance"
          />
          
          {/* Target line */}
          {showTarget && (
            <Line
              type="monotone"
              dataKey="target"
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Target"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Legend and Summary */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Cumulative Progress</span>
          </div>
          {showTarget && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-red-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Target</span>
            </div>
          )}
        </div>
        
        {latestData && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Latest: {latestData.cumulative}km in {latestData.totalActivities} activities
          </div>
        )}
      </div>
    </div>
  )
}
