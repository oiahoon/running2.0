import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database/connection'

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    const currentYear = new Date().getFullYear()
    
    // Basic stats
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
    `).get() as any

    // Activity type distribution
    const typeDistributionRaw = db.prepare(`
      SELECT 
        type,
        COUNT(*) as count,
        SUM(distance) as total_distance,
        SUM(moving_time) as total_time
      FROM activities 
      GROUP BY type 
      ORDER BY count DESC
    `).all()

    const totalActivities = typeDistributionRaw.reduce((sum: number, item: any) => sum + item.count, 0)
    const typeDistribution = typeDistributionRaw.map((item: any) => ({
      type: item.type,
      count: item.count,
      total_distance: Math.round((item.total_distance || 0) / 1000 * 100) / 100, // Convert to km
      total_time: item.total_time || 0,
      percentage: totalActivities > 0 ? Math.round((item.count / totalActivities) * 100 * 100) / 100 : 0
    }))

    // Monthly stats for current year
    const monthlyStats = db.prepare(`
      SELECT 
        strftime('%Y-%m', start_date) as month,
        COUNT(*) as activities,
        SUM(distance) as distance,
        SUM(moving_time) as time,
        AVG(distance) as avg_distance
      FROM activities 
      WHERE strftime('%Y', start_date) = ?
      GROUP BY strftime('%Y-%m', start_date)
      ORDER BY month
    `).all(currentYear.toString()).map((row: any) => ({
      month: row.month,
      activities: row.activities,
      distance: Math.round((row.distance || 0) / 1000 * 100) / 100, // Convert to km with 2 decimals
      time: row.time || 0,
      avgDistance: Math.round((row.avg_distance || 0) / 1000 * 100) / 100, // Convert to km
      avgPace: row.distance > 0 ? Math.round((row.time / (row.distance / 1000)) / 60 * 100) / 100 : 0 // minutes per km
    }))

    // Daily stats for heatmap (current year)
    const dailyStats = db.prepare(`
      SELECT 
        DATE(start_date) as date,
        COUNT(*) as activities,
        SUM(distance) as distance,
        SUM(moving_time) as duration
      FROM activities 
      WHERE strftime('%Y', start_date) = ?
      GROUP BY DATE(start_date)
      ORDER BY date
    `).all(currentYear.toString())

    // Recent activities (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentActivities = db.prepare(`
      SELECT 
        id, name, type, distance, moving_time, start_date, start_date_local
      FROM activities 
      WHERE start_date >= ?
      ORDER BY start_date DESC 
      LIMIT 10
    `).all(thirtyDaysAgo.toISOString())

    // Weekly stats (last 12 weeks)
    const weeklyStats = db.prepare(`
      SELECT 
        strftime('%Y-W%W', start_date) as week,
        COUNT(*) as activities,
        SUM(distance) as distance,
        SUM(moving_time) as time
      FROM activities 
      WHERE start_date >= date('now', '-12 weeks')
      GROUP BY strftime('%Y-W%W', start_date)
      ORDER BY week
    `).all()

    // Personal records
    const personalRecords = {
      longestRun: db.prepare(`
        SELECT name, distance, start_date 
        FROM activities 
        WHERE type IN ('Run', 'Running') 
        ORDER BY distance DESC 
        LIMIT 1
      `).get(),
      fastestPace: db.prepare(`
        SELECT name, distance, moving_time, start_date,
               (moving_time / (distance / 1000)) as pace_per_km
        FROM activities 
        WHERE type IN ('Run', 'Running') AND distance > 1000
        ORDER BY pace_per_km ASC 
        LIMIT 1
      `).get(),
      mostElevation: db.prepare(`
        SELECT name, total_elevation_gain, distance, start_date
        FROM activities 
        WHERE total_elevation_gain > 0
        ORDER BY total_elevation_gain DESC 
        LIMIT 1
      `).get()
    }

    return NextResponse.json({
      basicStats: {
        totalActivities: basicStats.total_activities || 0,
        totalDistance: basicStats.total_distance || 0,
        totalTime: basicStats.total_time || 0,
        totalElevation: basicStats.total_elevation || 0,
        avgDistance: basicStats.avg_distance || 0,
        avgTime: basicStats.avg_time || 0,
        longestDistance: basicStats.longest_distance || 0,
        firstActivity: basicStats.first_activity,
        lastActivity: basicStats.last_activity,
      },
      typeDistribution,
      monthlyStats,
      dailyStats,
      recentActivities,
      weeklyStats,
      personalRecords,
      year: currentYear,
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
