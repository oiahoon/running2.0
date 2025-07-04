'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

interface ActivityTypeData {
  type: string
  count: number
  percentage: number
}

interface ActivityTypeChartProps {
  data: ActivityTypeData[]
  height?: number
  chartType?: 'pie' | 'bar'
}

const COLORS = {
  Run: '#ef4444',
  Walk: '#3b82f6', 
  Ride: '#8b5cf6',
  Swim: '#06b6d4',
  Hike: '#f97316',
  WeightTraining: '#dc2626',
  Yoga: '#ec4899',
  Other: '#6b7280',
}

const ACTIVITY_ICONS = {
  Run: '🏃',
  Walk: '🚶',
  Ride: '🚴',
  Swim: '🏊',
  Hike: '🥾',
  WeightTraining: '🏋️',
  Yoga: '🧘',
  Other: '⚡',
}

export default function ActivityTypeChart({ 
  data, 
  height = 300,
  chartType = 'pie'
}: ActivityTypeChartProps) {
  if (!data || data.length === 0) {
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">
            {ACTIVITY_ICONS[data.type as keyof typeof ACTIVITY_ICONS] || '⚡'} {data.type}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Count: {data.count}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Percentage: {data.percentage.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {ACTIVITY_ICONS[entry.value as keyof typeof ACTIVITY_ICONS] || '⚡'} {entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="type" 
            className="text-xs fill-gray-600 dark:fill-gray-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs fill-gray-600 dark:fill-gray-400"
            tick={{ fontSize: 12 }}
            label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            fill={(entry: any) => COLORS[entry.type as keyof typeof COLORS] || COLORS.Other}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.type as keyof typeof COLORS] || COLORS.Other} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={CustomLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.type as keyof typeof COLORS] || COLORS.Other} 
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
