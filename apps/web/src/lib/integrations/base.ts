/**
 * Base Data Source Architecture
 * Unified interface for all data source integrations
 */

export interface Activity {
  id: string
  externalId: string
  name: string
  type: string
  sportType: string
  startDate: string
  startDateLocal: string
  timezone?: string
  distance: number
  movingTime: number
  elapsedTime: number
  totalElevationGain: number
  averageSpeed: number
  maxSpeed: number
  averageHeartrate?: number
  maxHeartrate?: number
  startLatitude?: number
  startLongitude?: number
  endLatitude?: number
  endLongitude?: number
  summaryPolyline?: string
  calories?: number
  averageCadence?: number
  averagePower?: number
  source: string
  sourceActivityId: string
  createdAt: string
  updatedAt: string
}

export interface AuthToken {
  accessToken: string
  refreshToken?: string
  expiresAt: Date
  tokenType: string
  scope?: string[]
}

export interface SyncResult {
  source: string
  success: boolean
  activitiesProcessed: number
  activitiesAdded: number
  activitiesUpdated: number
  errors: string[]
  startTime: Date
  endTime: Date
}

export interface DataSourceConfig {
  id: string
  name: string
  type: string
  enabled: boolean
  config: Record<string, any>
  lastSync?: Date
  status: 'active' | 'inactive' | 'error'
  errorMessage?: string
}

/**
 * Base interface for all data sources
 */
export interface DataSource {
  readonly name: string
  readonly type: 'api' | 'file' | 'webhook'
  readonly supportedActivityTypes: string[]
  
  /**
   * Authenticate with the data source
   */
  authenticate(): Promise<AuthToken>
  
  /**
   * Test connection to the data source
   */
  testConnection(): Promise<boolean>
  
  /**
   * Fetch activities from the data source
   */
  fetchActivities(options?: {
    since?: Date
    limit?: number
    offset?: number
    activityTypes?: string[]
  }): Promise<Activity[]>
  
  /**
   * Fetch detailed activity data
   */
  getActivityDetail?(activityId: string): Promise<Activity | null>
  
  /**
   * Sync activities to local database
   */
  syncActivities(since?: Date): Promise<SyncResult>
  
  /**
   * Get sync status
   */
  getSyncStatus(): Promise<{
    lastSync?: Date
    isRunning: boolean
    nextSync?: Date
  }>
}

/**
 * Abstract base class for data sources
 */
export abstract class BaseDataSource implements DataSource {
  abstract readonly name: string
  abstract readonly type: 'api' | 'file' | 'webhook'
  abstract readonly supportedActivityTypes: string[]
  
  protected config: DataSourceConfig
  protected authToken?: AuthToken

  constructor(config: DataSourceConfig) {
    this.config = config
  }

  abstract authenticate(): Promise<AuthToken>
  abstract testConnection(): Promise<boolean>
  abstract fetchActivities(options?: {
    since?: Date
    limit?: number
    offset?: number
    activityTypes?: string[]
  }): Promise<Activity[]>

  async syncActivities(since?: Date): Promise<SyncResult> {
    const startTime = new Date()
    const result: SyncResult = {
      source: this.name,
      success: false,
      activitiesProcessed: 0,
      activitiesAdded: 0,
      activitiesUpdated: 0,
      errors: [],
      startTime,
      endTime: new Date()
    }

    try {
      // Authenticate if needed
      if (!this.authToken || this.isTokenExpired()) {
        this.authToken = await this.authenticate()
      }

      // Fetch activities
      const activities = await this.fetchActivities({ since })
      result.activitiesProcessed = activities.length

      // Process each activity
      for (const activity of activities) {
        try {
          const existing = await this.findExistingActivity(activity.externalId, this.name)
          
          if (existing) {
            await this.updateActivity(existing.id, activity)
            result.activitiesUpdated++
          } else {
            await this.createActivity(activity)
            result.activitiesAdded++
          }
        } catch (error) {
          result.errors.push(`Failed to process activity ${activity.externalId}: ${error.message}`)
        }
      }

      result.success = result.errors.length === 0
      result.endTime = new Date()

      // Update sync status
      await this.updateSyncStatus(result)

      return result
    } catch (error) {
      result.errors.push(`Sync failed: ${error.message}`)
      result.endTime = new Date()
      return result
    }
  }

  async getSyncStatus(): Promise<{
    lastSync?: Date
    isRunning: boolean
    nextSync?: Date
  }> {
    // Implementation would query database for sync status
    return {
      lastSync: this.config.lastSync,
      isRunning: false, // Would check actual sync status
      nextSync: undefined // Would calculate based on sync schedule
    }
  }

  protected isTokenExpired(): boolean {
    if (!this.authToken) return true
    return new Date() >= this.authToken.expiresAt
  }

  protected async findExistingActivity(externalId: string, source: string): Promise<{ id: number } | null> {
    // Implementation would query database
    // This is a placeholder - actual implementation would use your database layer
    return null
  }

  protected async createActivity(activity: Activity): Promise<void> {
    // Implementation would insert into database
    // This is a placeholder - actual implementation would use your database layer
  }

  protected async updateActivity(id: number, activity: Activity): Promise<void> {
    // Implementation would update database record
    // This is a placeholder - actual implementation would use your database layer
  }

