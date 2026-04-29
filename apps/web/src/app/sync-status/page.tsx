import { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getDatabase } from '@/lib/database/connection'

export const metadata: Metadata = {
  title: 'Sync Status - Running Page 2.0',
  description: 'Data synchronization status and statistics',
}

async function getSyncStatus() {
  try {
    const db = await getDatabase()

    const totalResult = db.prepare('SELECT COUNT(*) as count FROM activities').get() as { count: number }

    const latestResult = db.prepare(`
      SELECT name, start_date, type
      FROM activities
      ORDER BY start_date DESC
      LIMIT 1
    `).get() as { name: string; start_date: string; type: string } | undefined

    const typeStats = db.prepare(`
      SELECT type, COUNT(*) as count
      FROM activities
      GROUP BY type
      ORDER BY count DESC
    `).all() as { type: string; count: number }[]

    const recentResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM activities
      WHERE start_date >= datetime('now', '-7 days')
    `).get() as { count: number }

    return {
      totalActivities: totalResult.count,
      latestActivity: latestResult,
      typeStats,
      recentActivities: recentResult.count,
    }
  } catch (error) {
    console.error('Error getting sync status:', error)
    return {
      totalActivities: 0,
      latestActivity: null,
      typeStats: [],
      recentActivities: 0,
      error: 'Failed to load sync status',
    }
  }
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

export default async function SyncStatusPage() {
  const status = await getSyncStatus()

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Sync Status</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Current synchronization health and recent data summary.
        </p>
      </section>

      {status.error && (
        <section className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {status.error}
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total Activities" value={status.totalActivities.toLocaleString()} />
        <Metric label="Recent Activities" value={status.recentActivities} sub="Last 7 days" />
        <Metric
          label="Latest Activity Date"
          value={status.latestActivity ? new Date(status.latestActivity.start_date).toLocaleDateString() : 'N/A'}
        />
        <Metric label="Source" value="Strava" sub="Scheduled every 6 hours" />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel">
          <div className="panel-header">
            <h2 className="text-base font-semibold">Latest Activity</h2>
          </div>
          <div className="panel-body">
            {status.latestActivity ? (
              <div className="space-y-2">
                <div className="font-medium">{status.latestActivity.name}</div>
                <div className="flex items-center gap-2">
                  <Badge tone="blue">{status.latestActivity.type}</Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(status.latestActivity.start_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No activities found.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="text-base font-semibold">Top Activity Types</h2>
          </div>
          <div className="panel-body space-y-2">
            {status.typeStats.slice(0, 5).map((stat) => (
              <div key={stat.type} className="flex items-center justify-between text-sm">
                <span>{stat.type}</span>
                <Badge tone="zinc">{stat.count}</Badge>
              </div>
            ))}
            {status.typeStats.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No type statistics available.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
