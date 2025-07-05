import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database/connection'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    const searchParams = request.nextUrl.searchParams
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')?.split(',').filter(Boolean)
    const source = searchParams.get('source')?.split(',').filter(Boolean)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const minDistance = searchParams.get('minDistance')
    const maxDistance = searchParams.get('maxDistance')
    const search = searchParams.get('search')
    
    // Build WHERE clause
    const conditions: string[] = []
    const params: any[] = []
    
    if (type?.length) {
      conditions.push(`type IN (${type.map(() => '?').join(',')})`)
      params.push(...type)
    }
    
    if (source?.length) {
      conditions.push(`source IN (${source.map(() => '?').join(',')})`)
      params.push(...source)
    }
    
    if (startDate) {
      conditions.push('start_date >= ?')
      params.push(startDate)
    }
    
    if (endDate) {
      conditions.push('start_date <= ?')
      params.push(endDate)
    }
    
    if (minDistance) {
      conditions.push('distance >= ?')
      params.push(parseFloat(minDistance))
    }
    
    if (maxDistance) {
      conditions.push('distance <= ?')
      params.push(parseFloat(maxDistance))
    }
    
    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM activities ${whereClause}`
    const countResult = db.prepare(countQuery).get(...params) as { total: number }
    const total = countResult.total
    
    // Calculate pagination
    const offset = (page - 1) * limit
    const totalPages = Math.ceil(total / limit)
    
    // Get activities
    const activitiesQuery = `
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
      ${whereClause}
      ORDER BY start_date DESC 
      LIMIT ? OFFSET ?
    `
    
    const activities = db.prepare(activitiesQuery).all(...params, limit, offset)
    
    // Get activity type summary
    const typeSummaryQuery = `
      SELECT 
        type,
        COUNT(*) as count,
        SUM(distance) as total_distance,
        SUM(moving_time) as total_time
      FROM activities 
      ${whereClause}
      GROUP BY type 
      ORDER BY count DESC
    `
    const typeSummary = db.prepare(typeSummaryQuery).all(...params)
    
    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      summary: {
        totalActivities: total,
        typeDistribution: typeSummary,
      },
      filters: {
        type,
        source,
        startDate,
        endDate,
        minDistance,
        maxDistance,
        search,
      },
    })
  } catch (error) {
    console.error('Activities API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}
