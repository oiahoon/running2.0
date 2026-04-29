'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AtlasIcon } from '@/components/icons/AtlasIcon'

interface PaceData {
  date: string
  pace: number
  distance: number
  name: string
}

interface PaceAnalysisChartProps {
  data: PaceData[]
  height?: number
}

export default function PaceAnalysisChart({ data, height = 300 }: PaceAnalysisChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <AtlasIcon name="pace" className="mx-auto mb-2 h-10 w-10 text-[var(--route-green)]" />
          <p className="text-gray-500 dark:text-gray-400">No pace data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Pace analysis will show after running activities
          </p>
        </div>
      </div>
    )
  }

  // Format pace for display (convert decimal minutes to mm:ss)
  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace)
    const seconds = Math.round((pace - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            dataKey="date" 
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
            tickFormatter={formatPace}
            domain={['dataMin - 0.5', 'dataMax + 0.5']}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgb(31 41 55)',
              border: '1px solid rgb(75 85 99)',
              borderRadius: '6px',
              color: 'white'
            }}
            formatter={(value: number, name: string) => [
              name === 'pace' ? `${formatPace(value)}/km` : `${value.toFixed(1)}km`,
              name === 'pace' ? 'Pace' : 'Distance'
            ]}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Line 
            type="monotone" 
            dataKey="pace" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
