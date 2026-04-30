'use client'

import type { ReactNode } from 'react'
import { useI18n } from '@/lib/i18n'

type SyncStatus = {
  totalActivities: number
  latestActivity?: { name: string; start_date: string; type: string } | null
  typeStats: { type: string; count: number }[]
  recentActivities: number
  error?: string
}

function Metric({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="panel">
      <div className="panel-body">
        <div className="metric-label">{label}</div>
        <div className="metric-value mt-2">{value}</div>
        {sub && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</div>}
      </div>
    </div>
  )
}

function Badge({ children, tone = 'zinc' }: { children: ReactNode; tone?: 'blue' | 'zinc' }) {
  const classes = tone === 'blue'
    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
    : 'bg-zinc-600/10 text-zinc-700 dark:bg-white/5 dark:text-zinc-300'

  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ${classes}`}>
      {children}
    </span>
  )
}

export function SyncStatusView({ status }: { status: SyncStatus }) {
  const { t, dateLocale } = useI18n()

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">{t('page.syncStatus.title')}</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {t('page.syncStatus.subtitle')}
        </p>
      </section>

      {status.error && (
        <section className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {status.error}
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label={t('sync.totalActivities')} value={status.totalActivities.toLocaleString()} />
        <Metric label={t('syncStatus.recentActivities')} value={status.recentActivities} sub={t('syncStatus.last7Days')} />
        <Metric
          label={t('syncStatus.latestActivityDate')}
          value={status.latestActivity ? new Date(status.latestActivity.start_date).toLocaleDateString(dateLocale) : t('common.none')}
        />
        <Metric label={t('common.source')} value="Strava" sub={t('syncStatus.scheduled')} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel">
          <div className="panel-header">
            <h2 className="text-base font-semibold">{t('syncStatus.latestActivity')}</h2>
          </div>
          <div className="panel-body">
            {status.latestActivity ? (
              <div className="space-y-2">
                <div className="font-medium">{status.latestActivity.name}</div>
                <div className="flex items-center gap-2">
                  <Badge tone="blue">{status.latestActivity.type}</Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(status.latestActivity.start_date).toLocaleDateString(dateLocale)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('syncStatus.noActivities')}</p>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="text-base font-semibold">{t('syncStatus.topTypes')}</h2>
          </div>
          <div className="panel-body space-y-2">
            {status.typeStats.slice(0, 5).map((stat) => (
              <div key={stat.type} className="flex items-center justify-between text-sm">
                <span>{stat.type}</span>
                <Badge tone="zinc">{stat.count}</Badge>
              </div>
            ))}
            {status.typeStats.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('syncStatus.noTypeStats')}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
