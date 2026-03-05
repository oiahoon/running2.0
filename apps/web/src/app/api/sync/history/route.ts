import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database/connection'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = getDatabase()

    const logs = db.prepare(`
      SELECT
        id,
        source,
        status,
        started_at,
        completed_at,
        activities_processed,
        activities_created,
        activities_updated,
        error_message
      FROM sync_logs
      ORDER BY started_at DESC
      LIMIT 20
    `).all() as any[]

    const sources = db.prepare(`
      SELECT
        source,
        is_active,
        connection_status,
        last_sync_at,
        updated_at
      FROM data_source_settings
      ORDER BY updated_at DESC
    `).all() as any[]

    const totalResult = db.prepare('SELECT COUNT(*) as count FROM activities').get() as { count: number }

    return NextResponse.json({
      logs: logs.map(log => ({
        id: String(log.id),
        source: log.source,
        status: log.status,
        timestamp: log.started_at,
        completedAt: log.completed_at,
        activitiesProcessed: Number(log.activities_processed || 0),
        activitiesCreated: Number(log.activities_created || 0),
        activitiesUpdated: Number(log.activities_updated || 0),
        errorMessage: log.error_message || undefined,
      })),
      sources: sources.map(source => ({
        source: source.source,
        isActive: Boolean(source.is_active),
        status: source.connection_status || 'unknown',
        lastSync: source.last_sync_at || source.updated_at || null,
      })),
      totalActivities: totalResult.count,
    })
  } catch (error) {
    console.error('Failed to fetch sync history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync history' },
      { status: 500 }
    )
  }
}
