'use client'

import { useState } from 'react'
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

interface SyncLog {
  id: number
  source: string
  status: string
  activities_processed: number
  started_at: string
  completed_at: string
  error_message?: string
}

export default function SyncPage() {
  const [isManualSyncing, setIsManualSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([])

  const handleManualSync = async () => {
    setIsManualSyncing(true)
    setSyncResult(null)

    try {
      const response = await fetch('/api/sync/strava', {
        method: 'POST',
      })
      
      const result = await response.json()
      setSyncResult(result)
      
      // Refresh sync logs after sync
      await fetchSyncLogs()
    } catch (error) {
      setSyncResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsManualSyncing(false)
    }
  }

  const fetchSyncLogs = async () => {
    try {
      const response = await fetch('/api/sync/logs')
      if (response.ok) {
        const logs = await response.json()
        setSyncLogs(logs)
      }
    } catch (error) {
      console.error('Failed to fetch sync logs:', error)
    }
  }

  // Fetch logs on component mount
  useState(() => {
    fetchSyncLogs()
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Sync</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Manage your running data synchronization from connected services.
        </p>
      </div>

      {/* Sync Status Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Strava Sync */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Strava
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatic sync every day at 6 AM
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={handleManualSync}
                disabled={isManualSyncing}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isManualSyncing ? 'animate-spin' : ''}`} />
                {isManualSyncing ? 'Syncing...' : 'Manual Sync'}
              </button>
            </div>
          </div>
        </div>

        {/* Garmin Sync (Placeholder) */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 opacity-50">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Garmin
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Coming soon
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                disabled
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
              >
                Configure
              </button>
            </div>
          </div>
        </div>

        {/* Nike Sync (Placeholder) */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 opacity-50">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Nike Run Club
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Coming soon
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                disabled
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
              >
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className={`rounded-md p-4 ${
          syncResult.success 
            ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
            : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {syncResult.success ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                syncResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {syncResult.success ? 'Sync Successful' : 'Sync Failed'}
              </h3>
              <div className={`mt-2 text-sm ${
                syncResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {syncResult.success ? (
                  <p>{syncResult.message}</p>
                ) : (
                  <p>Error: {syncResult.error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Logs */}
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Sync History
          </h3>
          
          {syncLogs.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Activities
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {syncLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {log.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          log.status === 'success' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {log.activities_processed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(log.started_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500 dark:text-gray-400">No sync history available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Sync logs will appear here after your first data sync
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-2">
          🔧 Setup Instructions
        </h3>
        <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
          <p><strong>To enable Strava sync:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Create a Strava API application at <a href="https://developers.strava.com" target="_blank" rel="noopener noreferrer" className="underline">developers.strava.com</a></li>
            <li>Add your Strava credentials to Vercel environment variables</li>
            <li>Authorize your Strava account via the OAuth flow</li>
            <li>Data will sync automatically every day at 6 AM UTC</li>
          </ol>
          <p className="mt-4">
            <strong>Environment Variables needed:</strong><br />
            <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-xs">
              STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}
