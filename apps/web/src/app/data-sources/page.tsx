'use client'

import { useEffect, useMemo, useState } from 'react'

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

function statusTag(status: ConfiguredSource['status']) {
  if (status === 'active') return 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/35'
  if (status === 'error') return 'bg-red-500/15 text-red-300 ring-1 ring-red-400/35'
  return 'bg-gray-500/15 text-gray-300 ring-1 ring-gray-400/35'
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
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: ['strava'] }),
      })
      await fetchDataSources()
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setSyncing(false)
    }
  }

  const summary = useMemo(() => {
    const active = configuredSources.filter((s) => s.status === 'active').length
    const errors = configuredSources.filter((s) => s.status === 'error').length
    return { total: configuredSources.length, active, errors }
  }, [configuredSources])

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="panel">
          <div className="panel-body py-6 sm:py-7">
            <h2 className="section-title">Integration Hub</h2>
            <p className="section-subtitle">Loading source configuration...</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="panel-body py-6 sm:py-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="section-title">Integration Hub</h2>
              <p className="section-subtitle">Manage source lifecycle, validate health, and keep sync operations reliable.</p>
            </div>
            <button onClick={handleSync} disabled={syncing} className="action-primary disabled:opacity-60">
              {syncing ? 'Syncing...' : 'Run Sync'}
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPI label="Configured" value={String(summary.total)} />
        <KPI label="Active" value={String(summary.active)} />
        <KPI label="Error" value={String(summary.errors)} />
      </section>

      <section className="panel">
        <div className="panel-body flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('configured')} className={activeTab === 'configured' ? 'action-primary !py-2' : 'action-secondary !py-2'}>
            Configured ({configuredSources.length})
          </button>
          <button onClick={() => setActiveTab('available')} className={activeTab === 'available' ? 'action-primary !py-2' : 'action-secondary !py-2'}>
            Available ({availableTypes.length})
          </button>
        </div>
      </section>

      {activeTab === 'configured' ? (
        <section className="space-y-4">
          {configuredSources.length === 0 ? (
            <div className="panel">
              <div className="panel-body text-sm text-gray-400">No configured data sources.</div>
            </div>
          ) : (
            configuredSources.map((source) => (
              <div key={source.id} className="panel">
                <div className="panel-header flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{source.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusTag(source.status)}`}>{source.status}</span>
                </div>
                <div className="panel-body grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm text-gray-200">
                  <Info label="Type" value={source.type} />
                  <Info label="Enabled" value={source.enabled ? 'Yes' : 'No'} />
                  <Info label="Last Sync" value={source.lastSync ? new Date(source.lastSync).toLocaleString() : 'N/A'} />
                  <div className="sm:col-span-3">
                    <div className="metric-label mb-2">Supported Activities</div>
                    <div className="flex flex-wrap gap-2">
                      {source.supportedActivities.map((activity) => (
                        <span key={activity} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-200 ring-1 ring-white/15">{activity}</span>
                      ))}
                    </div>
                  </div>
                  {source.errorMessage ? <p className="sm:col-span-3 text-sm text-red-300">{source.errorMessage}</p> : null}
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
                <h3 className="text-lg font-semibold text-white">{type.name}</h3>
                {type.configured ? (
                  <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs text-blue-200 ring-1 ring-blue-400/35">configured</span>
                ) : null}
              </div>
              <div className="panel-body grid grid-cols-1 gap-4 text-sm text-gray-200">
                <p className="text-gray-300">{type.description}</p>

                <div>
                  <div className="metric-label mb-2">Auth Methods</div>
                  <div className="flex flex-wrap gap-2">
                    {type.authMethods.map((method) => (
                      <span key={method} className="rounded-full bg-white/10 px-2 py-0.5 text-xs ring-1 ring-white/15">{method}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="metric-label mb-2">Supported Activities</div>
                  <div className="flex flex-wrap gap-2">
                    {type.supportedActivities.map((activity) => (
                      <span key={activity} className="rounded-full bg-white/10 px-2 py-0.5 text-xs ring-1 ring-white/15">{activity}</span>
                    ))}
                  </div>
                </div>

                <details className="rounded-lg border border-white/15 bg-white/5 px-3 py-2">
                  <summary className="cursor-pointer text-sm font-medium text-white">Setup Instructions</summary>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-300">
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
    </div>
  )
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel">
      <div className="panel-body">
        <div className="metric-label">{label}</div>
        <div className="mt-2 text-xl font-semibold text-white">{value}</div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="metric-label">{label}</div>
      <div className="mt-1 text-sm text-gray-100">{value}</div>
    </div>
  )
}
