import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database/connection'
import { NikeDataSource } from '@/lib/integrations/nike'

const DATA_SOURCE_TYPES = {
  nike: {
    name: 'Nike Run Club',
    type: 'api',
    description: 'Sync activities from Nike Run Club',
    authMethods: ['access_token', 'refresh_token'],
    supportedActivities: ['Run', 'Walk'],
    setupInstructions: [
      'Sign in to Nike.com',
      'Open browser developer tools (F12)',
      'Go to Application > Local Storage > https://www.nike.com',
      'Copy the "access_token" value',
      'Paste it in the configuration below'
    ]
  },
  strava: {
    name: 'Strava',
    type: 'api',
    description: 'Sync activities from Strava (already configured)',
    authMethods: ['oauth2'],
    supportedActivities: ['Run', 'Walk', 'Ride', 'Swim', 'Hike'],
    setupInstructions: [
      'Already configured in your environment variables',
      'Activities sync automatically every 6 hours'
    ]
  },
  garmin: {
    name: 'Garmin Connect',
    type: 'api',
    description: 'Sync activities from Garmin Connect',
    authMethods: ['credentials', 'secret_string'],
    supportedActivities: ['Run', 'Walk', 'Ride', 'Swim', 'Hike', 'Strength'],
    setupInstructions: [
      'Run: python get_garmin_secret.py email password',
      'Copy the secret string',
      'Configure in GitHub Actions or environment'
    ]
  },
  gpx: {
    name: 'GPX Files',
    type: 'file',
    description: 'Import activities from GPX files',
    authMethods: ['none'],
    supportedActivities: ['All GPS activities'],
    setupInstructions: [
      'Upload GPX files using the file upload interface',
      'Files will be automatically processed and imported'
    ]
  }
} as const

type SourceKey = keyof typeof DATA_SOURCE_TYPES

type DataSourceRow = {
  id: number
  source: string
  is_active: number
  connection_status: string | null
  last_sync_at: string | null
  updated_at: string | null
  created_at: string | null
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  privacy_settings: string | null
}

function toConfiguredStatus(row: DataSourceRow): 'active' | 'inactive' | 'error' {
  if (!row.is_active) return 'inactive'
  if (row.connection_status === 'error') return 'error'
  return 'active'
}

function getSourceMeta(source: string) {
  return DATA_SOURCE_TYPES[source as SourceKey]
}

function extractSourceIdentifier(request: NextRequest, body?: unknown): string | null {
  const normalize = (value: string) => {
    if (DATA_SOURCE_TYPES[value as SourceKey]) return value
    const prefix = value.split('_')[0]
    return DATA_SOURCE_TYPES[prefix as SourceKey] ? prefix : value
  }

  const querySource = request.nextUrl.searchParams.get('source')
  if (querySource) return normalize(querySource)

  if (body && typeof body === 'object') {
    const payload = body as Record<string, unknown>
    if (typeof payload.source === 'string') return normalize(payload.source)
    if (typeof payload.type === 'string') return normalize(payload.type)
    if (typeof payload.id === 'string') return normalize(payload.id)
  }

  return null
}

/**
 * GET /api/data-sources
 * List all available and configured data sources
 */
