'use client'

import { formatDistance, formatDuration, formatPace } from '@/lib/database/models/Activity'

interface PersonalRecord {
  longestRun?: {
    name: string
    distance: number
    start_date: string
  }
  fastestPace?: {
    name: string
    distance: number
    moving_time: number
    start_date: string
    pace_per_km: number
  }
  mostElevation?: {
    name: string
    total_elevation_gain: number
    distance: number
    start_date: string
  }
}

interface PersonalRecordsProps {
  records: PersonalRecord
  isLoading?: boolean
}

function RecordCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  activityName, 
  date,
  isLoading = false 
}: {
  title: string
  value: string
  subtitle: string
  icon: string
  activityName?: string
  date?: string
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
          <div className="ml-4 flex-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl">
            {icon}
          </div>
        </div>
        <div className="ml-4 flex-1">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {title}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </div>
          {activityName && (
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 truncate">
              {activityName}
            </div>
          )}
          {date && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(date).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PersonalRecords({ records, isLoading = false }: PersonalRecordsProps) {
  const recordsData = [
    {
      title: 'Longest Distance',
      value: records.longestRun ? formatDistance(records.longestRun.distance) : 'No data',
      subtitle: 'Single activity',
      icon: '🏃‍♂️',
      activityName: records.longestRun?.name,
      date: records.longestRun?.start_date,
    },
    {
      title: 'Fastest Pace',
      value: records.fastestPace ? formatPace(records.fastestPace.pace_per_km) : 'No data',
      subtitle: 'Per kilometer',
      icon: '⚡',
      activityName: records.fastestPace?.name,
      date: records.fastestPace?.start_date,
    },
    {
      title: 'Most Elevation',
      value: records.mostElevation ? `${Math.round(records.mostElevation.total_elevation_gain)}m` : 'No data',
      subtitle: 'Single activity',
      icon: '⛰️',
      activityName: records.mostElevation?.name,
      date: records.mostElevation?.start_date,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          🏆 Personal Records
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recordsData.map((record, index) => (
            <RecordCard
              key={index}
              title={record.title}
              value={record.value}
              subtitle={record.subtitle}
              icon={record.icon}
              activityName={record.activityName}
              date={record.date}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Additional Records */}
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
          📊 More Records
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Longest Week:</span>
              <span className="font-medium text-gray-900 dark:text-white">Coming soon</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Longest Month:</span>
              <span className="font-medium text-gray-900 dark:text-white">Coming soon</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Most Active Day:</span>
              <span className="font-medium text-gray-900 dark:text-white">Coming soon</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Highest HR:</span>
              <span className="font-medium text-gray-900 dark:text-white">Coming soon</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Most Calories:</span>
              <span className="font-medium text-gray-900 dark:text-white">Coming soon</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Current Streak:</span>
              <span className="font-medium text-gray-900 dark:text-white">Coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