  protected async updateSyncStatus(result: SyncResult): Promise<void> {
    // Implementation would update sync status in database
    // This is a placeholder - actual implementation would use your database layer
  }
}

/**
 * Data Source Registry
 * Manages all registered data sources
 */
export class DataSourceRegistry {
  private sources: Map<string, DataSource> = new Map()
  private configs: Map<string, DataSourceConfig> = new Map()

  /**
   * Register a data source
   */
  register(source: DataSource, config: DataSourceConfig): void {
    this.sources.set(config.id, source)
    this.configs.set(config.id, config)
  }

  /**
   * Get a data source by ID
   */
  getSource(id: string): DataSource | undefined {
    return this.sources.get(id)
  }

  /**
   * Get all registered data sources
   */
  getAllSources(): Array<{ source: DataSource; config: DataSourceConfig }> {
    return Array.from(this.sources.entries()).map(([id, source]) => ({
      source,
      config: this.configs.get(id)!
    }))
  }

  /**
   * Get enabled data sources only
   */
  getEnabledSources(): Array<{ source: DataSource; config: DataSourceConfig }> {
    return this.getAllSources().filter(({ config }) => config.enabled)
  }

  /**
   * Sync all enabled data sources
   */
  async syncAll(since?: Date): Promise<SyncResult[]> {
    const enabledSources = this.getEnabledSources()
    const results: SyncResult[] = []

    for (const { source } of enabledSources) {
      try {
        const result = await source.syncActivities(since)
        results.push(result)
      } catch (error) {
        results.push({
          source: source.name,
          success: false,
          activitiesProcessed: 0,
          activitiesAdded: 0,
          activitiesUpdated: 0,
          errors: [`Sync failed: ${error.message}`],
          startTime: new Date(),
          endTime: new Date()
        })
      }
    }

    return results
  }

  /**
   * Test connection for all sources
   */
  async testAllConnections(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}
    
    for (const [id, source] of this.sources) {
      try {
        results[id] = await source.testConnection()
      } catch (error) {
        results[id] = false
      }
    }

    return results
  }

  /**
   * Get sync status for all sources
   */
  async getAllSyncStatus(): Promise<Record<string, any>> {
    const results: Record<string, any> = {}
    
    for (const [id, source] of this.sources) {
      try {
        results[id] = await source.getSyncStatus()
      } catch (error) {
        results[id] = { error: error.message }
      }
    }

    return results
  }
}

/**
 * Activity type mappings
 */
export const ACTIVITY_TYPE_MAPPINGS: Record<string, string> = {
  // Running
  'run': 'Run',
  'running': 'Run',
  'jog': 'Run',
  'trail_run': 'Run',
  'treadmill_run': 'Run',
  
  // Walking
  'walk': 'Walk',
  'walking': 'Walk',
  'hike': 'Hike',
  'hiking': 'Hike',
  
  // Cycling
  'ride': 'Ride',
  'cycling': 'Ride',
  'bike': 'Ride',
  'mountain_bike': 'Ride',
  'road_bike': 'Ride',
  
  // Swimming
  'swim': 'Swim',
  'swimming': 'Swim',
  'pool_swim': 'Swim',
  'open_water_swim': 'Swim',
  
  // Other
  'workout': 'Workout',
  'strength_training': 'WeightTraining',
  'yoga': 'Yoga',
  'elliptical': 'Elliptical',
  'rowing': 'Rowing',
}

/**
 * Normalize activity type
 */
export function normalizeActivityType(type: string): string {
  const normalized = type.toLowerCase().replace(/[^a-z]/g, '_')
  return ACTIVITY_TYPE_MAPPINGS[normalized] || 'Workout'
}

/**
 * Convert activity data to standard format
 */
export function normalizeActivity(
  sourceActivity: any,
  source: string,
  mapper: (activity: any) => Partial<Activity>
): Activity {
  const mapped = mapper(sourceActivity)
  
  return {
    id: '', // Will be set by database
    externalId: mapped.externalId || sourceActivity.id?.toString() || '',
    name: mapped.name || 'Untitled Activity',
    type: normalizeActivityType(mapped.type || 'workout'),
    sportType: normalizeActivityType(mapped.sportType || mapped.type || 'workout'),
    startDate: mapped.startDate || new Date().toISOString(),
    startDateLocal: mapped.startDateLocal || mapped.startDate || new Date().toISOString(),
    timezone: mapped.timezone,
    distance: mapped.distance || 0,
    movingTime: mapped.movingTime || 0,
    elapsedTime: mapped.elapsedTime || mapped.movingTime || 0,
    totalElevationGain: mapped.totalElevationGain || 0,
    averageSpeed: mapped.averageSpeed || 0,
    maxSpeed: mapped.maxSpeed || 0,
    averageHeartrate: mapped.averageHeartrate,
    maxHeartrate: mapped.maxHeartrate,
    startLatitude: mapped.startLatitude,
    startLongitude: mapped.startLongitude,
    endLatitude: mapped.endLatitude,
    endLongitude: mapped.endLongitude,
    summaryPolyline: mapped.summaryPolyline,
    calories: mapped.calories,
    averageCadence: mapped.averageCadence,
    averagePower: mapped.averagePower,
    source,
    sourceActivityId: mapped.externalId || sourceActivity.id?.toString() || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...mapped
  }
}

export default DataSourceRegistry
