import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database/connection'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null // Don't default to current year
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null
    const type = searchParams.get('type')?.split(',').filter(Boolean) || null

    // Build WHERE clause based on parameters
    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    // Only filter by year if explicitly provided
    if (year) {
      whereClause += ` AND strftime('%Y', start_date) = ?`
      params.push(year.toString())
    }

    if (month) {
      whereClause += ` AND strftime('%m', start_date) = ?`
      params.push(month.toString().padStart(2, '0'))
    }

    if (type && type.length > 0) {
      whereClause += ` AND type IN (${type.map(() => '?').join(',')})`
      params.push(...type)
    }

    // Basic stats for the specified period (or all-time if no year specified)
    const basicStats = db.prepare(`
      SELECT 
        COUNT(*) as total_activities,
        SUM(distance) as total_distance,
        SUM(moving_time) as total_time,
        SUM(total_elevation_gain) as total_elevation,
        AVG(distance) as avg_distance,
        AVG(moving_time) as avg_time,
        MAX(distance) as longest_distance,
        MIN(start_date) as first_activity,
        MAX(start_date) as last_activity
      FROM activities
      ${whereClause}
    `).get(...params) as any

    // Activity type distribution for the specified period
    const typeDistributionRaw = db.prepare(`
      SELECT 
        type,
        COUNT(*) as count,
        SUM(distance) as total_distance,
        SUM(moving_time) as total_time
      FROM activities 
      ${whereClause}
      GROUP BY type 
      ORDER BY count DESC
    `).all(...params)

    const totalActivities = typeDistributionRaw.reduce((sum: number, item: any) => sum + item.count, 0)
    const typeDistribution = typeDistributionRaw.map((item: any) => ({
      type: item.type,
      count: item.count,
      total_distance: Math.round((item.total_distance || 0) / 1000 * 100) / 100, // Convert to km
      total_time: item.total_time || 0,
      percentage: totalActivities > 0 ? Math.round((item.count / totalActivities) * 100 * 100) / 100 : 0
    }))

    // Monthly stats - only if year is specified, otherwise return empty array
    let monthlyStats = []
    if (year) {
      monthlyStats = db.prepare(`
        SELECT 
          strftime('%Y-%m', start_date) as month,
          COUNT(*) as activities,
          SUM(distance) as distance,
          SUM(moving_time) as time,
          AVG(distance) as avg_distance
        FROM activities 
        WHERE strftime('%Y', start_date) = ?
        ${type && type.length > 0 ? `AND type IN (${type.map(() => '?').join(',')})` : ''}
        GROUP BY strftime('%Y-%m', start_date)
        ORDER BY month
      `).all(year.toString(), ...(type || []))
    }

    // Transform monthly data
    const monthlyData = monthlyStats.map((item: any) => ({
      month: item.month,
      activities: item.activities,
      distance: Math.round((item.distance || 0) / 1000 * 100) / 100, // Convert to km
      time: item.time || 0,
      avg_distance: Math.round((item.avg_distance || 0) / 1000 * 100) / 100
    }))

    // Weekly stats - only if year is specified, otherwise return empty array
    let weeklyStatsRaw = []
    if (year) {
      weeklyStatsRaw = db.prepare(`
        SELECT 
          strftime('%W', start_date) as week,
          COUNT(*) as activities,
          SUM(distance) as distance,
          SUM(moving_time) as time
        FROM activities 
        WHERE strftime('%Y', start_date) = ?
        ${type && type.length > 0 ? `AND type IN (${type.map(() => '?').join(',')})` : ''}
        GROUP BY strftime('%W', start_date)
        ORDER BY week
      `).all(year.toString(), ...(type || []))
    }

    // Transform weekly data
    const weeklyData = weeklyStatsRaw.map((item: any) => ({
      week: item.week,
      activities: item.activities,
      distance: Math.round((item.distance || 0) / 1000 * 100) / 100,
      time: item.time || 0
    }))

    // Pace analysis for running activities - only if year is specified
    let paceDataRaw = []
    if (year) {
      paceDataRaw = db.prepare(`
        SELECT 
          name,
          DATE(start_date) as date,
          distance,
          moving_time,
          CASE 
            WHEN distance > 0 AND moving_time > 0 THEN (moving_time / 60.0) / (distance / 1000.0)
            ELSE 0 
          END as pace
        FROM activities 
        WHERE strftime('%Y', start_date) = ?
        AND type IN ('Run', 'Walk')
        AND distance > 1000
        AND moving_time > 0
        ${type && type.length > 0 ? `AND type IN (${type.map(() => '?').join(',')})` : ''}
        ORDER BY start_date DESC
        LIMIT 50
      `).all(year.toString(), ...(type || []))
    }

    // Transform pace data
    const paceAnalysis = paceDataRaw.map((item: any) => ({
      name: item.name,
      date: item.date,
      distance: Math.round((item.distance || 0) / 1000 * 100) / 100,
      pace: item.pace
    }))

    // Daily stats for heatmap - only if year is specified
    let dailyStatsRaw = []
    if (year) {
      dailyStatsRaw = db.prepare(`
        SELECT 
          DATE(start_date) as date,
          COUNT(*) as activities,
          SUM(distance) as distance,
          SUM(moving_time) as duration
        FROM activities 
        WHERE strftime('%Y', start_date) = ?
        ${type && type.length > 0 ? `AND type IN (${type.map(() => '?').join(',')})` : ''}
        GROUP BY DATE(start_date)
        ORDER BY date
      `).all(year.toString(), ...(type || []))
    }

    // Transform daily data for heatmap
    const dailyData = dailyStatsRaw.map((item: any) => ({
      date: item.date,
      activities: item.activities,
      distance: Math.round((item.distance || 0) / 1000 * 100) / 100, // Convert to km
      duration: item.duration || 0
    }))

    // Personal records for the specified period
    const personalRecords = {
      longestRun: db.prepare(`
        SELECT name, distance, start_date 
        FROM activities 
        ${whereClause}
        ORDER BY distance DESC 
        LIMIT 1
      `).get(...params),
      
      fastestPace: db.prepare(`
        SELECT name, distance, moving_time, start_date,
               CASE 
                 WHEN distance > 0 THEN (moving_time / 60.0) / (distance / 1000.0)
                 ELSE 0 
               END as pace_per_km
        FROM activities 
        ${whereClause}
        AND distance > 1000
        AND moving_time > 0
        ORDER BY pace_per_km ASC 
        LIMIT 1
      `).get(...params),
      
      mostElevation: db.prepare(`
        SELECT name, total_elevation_gain, distance, start_date 
        FROM activities 
        ${whereClause}
        AND total_elevation_gain > 0
        ORDER BY total_elevation_gain DESC 
        LIMIT 1
      `).get(...params)
    }

    // Recent activities (limit 10)
    const recentActivities = db.prepare(`
      SELECT 
        id, name, type, distance, moving_time, total_elevation_gain, start_date,
        start_latitude, start_longitude
      FROM activities 
      ${whereClause}
      ORDER BY start_date DESC 
      LIMIT 10
    `).all(...params)

    const transformedRecentActivities = recentActivities.map((activity: any) => ({
      ...activity,
      distance: Math.round((activity.distance || 0) / 1000 * 100) / 100, // Convert to km
      total_elevation_gain: Math.round(activity.total_elevation_gain || 0)
    }))

    return NextResponse.json({
      success: true,
      year,
      month,
      type,
      basicStats: {
        ...basicStats,
        total_distance: Math.round((basicStats.total_distance || 0) / 1000 * 100) / 100,
        avg_distance: Math.round((basicStats.avg_distance || 0) / 1000 * 100) / 100,
        longest_distance: Math.round((basicStats.longest_distance || 0) / 1000 * 100) / 100,
        total_elevation: Math.round(basicStats.total_elevation || 0)
      },
      activityTypes: typeDistribution,
      monthlyStats: monthlyData,
      weeklyStats: weeklyData,
      paceAnalysis: paceAnalysis,
      dailyStats: dailyData,
      personalRecords,
      recentActivities: transformedRecentActivities
    })

  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
