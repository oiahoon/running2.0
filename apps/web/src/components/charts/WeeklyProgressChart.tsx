'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface WeeklyData {
  week: string
  activities: number
  distance: number
  time: number
}

interface WeeklyProgressChartProps {
  data: WeeklyData[]
  height?: number
}

export default function WeeklyProgressChart({ data, height = 300 }: WeeklyProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500 dark:text-gray-400">No weekly data available</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            dataKey="week" 
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgb(31 41 55)',
              border: '1px solid rgb(75 85 99)',
              borderRadius: '6px',
              color: 'white'
            }}
            formatter={(value: number, name: string) => [
              name === 'distance' ? `${value.toFixed(1)}km` : 
              name === 'time' ? `${Math.round(value / 60)}min` : value,
              name === 'distance' ? 'Distance' :
              name === 'time' ? 'Time' : 'Activities'
            ]}
            labelFormatter={(label) => `Week ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="distance" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="activities" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
