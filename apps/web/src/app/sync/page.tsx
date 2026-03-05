'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

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

function statusBadge(status: SyncRecord['status']) {
  if (status === 'success') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  if (status === 'failed' || status === 'error') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
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
      if (!response.ok) throw new Error('Failed to fetch sync history')

      const data: SyncHistoryResponse = await response.json()
      setSyncRecords(data.logs || [])

      const stravaSource = (data.sources || []).find(s => s.source === 'strava')
      setDataSources([
        {
          name: 'Strava',
          status: stravaSource?.isActive ? 'connected' : 'disconnected',
          lastSync: stravaSource?.lastSync || undefined,
          totalActivities: data.totalActivities || 0,
        },
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

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Sync</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Source status and recent synchronization history.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSyncData}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Refresh
          </button>
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="inline-flex items-center rounded-md border border-gray-900 bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-60 dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
          >
            <ArrowPathIcon className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </section>

      {error && (
        <section className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </section>
      )}

      {isLoading ? (
        <section className="panel">
          <div className="panel-body text-sm text-gray-500 dark:text-gray-400">Loading synchronization data...</div>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {dataSources.map((source) => (
              <div key={source.name} className="panel">
                <div className="panel-header flex items-center justify-between">
                  <h2 className="text-base font-semibold">{source.name}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${source.status === 'connected' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {source.status}
                  </span>
                </div>
                <div className="panel-body grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="metric-label">Total Activities</div>
                    <div className="mt-1 font-semibold">{source.totalActivities.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="metric-label">Last Sync</div>
                    <div className="mt-1 font-semibold">{source.lastSync ? new Date(source.lastSync).toLocaleString() : 'Never'}</div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="panel">
            <div className="panel-header flex items-center justify-between">
              <h2 className="text-base font-semibold">Sync History</h2>
              {latestSync && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Latest: {new Date(latestSync.timestamp).toLocaleString()}
                </span>
              )}
            </div>
            <div className="panel-body p-0">
              {syncRecords.length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">No sync records yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        <th className="px-5 py-2 font-medium">Time</th>
                        <th className="px-5 py-2 font-medium">Source</th>
                        <th className="px-5 py-2 font-medium">Status</th>
                        <th className="px-5 py-2 font-medium">Processed</th>
                        <th className="px-5 py-2 font-medium">Created</th>
                        <th className="px-5 py-2 font-medium">Updated</th>
                        <th className="px-5 py-2 font-medium">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syncRecords.map((record) => (
                        <tr key={record.id} className="border-b border-gray-50 dark:border-gray-800">
                          <td className="px-5 py-2">{new Date(record.timestamp).toLocaleString()}</td>
                          <td className="px-5 py-2">{record.source}</td>
                          <td className="px-5 py-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-5 py-2">{record.activitiesProcessed}</td>
                          <td className="px-5 py-2">{record.activitiesCreated}</td>
                          <td className="px-5 py-2">{record.activitiesUpdated}</td>
                          <td className="px-5 py-2 text-gray-500 dark:text-gray-400">{record.errorMessage || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
