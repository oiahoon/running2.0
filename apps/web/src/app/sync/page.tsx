'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useI18n } from '@/lib/i18n'

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
  if (status === 'success') return 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-400/35 dark:text-emerald-300'
  if (status === 'failed' || status === 'error') return 'bg-red-500/15 text-red-700 ring-1 ring-red-400/35 dark:text-red-300'
  return 'bg-gray-500/15 text-gray-700 ring-1 ring-gray-400/35 dark:text-gray-300'
}

export default function SyncPage() {
  const { t, dateLocale } = useI18n()
  const [syncRecords, setSyncRecords] = useState<SyncRecord[]>([])
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const fetchSyncData = useCallback(async () => {
    setError(null)
    try {
      const response = await fetch('/api/sync/history', { cache: 'no-store' })
      if (!response.ok) throw new Error(t('sync.fetchFailed'))

      const data: SyncHistoryResponse = await response.json()
      setSyncRecords(data.logs || [])

      const stravaSource = (data.sources || []).find((s) => s.source === 'strava')
      setDataSources([
        {
          name: 'Strava',
          status: stravaSource?.isActive ? 'connected' : 'disconnected',
          lastSync: stravaSource?.lastSync || undefined,
          totalActivities: data.totalActivities || 0,
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.unknown'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchSyncData()
  }, [fetchSyncData])

  const latestSync = useMemo(() => syncRecords[0], [syncRecords])

  const handleSyncNow = async () => {
    setIsSyncing(true)
    setError(null)
    setNotice(null)
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
      setNotice(data?.message ? t('sync.refreshAfterDeploy', { message: data.message }) : t('sync.queued'))
      await fetchSyncData()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('sync.manualFailed'))
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="panel-body py-6 sm:py-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="section-title">{t('sync.console')}</h2>
              <p className="section-subtitle">{t('sync.copy')}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchSyncData} className="action-secondary">{t('sync.refresh')}</button>
              <button onClick={handleSyncNow} disabled={isSyncing} className="action-primary disabled:opacity-60">
                <ArrowPathIcon className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? t('sync.queueing') : t('sync.now')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
          {error}
        </section>
      ) : null}

      {notice ? (
        <section className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
          {notice}
        </section>
      ) : null}

      {isLoading ? (
        <section className="panel">
          <div className="panel-body text-sm text-[var(--text-muted)]">{t('sync.loading')}</div>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {dataSources.map((source) => (
              <div key={source.name} className="panel lg:col-span-2">
                <div className="panel-header flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--text-strong)]">{t('sync.sourceHealth', { source: source.name })}</h3>
                  <span className={source.status === 'connected' ? 'rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-400/30 dark:text-emerald-300' : 'rounded-full bg-gray-500/15 px-2 py-0.5 text-xs text-gray-700 ring-1 ring-gray-400/30 dark:text-gray-300'}>
                    {source.status}
                  </span>
                </div>
                <div className="panel-body grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <MetricItem label={t('sync.totalActivities')} value={source.totalActivities.toLocaleString()} />
                  <MetricItem label={t('sync.lastSync')} value={source.lastSync ? new Date(source.lastSync).toLocaleString(dateLocale) : t('common.never')} />
                  <MetricItem label={t('sync.latestStatus')} value={latestSync ? latestSync.status : t('sync.noRecords')} />
                </div>
              </div>
            ))}

            <div className="panel">
              <div className="panel-header">
                <h3 className="text-lg font-semibold text-[var(--text-strong)]">{t('sync.workflow')}</h3>
              </div>
              <div className="panel-body space-y-2 text-sm text-[var(--text-muted)]">
                <div>{t('sync.workflow1')}</div>
                <div>{t('sync.workflow2')}</div>
                <div>{t('sync.workflow3')}</div>
                <div>{t('sync.workflow4')}</div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-strong)]">{t('sync.history')}</h3>
              {latestSync ? <span className="text-xs text-[var(--text-muted)]">{t('sync.latestAt', { time: new Date(latestSync.timestamp).toLocaleString(dateLocale) })}</span> : null}
            </div>
            <div className="panel-body p-0">
              {syncRecords.length === 0 ? (
                <p className="px-5 py-4 text-sm text-[var(--text-muted)]">{t('sync.noHistory')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-[var(--text-muted)] dark:border-white/10">
                        <th className="px-5 py-2 font-medium">{t('common.time')}</th>
                        <th className="px-5 py-2 font-medium">{t('common.source')}</th>
                        <th className="px-5 py-2 font-medium">{t('common.status')}</th>
                        <th className="px-5 py-2 font-medium">{t('sync.processed')}</th>
                        <th className="px-5 py-2 font-medium">{t('sync.created')}</th>
                        <th className="px-5 py-2 font-medium">{t('sync.updated')}</th>
                        <th className="px-5 py-2 font-medium">{t('common.message')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syncRecords.map((record) => (
                        <tr key={record.id} className="border-b border-slate-200 text-[var(--text-strong)] dark:border-white/5 dark:text-gray-200">
                          <td className="px-5 py-2 text-[var(--text-muted)]">{new Date(record.timestamp).toLocaleString(dateLocale)}</td>
                          <td className="px-5 py-2">{record.source}</td>
                          <td className="px-5 py-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(record.status)}`}>{record.status}</span>
                          </td>
                          <td className="px-5 py-2">{record.activitiesProcessed}</td>
                          <td className="px-5 py-2">{record.activitiesCreated}</td>
                          <td className="px-5 py-2">{record.activitiesUpdated}</td>
                          <td className="px-5 py-2 text-[var(--text-muted)]">{record.errorMessage || '-'}</td>
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

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="metric-label">{label}</div>
      <div className="mt-2 text-base font-semibold text-[var(--text-strong)]">{value}</div>
    </div>
  )
}