export async function GET() {
  try {
    const db = getDatabase()
    const configuredRows = db.prepare(`
      SELECT
        id,
        source,
        is_active,
        connection_status,
        last_sync_at,
        updated_at,
        created_at,
        access_token,
        refresh_token,
        token_expires_at,
        privacy_settings
      FROM data_source_settings
      WHERE user_id = 1
      ORDER BY updated_at DESC, id DESC
    `).all() as DataSourceRow[]

    const configuredSourceSet = new Set(configuredRows.map(row => row.source))

    const availableTypes = Object.entries(DATA_SOURCE_TYPES).map(([key, info]) => ({
      id: key,
      ...info,
      configured: configuredSourceSet.has(key)
    }))

    const configuredSources = configuredRows.map((row) => {
      const meta = getSourceMeta(row.source)

      return {
        id: row.source,
        name: meta?.name || row.source,
        type: row.source,
        enabled: Boolean(row.is_active),
        status: toConfiguredStatus(row),
        lastSync: row.last_sync_at || undefined,
        errorMessage: row.connection_status === 'error' ? 'Connection error, please re-authenticate.' : undefined,
        supportedActivities: meta?.supportedActivities || [],
      }
    })

    return NextResponse.json({
      availableTypes,
      configuredSources,
    })
  } catch (error) {
    console.error('Failed to get data sources:', error)
    return NextResponse.json(
      { error: 'Failed to get data sources' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/data-sources
 * Add or upsert a data source configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, name, config: sourceConfig, enabled = true } = body

    if (!type || !sourceConfig) {
      return NextResponse.json(
        { error: 'Missing required fields: type, config' },
        { status: 400 }
      )
    }

    if (!DATA_SOURCE_TYPES[type as SourceKey]) {
      return NextResponse.json(
        { error: `Unsupported data source type: ${type}` },
        { status: 400 }
      )
    }

    if (type !== 'nike') {
      return NextResponse.json(
        { error: `Data source type ${type} does not support manual configuration in this endpoint` },
        { status: 400 }
      )
    }

    const dataSource = new NikeDataSource(sourceConfig)
    const connectionTest = await dataSource.testConnection()
    if (!connectionTest) {
      return NextResponse.json(
        { error: 'Failed to connect to data source. Please check your configuration.' },
        { status: 400 }
      )
    }

    const authToken = await dataSource.authenticate()

    const db = getDatabase()
    const now = new Date().toISOString()
    const expiresAt = authToken.expiresAt.toISOString()

    db.prepare(`
      INSERT INTO data_source_settings (
        user_id,
        source,
        access_token,
        refresh_token,
        token_expires_at,
        auto_sync,
        sync_frequency,
        last_sync_at,
        activity_types,
        privacy_settings,
        is_active,
        connection_status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, source) DO UPDATE SET
        access_token = excluded.access_token,
        refresh_token = excluded.refresh_token,
        token_expires_at = excluded.token_expires_at,
        is_active = excluded.is_active,
        connection_status = excluded.connection_status,
        privacy_settings = excluded.privacy_settings,
        updated_at = excluded.updated_at
    `).run(
      1,
      type,
      authToken.accessToken,
      authToken.refreshToken || null,
      expiresAt,
      1,
      'daily',
      null,
      JSON.stringify(DATA_SOURCE_TYPES[type as SourceKey].supportedActivities),
      JSON.stringify({
        displayName: name || DATA_SOURCE_TYPES[type as SourceKey].name,
        authMethod: sourceConfig.authMethod,
      }),
      enabled ? 1 : 0,
      'connected',
      now,
      now
    )

    return NextResponse.json({
      message: 'Data source added successfully',
      dataSource: {
        id: type,
        name: name || DATA_SOURCE_TYPES[type as SourceKey].name,
        type,
        enabled,
        status: 'active',
        lastSync: null,
      }
    })
  } catch (error) {
    console.error('Failed to add data source:', error)
    return NextResponse.json(
      { error: 'Failed to add data source' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/data-sources
 * Update data source enabled state or credentials
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const source = extractSourceIdentifier(request, body)

    if (!source) {
      return NextResponse.json(
        { error: 'Data source identifier is required (source/type/id)' },
        { status: 400 }
      )
    }

    const db = getDatabase()
    const existing = db.prepare(`
      SELECT source, is_active
      FROM data_source_settings
      WHERE user_id = 1 AND source = ?
      LIMIT 1
    `).get(source) as { source: string; is_active: number } | undefined

    if (!existing) {
      return NextResponse.json(
        { error: 'Data source not found' },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()
    const enabled = typeof (body as Record<string, unknown>).enabled === 'boolean'
      ? ((body as Record<string, unknown>).enabled as boolean)
      : Boolean(existing.is_active)

    const sourceConfig = (body as Record<string, unknown>).config

    if (source === 'nike' && sourceConfig && typeof sourceConfig === 'object') {
      const nikeDataSource = new NikeDataSource(sourceConfig as {
        accessToken?: string
        refreshToken?: string
        authMethod: 'access_token' | 'refresh_token'
      })

      const connectionTest = await nikeDataSource.testConnection()
      if (!connectionTest) {
        return NextResponse.json(
          { error: 'Failed to connect with new configuration' },
          { status: 400 }
        )
      }

      const token = await nikeDataSource.authenticate()

      db.prepare(`
        UPDATE data_source_settings
        SET
          access_token = ?,
          refresh_token = ?,
          token_expires_at = ?,
          is_active = ?,
          connection_status = 'connected',
          updated_at = ?
        WHERE user_id = 1 AND source = ?
      `).run(
        token.accessToken,
        token.refreshToken || null,
        token.expiresAt.toISOString(),
        enabled ? 1 : 0,
        now,
        source
      )
    } else {
      db.prepare(`
        UPDATE data_source_settings
        SET
          is_active = ?,
          updated_at = ?
        WHERE user_id = 1 AND source = ?
      `).run(enabled ? 1 : 0, now, source)
    }

    return NextResponse.json({
      message: 'Data source updated successfully',
      dataSource: {
        id: source,
        type: source,
        enabled,
      }
    })
  } catch (error) {
    console.error('Failed to update data source:', error)
    return NextResponse.json(
      { error: 'Failed to update data source' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/data-sources
 * Remove data source configuration
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const source = extractSourceIdentifier(request, body)

    if (!source) {
      return NextResponse.json(
        { error: 'Data source identifier is required (source/type/id)' },
        { status: 400 }
      )
    }

    const db = getDatabase()
    const result = db.prepare(`
      DELETE FROM data_source_settings
      WHERE user_id = 1 AND source = ?
    `).run(source)

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Data source not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Data source removed successfully'
    })
  } catch (error) {
    console.error('Failed to remove data source:', error)
    return NextResponse.json(
      { error: 'Failed to remove data source' },
      { status: 500 }
    )
  }
}
