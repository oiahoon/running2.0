'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'

interface PaceData {
  date: string
  pace: number // seconds per km
  distance: number
  heartRate?: number
}

interface PaceAnalysisChartProps {
  data: PaceData[]
  height?: number
  chartType?: 'line' | 'scatter'
  showHeartRate?: boolean
}

export default function PaceAnalysisChart({ 
  data, 
  height = 300,
  chartType = 'line',
  showHeartRate = false
}: PaceAnalysisChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">⏱️</div>
          <p className="text-gray-500 dark:text-gray-400">No pace data available</p>
        </div>
      </div>
    )
  }

  // Format pace from seconds to MM:SS format
  const formatPace = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}/km`
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">
            {formatDate(label)}
          </p>
          <p className="text-blue-600 dark:text-blue-400">
            Pace: {formatPace(payload[0].value)}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Distance: {data.distance.toFixed(1)} km
          </p>
          {data.heartRate && (
            <p className="text-red-500">
              Heart Rate: {data.heartRate} bpm
            </p>
          )}
        </div>
      )
    }
    return null
  }

  // Custom Y-axis tick formatter for pace
  const formatYAxisTick = (value: number) => {
    const minutes = Math.floor(value / 60)
    const seconds = Math.floor(value % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (chartType === 'scatter') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="distance"
            type="number"
            domain={['dataMin', 'dataMax']}
            className="text-xs fill-gray-600 dark:fill-gray-400"
            tick={{ fontSize: 12 }}
            label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            dataKey="pace"
            type="number"
            domain={['dataMin - 30', 'dataMax + 30']}
            className="text-xs fill-gray-600 dark:fill-gray-400"
            tick={{ fontSize: 12 }}
            tickFormatter={formatYAxisTick}
            label={{ value: 'Pace (min/km)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter 
            dataKey="pace" 
            fill="#3b82f6"
            fillOpacity={0.6}
          />
        </ScatterChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="date"
          className="text-xs fill-gray-600 dark:fill-gray-400"
          tick={{ fontSize: 12 }}
          tickFormatter={formatDate}
        />
        <YAxis 
          domain={['dataMin - 30', 'dataMax + 30']}
          className="text-xs fill-gray-600 dark:fill-gray-400"
          tick={{ fontSize: 12 }}
          tickFormatter={formatYAxisTick}
          label={{ value: 'Pace (min/km)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="pace"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
        />
        {showHeartRate && (
          <Line
            type="monotone"
            dataKey="heartRate"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
            yAxisId="right"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
