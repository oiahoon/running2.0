import { NextRequest, NextResponse } from 'next/server'
import { DataSourceRegistry } from '@/lib/integrations/base'

// Global registry instance (in production, this would be properly managed)
const registry = new DataSourceRegistry()

/**
 * GET /api/sync
 * Get sync status for all data sources
 */
export async function GET() {
  try {
    const syncStatus = await registry.getAllSyncStatus()
    const sources = registry.getAllSources()

    const status = sources.map(({ config, source }) => ({
      id: config.id,
      name: config.name,
      type: config.type,
      enabled: config.enabled,
      status: config.status,
      lastSync: config.lastSync,
      syncStatus: syncStatus[config.id],
      supportedActivities: source.supportedActivityTypes
    }))

    return NextResponse.json({
      sources: status,
      summary: {
        totalSources: sources.length,
        enabledSources: sources.filter(({ config }) => config.enabled).length,
        activeSources: sources.filter(({ config }) => config.status === 'active').length
      }
    })
  } catch (error) {
    console.error('Failed to get sync status:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sync
 * Trigger sync for all enabled data sources
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { since, sources: requestedSources } = body

    let sinceDate: Date | undefined
    if (since) {
      sinceDate = new Date(since)
      if (isNaN(sinceDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid since date format' },
          { status: 400 }
        )
      }
    }

    let results
    if (requestedSources && Array.isArray(requestedSources)) {
      // Sync specific sources
      results = []
      for (const sourceId of requestedSources) {
        const source = registry.getSource(sourceId)
        if (source) {
          try {
            const result = await source.syncActivities(sinceDate)
            results.push(result)
          } catch (error) {
            results.push({
              source: sourceId,
              success: false,
              activitiesProcessed: 0,
              activitiesAdded: 0,
              activitiesUpdated: 0,
              errors: [`Sync failed: ${error.message}`],
              startTime: new Date(),
              endTime: new Date()
            })
          }
        } else {
          results.push({
            source: sourceId,
            success: false,
            activitiesProcessed: 0,
            activitiesAdded: 0,
            activitiesUpdated: 0,
            errors: [`Data source not found: ${sourceId}`],
            startTime: new Date(),
            endTime: new Date()
          })
        }
      }
    } else {
      // Sync all enabled sources
      results = await registry.syncAll(sinceDate)
    }

    const summary = {
      totalSources: results.length,
      successfulSources: results.filter(r => r.success).length,
      failedSources: results.filter(r => !r.success).length,
      totalActivitiesProcessed: results.reduce((sum, r) => sum + r.activitiesProcessed, 0),
      totalActivitiesAdded: results.reduce((sum, r) => sum + r.activitiesAdded, 0),
      totalActivitiesUpdated: results.reduce((sum, r) => sum + r.activitiesUpdated, 0),
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0)
    }

    return NextResponse.json({
      message: 'Sync completed',
      results,
      summary
    })
  } catch (error) {
    console.error('Failed to sync data sources:', error)
    return NextResponse.json(
      { error: 'Failed to sync data sources' },
      { status: 500 }
    )
  }
}
