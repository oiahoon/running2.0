'use client'

import { useEffect, useState } from 'react'

interface DataSourceType {
  id: string
  name: string
  type: string
  description: string
  authMethods: string[]
  supportedActivities: string[]
  setupInstructions: string[]
  configured: boolean
}

interface ConfiguredSource {
  id: string
  name: string
  type: string
  enabled: boolean
  status: 'active' | 'inactive' | 'error'
  lastSync?: string
  errorMessage?: string
  supportedActivities: string[]
}

export default function DataSourcesPage() {
  const [availableTypes, setAvailableTypes] = useState<DataSourceType[]>([])
  const [configuredSources, setConfiguredSources] = useState<ConfiguredSource[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState<'configured' | 'available'>('configured')

  useEffect(() => {
    fetchDataSources()
  }, [])

  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/data-sources')
      const data = await response.json()
      setAvailableTypes(data.availableTypes || [])
      setConfiguredSources(data.configuredSources || [])
    } catch (error) {
      console.error('Failed to fetch data sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sources: ['strava'] }) })
      await fetchDataSources()
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">Data Sources</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Loading source configuration...</p>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Data Sources</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Integration status and supported source types.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-md border border-gray-900 bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-60 dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </section>

      <section className="panel">
        <div className="panel-body">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('configured')}
              className={`rounded-md px-3 py-1.5 text-sm ${activeTab === 'configured' ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              Configured ({configuredSources.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`rounded-md px-3 py-1.5 text-sm ${activeTab === 'available' ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              Available ({availableTypes.length})
            </button>
          </div>
        </div>
      </section>

      {activeTab === 'configured' ? (
        <section className="space-y-4">
          {configuredSources.length === 0 ? (
            <div className="panel">
              <div className="panel-body text-sm text-gray-500 dark:text-gray-400">No configured data sources.</div>
            </div>
          ) : (
            configuredSources.map((source) => (
              <div key={source.id} className="panel">
                <div className="panel-header flex items-center justify-between">
                  <h2 className="text-base font-semibold">{source.name}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${source.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : source.status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {source.status}
                  </span>
                </div>
                <div className="panel-body grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
                  <div>
                    <div className="metric-label">Type</div>
                    <div className="mt-1">{source.type}</div>
                  </div>
                  <div>
                    <div className="metric-label">Enabled</div>
                    <div className="mt-1">{source.enabled ? 'Yes' : 'No'}</div>
                  </div>
                  <div>
                    <div className="metric-label">Last Sync</div>
                    <div className="mt-1">{source.lastSync ? new Date(source.lastSync).toLocaleString() : 'N/A'}</div>
                  </div>
                  <div className="sm:col-span-3">
                    <div className="metric-label mb-1">Supported Activities</div>
                    <div className="flex flex-wrap gap-2">
                      {source.supportedActivities.map((activity) => (
                        <span key={activity} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">{activity}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      ) : (
        <section className="space-y-4">
          {availableTypes.map((type) => (
            <div key={type.id} className="panel">
              <div className="panel-header flex items-center justify-between">
                <h2 className="text-base font-semibold">{type.name}</h2>
                {type.configured && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">configured</span>
                )}
              </div>
              <div className="panel-body grid grid-cols-1 gap-3 text-sm">
                <p className="text-gray-600 dark:text-gray-300">{type.description}</p>
                <div>
                  <div className="metric-label mb-1">Auth Methods</div>
                  <div className="flex flex-wrap gap-2">
                    {type.authMethods.map((method) => (
                      <span key={method} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">{method}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="metric-label mb-1">Supported Activities</div>
                  <div className="flex flex-wrap gap-2">
                    {type.supportedActivities.map((activity) => (
                      <span key={activity} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">{activity}</span>
                    ))}
                  </div>
                </div>
                <details className="rounded-md border border-gray-200 px-3 py-2 dark:border-gray-700">
                  <summary className="cursor-pointer text-sm font-medium">Setup Instructions</summary>
                  <ol className="mt-2 list-decimal pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {type.setupInstructions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ol>
                </details>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="panel">
        <div className="panel-body text-sm text-gray-600 dark:text-gray-300">
          Multi-source persistence and full lifecycle management are tracked in Phase 5 backlog and will be implemented in the next iteration.
        </div>
      </section>
    </div>
  )
}
