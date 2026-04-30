import { Metadata } from 'next'
import { getDatabase } from '@/lib/database/connection'
import { SyncStatusView } from './SyncStatusView'

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

export default async function SyncStatusPage() {
  const status = await getSyncStatus()

  return <SyncStatusView status={status} />
}
