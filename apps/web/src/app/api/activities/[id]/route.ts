import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database/connection'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const db = getDatabase()

    const activity = db.prepare(`
      SELECT
        id, external_id, name, description, type, sport_type,
        start_date, start_date_local, timezone,
        distance, moving_time, elapsed_time, total_elevation_gain,
        average_speed, max_speed,
        average_heartrate, max_heartrate,
        start_latitude, start_longitude, end_latitude, end_longitude,
        location_city, location_state, location_country,
        summary_polyline, map_id,
        calories, average_cadence, average_power, weighted_average_power,
        source, created_at, updated_at, synced_at
      FROM activities
      WHERE id = ? OR external_id = ?
      LIMIT 1
    `).get(id, id) as any

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json({
      activity: {
        ...activity,
        externalId: activity.external_id,
        startDate: activity.start_date,
        startDateLocal: activity.start_date_local,
        sportType: activity.sport_type,
        movingTime: activity.moving_time,
        elapsedTime: activity.elapsed_time,
        totalElevationGain: activity.total_elevation_gain,
        averageSpeed: activity.average_speed,
        maxSpeed: activity.max_speed,
        averageHeartrate: activity.average_heartrate,
        maxHeartrate: activity.max_heartrate,
        startLatitude: activity.start_latitude,
        startLongitude: activity.start_longitude,
        endLatitude: activity.end_latitude,
        endLongitude: activity.end_longitude,
        locationCity: activity.location_city,
        locationState: activity.location_state,
        locationCountry: activity.location_country,
        summaryPolyline: activity.summary_polyline,
        mapId: activity.map_id,
        averageCadence: activity.average_cadence,
        averagePower: activity.average_power,
        weightedAveragePower: activity.weighted_average_power,
        createdAt: activity.created_at,
        updatedAt: activity.updated_at,
        syncedAt: activity.synced_at,
      },
    })
  } catch (error) {
    console.error('Activity detail API error:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}
