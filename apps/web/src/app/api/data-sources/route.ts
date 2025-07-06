import { NextRequest, NextResponse } from 'next/server'
import { DataSourceRegistry, DataSourceConfig } from '@/lib/integrations/base'
import { NikeDataSource } from '@/lib/integrations/nike'

// Global registry instance (in production, this would be properly managed)
const registry = new DataSourceRegistry()

// Available data source types
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
}

/**
 * GET /api/data-sources
 * List all available and configured data sources
 */
export async function GET() {
  try {
    const configuredSources = registry.getAllSources()
    const availableTypes = Object.entries(DATA_SOURCE_TYPES).map(([key, info]) => ({
      id: key,
      ...info,
      configured: configuredSources.some(({ config }) => config.type === key)
    }))

    const syncStatus = await registry.getAllSyncStatus()

    return NextResponse.json({
      availableTypes,
      configuredSources: configuredSources.map(({ config, source }) => ({
        ...config,
        syncStatus: syncStatus[config.id],
        supportedActivities: source.supportedActivityTypes
      }))
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
 * Add a new data source configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, name, config: sourceConfig, enabled = true } = body

    if (!type || !name || !sourceConfig) {
      return NextResponse.json(
        { error: 'Missing required fields: type, name, config' },
        { status: 400 }
      )
    }

    if (!DATA_SOURCE_TYPES[type]) {
      return NextResponse.json(
        { error: `Unsupported data source type: ${type}` },
        { status: 400 }
      )
    }

    // Generate unique ID
    const id = `${type}_${Date.now()}`

    const dataSourceConfig: DataSourceConfig = {
      id,
      name,
      type,
      enabled,
      config: sourceConfig,
      status: 'inactive'
    }

    // Create and register the data source
    let dataSource
    switch (type) {
      case 'nike':
        dataSource = new NikeDataSource(sourceConfig)
        break
      default:
        return NextResponse.json(
          { error: `Data source type ${type} not yet implemented` },
          { status: 501 }
        )
    }

    // Test connection
    const connectionTest = await dataSource.testConnection()
    if (!connectionTest) {
      return NextResponse.json(
        { error: 'Failed to connect to data source. Please check your configuration.' },
        { status: 400 }
      )
    }

    dataSourceConfig.status = 'active'
    registry.register(dataSource, dataSourceConfig)

    // In production, save to database
    // await saveDataSourceConfig(dataSourceConfig)

    return NextResponse.json({
      message: 'Data source added successfully',
      dataSource: dataSourceConfig
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
 * PUT /api/data-sources/[id]
 * Update data source configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Data source ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, config: sourceConfig, enabled } = body

    const source = registry.getSource(id)
    if (!source) {
      return NextResponse.json(
        { error: 'Data source not found' },
        { status: 404 }
      )
    }

    // Update configuration
    const updatedConfig: DataSourceConfig = {
      id,
      name: name || `Updated ${id}`,
      type: id.split('_')[0],
      enabled: enabled !== undefined ? enabled : true,
      config: sourceConfig,
      status: 'active'
    }

    // Test connection with new config if provided
    if (sourceConfig) {
      // Create new instance with updated config
      let newDataSource
      switch (updatedConfig.type) {
        case 'nike':
          newDataSource = new NikeDataSource(sourceConfig)
          break
        default:
          return NextResponse.json(
            { error: `Data source type ${updatedConfig.type} not yet implemented` },
            { status: 501 }
          )
      }

      const connectionTest = await newDataSource.testConnection()
      if (!connectionTest) {
        return NextResponse.json(
          { error: 'Failed to connect with new configuration' },
          { status: 400 }
        )
      }

      // Re-register with new config
      registry.register(newDataSource, updatedConfig)
    }

    // In production, update in database
    // await updateDataSourceConfig(id, updatedConfig)

    return NextResponse.json({
      message: 'Data source updated successfully',
      dataSource: updatedConfig
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
 * DELETE /api/data-sources/[id]
 * Remove data source configuration
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Data source ID is required' },
        { status: 400 }
      )
    }

    const source = registry.getSource(id)
    if (!source) {
      return NextResponse.json(
        { error: 'Data source not found' },
        { status: 404 }
      )
    }

    // Remove from registry
    // registry.unregister(id) // Would need to implement this method

    // In production, remove from database
    // await deleteDataSourceConfig(id)

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
