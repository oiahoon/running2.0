'use client'

import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/lib/i18n'

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
  if (status === 'active') return 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-400/35 dark:text-emerald-300'
  if (status === 'error') return 'bg-red-500/15 text-red-700 ring-1 ring-red-400/35 dark:text-red-300'
  return 'bg-gray-500/15 text-gray-700 ring-1 ring-gray-400/35 dark:text-gray-300'
}

export default function DataSourcesPage() {
  const { t, dateLocale } = useI18n()
  const [availableTypes, setAvailableTypes] = useState<DataSourceType[]>([])
  const [configuredSources, setConfiguredSources] = useState<ConfiguredSource[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
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
    setMessage(null)
    setError(null)
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: ['strava'] }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || t('sync.manualFailed'))
      }
      const data = await response.json().catch(() => ({}))
      setMessage(data?.message || t('sources.syncQueued'))
      await fetchDataSources()
    } catch (error) {
      console.error('Sync failed:', error)
      setError(error instanceof Error ? error.message : t('sync.manualFailed'))
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
            <h2 className="section-title">{t('sources.hub')}</h2>
            <p className="section-subtitle">{t('sources.loading')}</p>
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
              <h2 className="section-title">{t('sources.hub')}</h2>
              <p className="section-subtitle">{t('sources.copy')}</p>
            </div>
            <button onClick={handleSync} disabled={syncing} className="action-primary disabled:opacity-60">
              {syncing ? t('sync.queueing') : t('sources.runSync')}
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
          {error}
        </section>
      ) : null}

      {message ? (
        <section className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
          {message}
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPI label={t('common.configured')} value={String(summary.total)} />
        <KPI label={t('common.active')} value={String(summary.active)} />
        <KPI label={t('common.error')} value={String(summary.errors)} />
      </section>

      <section className="panel">
        <div className="panel-body flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('configured')} className={activeTab === 'configured' ? 'action-primary !py-2' : 'action-secondary !py-2'}>
            {t('common.configured')} ({configuredSources.length})
          </button>
          <button onClick={() => setActiveTab('available')} className={activeTab === 'available' ? 'action-primary !py-2' : 'action-secondary !py-2'}>
            {t('common.available')} ({availableTypes.length})
          </button>
        </div>
      </section>

      {activeTab === 'configured' ? (
        <section className="space-y-4">
          {configuredSources.length === 0 ? (
            <div className="panel">
              <div className="panel-body text-sm text-[var(--text-muted)]">{t('sources.noConfigured')}</div>
            </div>
          ) : (
            configuredSources.map((source) => (
              <div key={source.id} className="panel">
                <div className="panel-header flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--text-strong)]">{source.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusTag(source.status)}`}>{source.status}</span>
                </div>
                <div className="panel-body grid grid-cols-1 gap-4 text-sm text-[var(--text-strong)] sm:grid-cols-3">
                  <Info label={t('common.type')} value={source.type} />
                  <Info label={t('common.enabled')} value={source.enabled ? t('common.yes') : t('common.no')} />
                  <Info label={t('sources.lastSync')} value={source.lastSync ? new Date(source.lastSync).toLocaleString(dateLocale) : t('common.none')} />
                  <div className="sm:col-span-3">
                    <div className="metric-label mb-2">{t('sources.supportedActivities')}</div>
                    <div className="flex flex-wrap gap-2">
                      {source.supportedActivities.map((activity) => (
                        <span key={activity} className="rounded-full bg-slate-200/70 px-2 py-0.5 text-xs text-slate-700 ring-1 ring-slate-300 dark:bg-white/10 dark:text-gray-200 dark:ring-white/15">{activity}</span>
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
                <h3 className="text-lg font-semibold text-[var(--text-strong)]">{type.name}</h3>
                {type.configured ? (
                  <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs text-blue-700 ring-1 ring-blue-400/35 dark:text-blue-200">{t('common.configured')}</span>
                ) : null}
              </div>
              <div className="panel-body grid grid-cols-1 gap-4 text-sm text-[var(--text-strong)]">
                <p className="text-[var(--text-muted)]">{type.description}</p>

                <div>
                  <div className="metric-label mb-2">{t('sources.authMethods')}</div>
                  <div className="flex flex-wrap gap-2">
                    {type.authMethods.map((method) => (
                      <span key={method} className="rounded-full bg-slate-200/70 px-2 py-0.5 text-xs text-slate-700 ring-1 ring-slate-300 dark:bg-white/10 dark:text-gray-200 dark:ring-white/15">{method}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="metric-label mb-2">{t('sources.supportedActivities')}</div>
                  <div className="flex flex-wrap gap-2">
                    {type.supportedActivities.map((activity) => (
                      <span key={activity} className="rounded-full bg-slate-200/70 px-2 py-0.5 text-xs text-slate-700 ring-1 ring-slate-300 dark:bg-white/10 dark:text-gray-200 dark:ring-white/15">{activity}</span>
                    ))}
                  </div>
                </div>

                <details className="rounded-lg border border-slate-300/70 bg-white px-3 py-2 dark:border-white/15 dark:bg-white/5">
                  <summary className="cursor-pointer text-sm font-medium text-[var(--text-strong)]">{t('sources.setupInstructions')}</summary>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--text-muted)]">
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
      <div className="mt-2 text-xl font-semibold text-[var(--text-strong)]">{value}</div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="metric-label">{label}</div>
      <div className="mt-1 text-sm text-[var(--text-strong)]">{value}</div>
    </div>
  )
}
