import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database/connection'
import { runStravaSync } from '@/app/api/sync/strava/route'

type SourceSetting = {
  source: string
  is_active: number
  connection_status: string | null
  last_sync_at: string | null
}

type SourceLog = {
  source: string
  status: string
  started_at: string
  completed_at: string | null
}

function normalizeSourceId(sourceId: string): string {
  if (sourceId === 'strava') return sourceId
  const prefix = sourceId.split('_')[0]
  return prefix || sourceId
}

/**
 * GET /api/sync
 * Read sync status from persisted source settings + latest logs
 */
export async function GET() {
  try {
    const db = getDatabase()

    const settings = db.prepare(`
      SELECT source, is_active, connection_status, last_sync_at
      FROM data_source_settings
      WHERE user_id = 1
      ORDER BY source ASC
    `).all() as SourceSetting[]

    const latestLogs = db.prepare(`
      SELECT s.source, s.status, s.started_at, s.completed_at
      FROM sync_logs s
      INNER JOIN (
        SELECT source, MAX(id) AS max_id
        FROM sync_logs
        GROUP BY source
      ) latest ON latest.max_id = s.id
    `).all() as SourceLog[]

    const latestLogMap = new Map(latestLogs.map((row) => [row.source, row]))

    const sources = settings.map((setting) => {
      const latest = latestLogMap.get(setting.source)
      return {
        id: setting.source,
        name: setting.source.charAt(0).toUpperCase() + setting.source.slice(1),
        type: setting.source,
        enabled: Boolean(setting.is_active),
        status: setting.connection_status === 'error' ? 'error' : setting.is_active ? 'active' : 'inactive',
        lastSync: setting.last_sync_at,
        syncStatus: {
          lastRunStatus: latest?.status || null,
          startedAt: latest?.started_at || null,
          completedAt: latest?.completed_at || null,
          isRunning: false,
        },
      }
    })

    return NextResponse.json({
      sources,
      summary: {
        totalSources: sources.length,
        enabledSources: sources.filter((s) => s.enabled).length,
        activeSources: sources.filter((s) => s.status === 'active').length,
      },
    })
  } catch (error) {
    console.error('Failed to get sync status:', error)
    return NextResponse.json({ error: 'Failed to get sync status' }, { status: 500 })
  }
}

/**
 * POST /api/sync
 * Trigger sync for requested sources or all enabled sources
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const requestedSources = Array.isArray(body?.sources)
      ? (body.sources as unknown[])
          .filter((item): item is string => typeof item === 'string' && item.length > 0)
          .map(normalizeSourceId)
      : null

    const db = getDatabase()
    const settings = db.prepare(`
      SELECT source, is_active, connection_status, last_sync_at
      FROM data_source_settings
      WHERE user_id = 1
    `).all() as SourceSetting[]

    const settingMap = new Map(settings.map((item) => [item.source, item]))

    const targetSources = requestedSources && requestedSources.length > 0
      ? [...new Set(requestedSources)]
      : settings.filter((item) => Boolean(item.is_active)).map((item) => item.source)

    const results: Array<{
      source: string
      success: boolean
      activitiesProcessed: number
      activitiesAdded: number
      activitiesUpdated: number
      errors: string[]
      startTime: Date
      endTime: Date
    }> = []

    for (const sourceId of targetSources) {
      const startTime = new Date()

      if (!settingMap.has(sourceId)) {
        results.push({
          source: sourceId,
          success: false,
          activitiesProcessed: 0,
          activitiesAdded: 0,
          activitiesUpdated: 0,
          errors: [`Data source not configured: ${sourceId}`],
          startTime,
          endTime: new Date(),
        })
        continue
      }

      const sourceSetting = settingMap.get(sourceId)
      if (!sourceSetting?.is_active) {
        results.push({
          source: sourceId,
          success: false,
          activitiesProcessed: 0,
          activitiesAdded: 0,
          activitiesUpdated: 0,
          errors: [`Data source is disabled: ${sourceId}`],
          startTime,
          endTime: new Date(),
        })
        continue
      }

      if (sourceId === 'strava') {
        try {
          const syncResult = await runStravaSync()
          results.push({
            source: 'strava',
            success: true,
            activitiesProcessed: syncResult.activitiesProcessed,
            activitiesAdded: syncResult.activitiesSaved,
            activitiesUpdated: 0,
            errors: [],
            startTime,
            endTime: new Date(),
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          results.push({
            source: 'strava',
            success: false,
            activitiesProcessed: 0,
            activitiesAdded: 0,
            activitiesUpdated: 0,
            errors: [message],
            startTime,
            endTime: new Date(),
          })
        }
        continue
      }

      results.push({
        source: sourceId,
        success: false,
        activitiesProcessed: 0,
        activitiesAdded: 0,
        activitiesUpdated: 0,
        errors: [`Source sync executor not implemented: ${sourceId}`],
        startTime,
        endTime: new Date(),
      })
    }

    const summary = {
      totalSources: results.length,
      successfulSources: results.filter((r) => r.success).length,
      failedSources: results.filter((r) => !r.success).length,
      totalActivitiesProcessed: results.reduce((sum, r) => sum + r.activitiesProcessed, 0),
      totalActivitiesAdded: results.reduce((sum, r) => sum + r.activitiesAdded, 0),
      totalActivitiesUpdated: results.reduce((sum, r) => sum + r.activitiesUpdated, 0),
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
    }

    return NextResponse.json({
      message: 'Sync completed',
      results,
      summary,
    })
  } catch (error) {
    console.error('Failed to sync data sources:', error)
    return NextResponse.json({ error: 'Failed to sync data sources' }, { status: 500 })
  }
}
