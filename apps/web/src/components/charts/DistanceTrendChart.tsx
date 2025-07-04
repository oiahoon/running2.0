'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface DistanceTrendData {
  month: string
  distance: number
  activities: number
  avgPace: number
}

interface DistanceTrendChartProps {
  data: DistanceTrendData[]
  height?: number
  showArea?: boolean
  color?: string
}

export default function DistanceTrendChart({ 
  data, 
  height = 300, 
  showArea = false,
  color = '#3b82f6' 
}: DistanceTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            Distance: {payload[0].value.toFixed(1)} km
          </p>
          {payload[0].payload.activities && (
            <p className="text-gray-600 dark:text-gray-400">
              Activities: {payload[0].payload.activities}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const ChartComponent = showArea ? AreaChart : LineChart

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="month" 
          className="text-xs fill-gray-600 dark:fill-gray-400"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          className="text-xs fill-gray-600 dark:fill-gray-400"
          tick={{ fontSize: 12 }}
          label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        {showArea ? (
          <Area
            type="monotone"
            dataKey="distance"
            stroke={color}
            fill={color}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        ) : (
          <Line
            type="monotone"
            dataKey="distance"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
        )}
      </ChartComponent>
    </ResponsiveContainer>
  )
}
