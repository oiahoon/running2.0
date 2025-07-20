'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, ExclamationCircleIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface SyncRecord {
  id: string
  source: string
  status: 'success' | 'failed' | 'running'
  timestamp: string
  activitiesProcessed: number
  activitiesCreated: number
  activitiesUpdated: number
  duration: number
  errorMessage?: string
}

interface DataSource {
  name: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: string
  totalActivities: number
  userInfo?: {
    name: string
    avatar?: string
    profile?: string
  }
}

// Mock data - in real implementation, this would come from API
const mockSyncRecords: SyncRecord[] = [
  {
    id: '1',
    source: 'Strava',
    status: 'success',
    timestamp: '2025-07-04T12:07:23Z',
    activitiesProcessed: 15,
    activitiesCreated: 3,
    activitiesUpdated: 0,
    duration: 45
  },
  {
    id: '2',
    source: 'Strava',
    status: 'success',
    timestamp: '2025-07-04T06:07:23Z',
    activitiesProcessed: 12,
    activitiesCreated: 1,
    activitiesUpdated: 2,
    duration: 32
  },
  {
    id: '3',
    source: 'Strava',
    status: 'success',
    timestamp: '2025-07-04T00:07:23Z',
    activitiesProcessed: 8,
    activitiesCreated: 0,
    activitiesUpdated: 1,
    duration: 28
  },
  {
    id: '4',
    source: 'Strava',
    status: 'failed',
    timestamp: '2025-07-03T18:07:23Z',
    activitiesProcessed: 0,
    activitiesCreated: 0,
    activitiesUpdated: 0,
    duration: 5,
    errorMessage: 'Rate limit exceeded. Will retry automatically.'
  }
]

const mockDataSources: DataSource[] = [
  {
    name: 'Strava',
    status: 'connected',
    lastSync: '2025-07-04T12:07:23Z',
    totalActivities: 739,
    userInfo: {
      name: 'Huang Yuyao',
      avatar: '/images/default-avatar.svg', // 使用本地默认头像
      profile: 'https://www.strava.com/athletes/your-id'
    }
  }
]

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'success':
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />
    case 'failed':
      return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
    case 'running':
      return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />
    default:
      return <ClockIcon className="w-5 h-5 text-gray-400" />
  }
}

function DataSourceCard({ source }: { source: DataSource }) {
  const statusColors = {
    connected: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    disconnected: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  }

  const statusText = {
    connected: 'Connected',
    disconnected: 'Disconnected',
    error: 'Connection Error'
  }

  return (
    <div className={`p-6 rounded-lg border ${statusColors[source.status]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            S
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {source.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {statusText[source.status]}
            </p>
          </div>
        </div>
        
        {source.userInfo && (
          <div className="flex items-center space-x-3">
            <img 
              src={source.userInfo.avatar} 
              alt={source.userInfo.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {source.userInfo.name}
              </p>
              {source.userInfo.profile && (
                <a 
                  href={source.userInfo.profile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Profile
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Activities</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {source.totalActivities.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Last Sync</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {source.lastSync 
              ? new Date(source.lastSync).toLocaleString()
              : 'Never'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

function SyncRecordRow({ record }: { record: SyncRecord }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center space-x-4">
        <StatusIcon status={record.status} />
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900 dark:text-white">
              {record.source}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(record.timestamp).toLocaleString()}
            </span>
          </div>
          {record.errorMessage ? (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {record.errorMessage}
            </p>
          ) : (
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span>Processed: {record.activitiesProcessed}</span>
              <span>New: {record.activitiesCreated}</span>
              <span>Updated: {record.activitiesUpdated}</span>
              <span>Duration: {record.duration}s</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          record.status === 'success' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : record.status === 'failed'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {record.status === 'success' ? 'Success' : 
           record.status === 'failed' ? 'Failed' : 'Running'}
        </div>
      </div>
    </div>
  )
}

export default function SyncPage() {
  const [syncRecords, setSyncRecords] = useState<SyncRecord[]>(mockSyncRecords)
  const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources)
  const [isLoading, setIsLoading] = useState(false)

  // In real implementation, fetch data from API
  useEffect(() => {
    // fetchSyncRecords()
    // fetchDataSources()
  }, [])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Sync</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Monitor your data synchronization from various fitness platforms.
        </p>
      </div>

      {/* Data Sources */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Connected Data Sources
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {dataSources.map((source, index) => (
            <DataSourceCard key={index} source={source} />
          ))}
        </div>
      </div>

      {/* Sync Schedule Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Automatic Sync Schedule
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              Data is automatically synchronized every 6 hours via GitHub Actions. 
              The next sync is scheduled for approximately {new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleTimeString()}.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Sync History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Sync History
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          {syncRecords.length > 0 ? (
            <div>
              {syncRecords.map((record) => (
                <SyncRecordRow key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Sync Records
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Sync records will appear here once data synchronization begins.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* GitHub Actions Info */}
      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          🔄 Powered by GitHub Actions
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Data synchronization is handled automatically by GitHub Actions workflows. 
          You can monitor the sync process and view detailed logs in your GitHub repository.
        </p>
        <a
          href="https://github.com/oiahoon/running2.0/actions"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          View GitHub Actions →
        </a>
      </div>
    </div>
  )
}
