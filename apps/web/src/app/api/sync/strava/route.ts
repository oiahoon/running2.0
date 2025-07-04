import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database/connection'

interface StravaActivity {
  id: number
  name: string
  type: string
  sport_type: string
  start_date: string
  start_date_local: string
  timezone: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  average_speed: number
  max_speed: number
  start_latitude: number
  start_longitude: number
  end_latitude: number
  end_longitude: number
  location_city: string
  location_state: string
  location_country: string
  map: {
    id: string
    summary_polyline: string
  }
  average_heartrate?: number
  max_heartrate?: number
  calories?: number
  average_cadence?: number
  average_watts?: number
  weighted_average_watts?: number
  kilojoules?: number
}

interface StravaTokenResponse {
  access_token: string
  refresh_token: string
  expires_at: number
}

async function getStoredTokens() {
  const db = getDatabase()
  
  const settings = db.prepare(`
    SELECT access_token, refresh_token, token_expires_at
    FROM data_source_settings 
    WHERE source = 'strava' AND is_active = 1
    ORDER BY updated_at DESC
    LIMIT 1
  `).get() as any

  if (!settings) {
    throw new Error('No Strava connection found. Please connect your Strava account first.')
  }

  return {
    accessToken: settings.access_token,
    refreshToken: settings.refresh_token,
    expiresAt: new Date(settings.token_expires_at).getTime() / 1000
  }
}

async function refreshStravaToken(refreshToken: string): Promise<StravaTokenResponse> {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`)
  }

  return response.json()
}

async function updateStoredTokens(tokenData: StravaTokenResponse) {
  const db = getDatabase()
  
  const updateTokens = db.prepare(`
    UPDATE data_source_settings 
    SET access_token = ?, refresh_token = ?, token_expires_at = ?, updated_at = ?
    WHERE source = 'strava' AND is_active = 1
  `)

  const expiresAt = new Date(tokenData.expires_at * 1000).toISOString()
  const now = new Date().toISOString()

  updateTokens.run(
    tokenData.access_token,
    tokenData.refresh_token,
    expiresAt,
    now
  )
}

async function fetchStravaActivities(accessToken: string, page = 1, perPage = 200): Promise<StravaActivity[]> {
  const response = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch activities: ${response.statusText}`)
  }

  return response.json()
}

async function saveActivityToDatabase(activity: StravaActivity) {
  const db = getDatabase()
  
  const insertActivity = db.prepare(`
    INSERT OR REPLACE INTO activities (
      external_id, source, name, description, type, sport_type,
      start_date, start_date_local, timezone,
      distance, moving_time, elapsed_time, total_elevation_gain,
      average_speed, max_speed,
      start_latitude, start_longitude, end_latitude, end_longitude,
      location_city, location_state, location_country,
      summary_polyline, map_id,
      average_heartrate, max_heartrate, calories,
      average_cadence, average_power, weighted_average_power,
      created_at, updated_at, synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const now = new Date().toISOString()
  
  insertActivity.run(
    activity.id.toString(),
    'strava',
    activity.name,
    '', // description
    activity.type,
    activity.sport_type,
    activity.start_date,
    activity.start_date_local,
    activity.timezone,
    activity.distance,
    activity.moving_time,
    activity.elapsed_time,
    activity.total_elevation_gain,
    activity.average_speed,
    activity.max_speed,
    activity.start_latitude,
    activity.start_longitude,
    activity.end_latitude,
    activity.end_longitude,
    activity.location_city,
    activity.location_state,
    activity.location_country,
    activity.map?.summary_polyline,
    activity.map?.id,
    activity.average_heartrate,
    activity.max_heartrate,
    activity.calories,
    activity.average_cadence,
    activity.average_watts,
    activity.weighted_average_watts,
    now,
    now,
    now
  )
}

async function logSync(status: string, activitiesProcessed: number, error?: string) {
  const db = getDatabase()
  
  const insertLog = db.prepare(`
    INSERT INTO sync_logs (
      source, sync_type, status, activities_processed,
      error_message, started_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const now = new Date().toISOString()
  
  insertLog.run(
    'strava',
    'scheduled',
    status,
    activitiesProcessed,
    error || null,
    now,
    now
  )
}

export async function GET(request: NextRequest) {
  try {
    console.log('Starting Strava sync...')
    
    // Check if we have the required environment variables
    if (!process.env.STRAVA_CLIENT_ID || !process.env.STRAVA_CLIENT_SECRET) {
      throw new Error('Missing Strava API credentials')
    }

    // Get stored tokens
    console.log('Getting stored Strava tokens...')
    const storedTokens = await getStoredTokens()
    
    // Check if token needs refresh
    let accessToken = storedTokens.accessToken
    const now = Math.floor(Date.now() / 1000)
    
    if (storedTokens.expiresAt <= now + 300) { // Refresh if expires in 5 minutes
      console.log('Refreshing Strava token...')
      const tokenData = await refreshStravaToken(storedTokens.refreshToken)
      await updateStoredTokens(tokenData)
      accessToken = tokenData.access_token
    }
    
    // Fetch activities
    console.log('Fetching Strava activities...')
    let allActivities: StravaActivity[] = []
    let page = 1
    let hasMore = true
    
    while (hasMore && page <= 10) { // Limit to 10 pages (2000 activities) for safety
      const activities = await fetchStravaActivities(accessToken, page)
      
      if (activities.length === 0) {
        hasMore = false
      } else {
        allActivities = allActivities.concat(activities)
        page++
        
        // If we got less than 200 activities, we've reached the end
        if (activities.length < 200) {
          hasMore = false
        }
      }
    }

    console.log(`Fetched ${allActivities.length} activities from Strava`)

    // Save activities to database
    let savedCount = 0
    for (const activity of allActivities) {
      try {
        await saveActivityToDatabase(activity)
        savedCount++
      } catch (error) {
        console.error(`Failed to save activity ${activity.id}:`, error)
      }
    }

    console.log(`Saved ${savedCount} activities to database`)

    // Log successful sync
    await logSync('success', savedCount)

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${savedCount} activities from Strava`,
      activitiesProcessed: allActivities.length,
      activitiesSaved: savedCount,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Strava sync error:', error)
    
    // Log failed sync
    await logSync('error', 0, error instanceof Error ? error.message : 'Unknown error')

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Allow manual triggering via POST
export async function POST(request: NextRequest) {
  return GET(request)
}
