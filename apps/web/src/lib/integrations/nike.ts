/**
 * Nike Run Club Integration
 * Supports both new and legacy authentication methods
 */

export interface NikeActivity {
  id: string
  type: 'run' | 'walk'
  startTime: string
  endTime: string
  duration: number // seconds
  distance: number // meters
  pace?: number // seconds per km
  averagePace?: number
  calories?: number
  elevationGain?: number
  route?: {
    coordinates: Array<[number, number]> // [lng, lat]
    elevations?: number[]
  }
  metrics?: {
    heartRate?: {
      average?: number
      max?: number
    }
    cadence?: {
      average?: number
    }
  }
  weather?: {
    temperature?: number
    humidity?: number
    windSpeed?: number
  }
  photos?: string[]
  tags?: string[]
  notes?: string
}

export interface NikeAuthToken {
  accessToken: string
  refreshToken?: string
  expiresAt: Date
  tokenType: 'Bearer'
}

export class NikeRunClubClient {
  private baseUrl = 'https://api.nike.com'
  private authToken?: NikeAuthToken

  constructor(authToken?: NikeAuthToken) {
    this.authToken = authToken
  }

  /**
   * Authenticate using access token (new method)
   */
  async authenticateWithAccessToken(accessToken: string): Promise<NikeAuthToken> {
    try {
      // Validate token by making a test request
      const response = await fetch(`${this.baseUrl}/sport/v3/me/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Nike authentication failed: ${response.status}`)
      }

      const authToken: NikeAuthToken = {
        accessToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        tokenType: 'Bearer'
      }

      this.authToken = authToken
      return authToken
    } catch (error) {
      throw new Error(`Nike authentication error: ${error.message}`)
    }
  }

  /**
   * Authenticate using refresh token (legacy method)
   */
  async authenticateWithRefreshToken(refreshToken: string): Promise<NikeAuthToken> {
    try {
      const response = await fetch(`${this.baseUrl}/idn/shim/oauth/2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: 'VhAeafEGJ6G8e9DxRUz8iE50CZ9MiJMG', // Nike's public client ID
        }),
      })

      if (!response.ok) {
        throw new Error(`Nike token refresh failed: ${response.status}`)
      }

      const data = await response.json()
      
      const authToken: NikeAuthToken = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        tokenType: 'Bearer'
      }

      this.authToken = authToken
      return authToken
    } catch (error) {
      throw new Error(`Nike token refresh error: ${error.message}`)
    }
  }

  /**
   * Fetch user profile
   */
  async getProfile(): Promise<any> {
    if (!this.authToken) {
      throw new Error('Nike client not authenticated')
    }

    const response = await fetch(`${this.baseUrl}/sport/v3/me/profile`, {
      headers: {
        'Authorization': `${this.authToken.tokenType} ${this.authToken.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Nike profile: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Fetch activities with pagination
   */
  async getActivities(options: {
    limit?: number
    offset?: number
    since?: Date
  } = {}): Promise<NikeActivity[]> {
    if (!this.authToken) {
      throw new Error('Nike client not authenticated')
    }

    const { limit = 50, offset = 0, since } = options
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })

    if (since) {
      params.append('since', since.toISOString())
    }

    const response = await fetch(
      `${this.baseUrl}/sport/v3/me/activities/after_time/0?${params}`,
      {
        headers: {
          'Authorization': `${this.authToken.tokenType} ${this.authToken.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch Nike activities: ${response.status}`)
    }

    const data = await response.json()
    return this.transformActivities(data.activities || [])
  }

  /**
   * Fetch detailed activity data
   */
  async getActivityDetail(activityId: string): Promise<NikeActivity | null> {
    if (!this.authToken) {
      throw new Error('Nike client not authenticated')
    }

    const response = await fetch(
      `${this.baseUrl}/sport/v3/me/activity/${activityId}?metrics=ALL`,
      {
        headers: {
          'Authorization': `${this.authToken.tokenType} ${this.authToken.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch Nike activity detail: ${response.status}`)
    }

    const data = await response.json()
    return this.transformActivity(data)
  }

  /**
   * Transform Nike API response to our standard format
   */
  private transformActivities(nikeActivities: any[]): NikeActivity[] {
    return nikeActivities.map(activity => this.transformActivity(activity))
  }

  /**
   * Transform single Nike activity to our standard format
   */
  private transformActivity(nikeActivity: any): NikeActivity {
    const activity: NikeActivity = {
      id: nikeActivity.id,
      type: this.mapActivityType(nikeActivity.type),
      startTime: nikeActivity.start_epoch_ms 
        ? new Date(nikeActivity.start_epoch_ms).toISOString()
        : nikeActivity.start_time,
      endTime: nikeActivity.end_epoch_ms 
        ? new Date(nikeActivity.end_epoch_ms).toISOString()
        : nikeActivity.end_time,
      duration: Math.round(nikeActivity.active_duration_ms / 1000),
      distance: nikeActivity.distance_km * 1000, // Convert to meters
    }

    // Add optional fields
    if (nikeActivity.average_pace_per_km) {
      activity.averagePace = nikeActivity.average_pace_per_km
    }

    if (nikeActivity.calories) {
      activity.calories = nikeActivity.calories
    }

    if (nikeActivity.elevation_gain_m) {
      activity.elevationGain = nikeActivity.elevation_gain_m
    }

    // Add GPS route if available
    if (nikeActivity.gps && nikeActivity.gps.waypoints) {
      activity.route = {
        coordinates: nikeActivity.gps.waypoints.map((point: any) => [
          point.longitude,
          point.latitude
        ]),
        elevations: nikeActivity.gps.elevations
      }
    }

    // Add metrics if available
    if (nikeActivity.metrics) {
      activity.metrics = {}
      
      if (nikeActivity.metrics.heart_rate) {
        activity.metrics.heartRate = {
          average: nikeActivity.metrics.heart_rate.average,
          max: nikeActivity.metrics.heart_rate.max
        }
      }

      if (nikeActivity.metrics.cadence) {
        activity.metrics.cadence = {
          average: nikeActivity.metrics.cadence.average
        }
      }
    }

    // Add weather data if available
    if (nikeActivity.weather) {
      activity.weather = {
        temperature: nikeActivity.weather.temperature_c,
        humidity: nikeActivity.weather.humidity_percent,
        windSpeed: nikeActivity.weather.wind_speed_kph
      }
    }

    // Add photos and notes
    if (nikeActivity.photos) {
      activity.photos = nikeActivity.photos.map((photo: any) => photo.url)
    }

    if (nikeActivity.tags) {
      activity.tags = nikeActivity.tags
    }

    if (nikeActivity.note) {
      activity.notes = nikeActivity.note
    }

    return activity
  }

  /**
   * Map Nike activity types to our standard types
   */
  private mapActivityType(nikeType: string): 'run' | 'walk' {
    const typeMap: Record<string, 'run' | 'walk'> = {
      'run': 'run',
      'walk': 'walk',
      'jog': 'run',
      'trail_run': 'run',
      'treadmill_run': 'run',
      'outdoor_walk': 'walk',
      'treadmill_walk': 'walk',
    }

    return typeMap[nikeType.toLowerCase()] || 'run'
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    if (!this.authToken) return true
    return new Date() >= this.authToken.expiresAt
  }

  /**
   * Refresh access token if needed
   */
  async refreshTokenIfNeeded(): Promise<void> {
    if (!this.isTokenExpired()) return

    if (!this.authToken?.refreshToken) {
      throw new Error('No refresh token available')
    }

    await this.authenticateWithRefreshToken(this.authToken.refreshToken)
  }
}

/**
 * Nike Run Club Data Source Implementation
 */
export class NikeDataSource {
  private client: NikeRunClubClient
  private config: {
    accessToken?: string
    refreshToken?: string
    authMethod: 'access_token' | 'refresh_token'
  }

  constructor(config: {
    accessToken?: string
    refreshToken?: string
    authMethod: 'access_token' | 'refresh_token'
  }) {
    this.config = config
    this.client = new NikeRunClubClient()
  }

  async authenticate(): Promise<NikeAuthToken> {
    if (this.config.authMethod === 'access_token' && this.config.accessToken) {
      return await this.client.authenticateWithAccessToken(this.config.accessToken)
    } else if (this.config.authMethod === 'refresh_token' && this.config.refreshToken) {
      return await this.client.authenticateWithRefreshToken(this.config.refreshToken)
    } else {
      throw new Error('Invalid Nike authentication configuration')
    }
  }

  async fetchActivities(since?: Date): Promise<NikeActivity[]> {
    await this.client.refreshTokenIfNeeded()
    
    const activities: NikeActivity[] = []
    let offset = 0
    const limit = 50

    // Fetch all activities with pagination
    while (true) {
      const batch = await this.client.getActivities({
        limit,
        offset,
        since
      })

      if (batch.length === 0) break

      activities.push(...batch)
      
      if (batch.length < limit) break
      offset += limit
    }

    return activities
  }

  async getActivityDetail(activityId: string): Promise<NikeActivity | null> {
    await this.client.refreshTokenIfNeeded()
    return await this.client.getActivityDetail(activityId)
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.authenticate()
      await this.client.getProfile()
      return true
    } catch (error) {
      console.error('Nike connection test failed:', error)
      return false
    }
  }
}

export default NikeDataSource
