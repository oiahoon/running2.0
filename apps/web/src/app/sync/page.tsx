'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircleIcon, ExclamationCircleIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface SyncRecord {
  id: string
  source: string
  status: 'success' | 'failed' | 'running' | 'error'
  timestamp: string
  activitiesProcessed: number
  activitiesCreated: number
  activitiesUpdated: number
  errorMessage?: string
}

interface DataSource {
  name: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: string
  totalActivities: number
}

interface SyncHistoryResponse {
  logs: SyncRecord[]
  sources: Array<{
    source: string
    isActive: boolean
    status: string
    lastSync: string | null
  }>
  totalActivities: number
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'success':
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />
    case 'failed':
    case 'error':
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
            </div>
          )}
        </div>
      </div>

      <div className="text-right">
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          record.status === 'success'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : record.status === 'failed' || record.status === 'error'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {record.status === 'success' ? 'Success' :
           (record.status === 'failed' || record.status === 'error') ? 'Failed' : 'Running'}
        </div>
      </div>
    </div>
  )
}

export default function SyncPage() {
  const [syncRecords, setSyncRecords] = useState<SyncRecord[]>([])
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSyncData = useCallback(async () => {
    setError(null)
    try {
      const response = await fetch('/api/sync/history', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to fetch sync history')
      }

      const data: SyncHistoryResponse = await response.json()
      setSyncRecords(data.logs || [])

      const stravaSource = (data.sources || []).find(s => s.source === 'strava')
      setDataSources([
        {
          name: 'Strava',
          status: stravaSource?.isActive ? 'connected' : 'disconnected',
          lastSync: stravaSource?.lastSync || undefined,
          totalActivities: data.totalActivities || 0,
        }
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSyncData()
  }, [fetchSyncData])

  const latestSync = useMemo(() => syncRecords[0], [syncRecords])

  const handleSyncNow = async () => {
    setIsSyncing(true)
    setError(null)
    try {
      const response = await fetch('/api/sync/strava', { method: 'POST' })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'Manual sync failed')
      }
      await fetchSyncData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Manual sync failed')
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Sync</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Loading synchronization data...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Sync</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Monitor and trigger synchronization from fitness platforms.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

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

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3">
            <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Automatic Sync Schedule
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                GitHub Actions workflow runs every 6 hours. You can also trigger a manual Strava sync now.
              </p>
              {latestSync && (
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Latest sync: {new Date(latestSync.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="inline-flex items-center px-3 py-2 border border-blue-300 dark:border-blue-700 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-950/40 hover:bg-blue-50 dark:hover:bg-blue-900/40 disabled:opacity-60"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Sync History
          </h2>
          <button
            onClick={fetchSyncData}
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
                Sync records will appear here after synchronization runs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
