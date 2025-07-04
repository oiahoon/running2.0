'use client'

import { useEffect, useState } from 'react'

interface DebugInfo {
  environment: string
  databasePath: string
  databaseExists: boolean
  activitiesCount: number
  error?: string
}

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/debug')
      .then(res => res.json())
      .then(data => {
        setDebugInfo(data)
        setLoading(false)
      })
      .catch(error => {
        setDebugInfo({
          environment: 'unknown',
          databasePath: 'unknown',
          databaseExists: false,
          activitiesCount: 0,
          error: error.message
        })
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading debug info...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Debug Information
        </h1>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            System Status
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Environment:</span>
              <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {debugInfo?.environment}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Database Path:</span>
              <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {debugInfo?.databasePath}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Database Exists:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                debugInfo?.databaseExists 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {debugInfo?.databaseExists ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Activities Count:</span>
              <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {debugInfo?.activitiesCount}
              </span>
            </div>

            {debugInfo?.error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <h3 className="text-red-800 dark:text-red-200 font-semibold">Error:</h3>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                  {debugInfo.error}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          
          <div className="space-y-2">
            <a 
              href="/api/activities" 
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Test Activities API
            </a>
            
            <a 
              href="/api/stats" 
              className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors ml-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Test Stats API
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
