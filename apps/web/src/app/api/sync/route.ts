import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database/connection'

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

function getGitHubRepo() {
  return process.env.GITHUB_SYNC_REPOSITORY || process.env.GITHUB_REPOSITORY || 'oiahoon/running2.0'
}

function toWorkflowBoolean(value: unknown) {
  return value === true || value === 'true' ? 'true' : 'false'
}

async function triggerSyncWorkflow(body: Record<string, unknown>) {
  const token = process.env.GITHUB_ACTIONS_TRIGGER_TOKEN
  if (!token) {
    throw new Error('Manual sync trigger is not configured. Set GITHUB_ACTIONS_TRIGGER_TOKEN in Vercel.')
  }

  const repository = getGitHubRepo()
  const workflowId = process.env.GITHUB_SYNC_WORKFLOW_ID || 'sync-data.yml'
  const ref = process.env.GITHUB_SYNC_REF || 'master'
  const workflowUrl = `https://github.com/${repository}/actions/workflows/${workflowId}`

  const response = await fetch(`https://api.github.com/repos/${repository}/actions/workflows/${workflowId}/dispatches`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      ref,
      inputs: {
        force_full_sync: toWorkflowBoolean(body.forceFullSync ?? body.force_full_sync),
        regenerate_maps: toWorkflowBoolean(body.regenerateMaps ?? body.regenerate_maps),
      },
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`GitHub workflow dispatch failed (${response.status}): ${detail || response.statusText}`)
  }

  return {
    repository,
    workflowId,
    ref,
    workflowUrl,
  }
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
 * Trigger repository-backed sync through GitHub Actions.
 *
 * The production data store is a committed SQLite file, so Vercel runtime sync
 * must not write to /tmp. Manual sync queues the same workflow as scheduled
 * sync; GitHub Actions writes the database file, commits it, and Vercel redeploys.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const requestedSources = Array.isArray(body?.sources)
      ? (body.sources as unknown[])
          .filter((item): item is string => typeof item === 'string' && item.length > 0)
          .map(normalizeSourceId)
      : null

    const targetSources = requestedSources && requestedSources.length > 0 ? [...new Set(requestedSources)] : ['strava']
    const unsupportedSource = targetSources.find((source) => source !== 'strava')
    if (unsupportedSource) {
      return NextResponse.json(
        { error: `Manual workflow sync is only configured for Strava. Unsupported source: ${unsupportedSource}` },
        { status: 400 }
      )
    }

    const workflow = await triggerSyncWorkflow(body)

    return NextResponse.json(
      {
        message: 'Sync workflow queued',
        source: 'strava',
        status: 'queued',
        workflow,
      },
      { status: 202 }
    )
  } catch (error) {
    console.error('Failed to sync data sources:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync data sources' },
      { status: 500 }
    )
  }
}
