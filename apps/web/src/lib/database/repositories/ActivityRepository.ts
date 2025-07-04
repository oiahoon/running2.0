// Activity Repository for database operations
import { getDatabase } from '../connection';
import { Activity, ActivityFilters, ActivitySummary } from '../models/Activity';

export class ActivityRepository {
  private db = getDatabase();

  // Get activities with filtering and pagination
  async getActivities(
    filters: ActivityFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ activities: Activity[]; total: number }> {
    const offset = (page - 1) * limit;
    
    // Build WHERE clause
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    
    if (filters.type?.length) {
      conditions.push(`type IN (${filters.type.map(() => '?').join(',')})`);
      params.push(...filters.type);
    }
    
    if (filters.source?.length) {
      conditions.push(`source IN (${filters.source.map(() => '?').join(',')})`);
      params.push(...filters.source);
    }
    
    if (filters.startDate) {
      conditions.push('start_date >= ?');
      params.push(filters.startDate.toISOString());
    }
    
    if (filters.endDate) {
      conditions.push('start_date <= ?');
      params.push(filters.endDate.toISOString());
    }
    
    if (filters.minDistance) {
      conditions.push('distance >= ?');
      params.push(filters.minDistance);
    }
    
    if (filters.maxDistance) {
      conditions.push('distance <= ?');
      params.push(filters.maxDistance);
    }
    
    if (filters.search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    const whereClause = conditions.join(' AND ');
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM activities WHERE ${whereClause}`;
    const countResult = this.db.prepare(countQuery).get(...params) as { total: number };
    const total = countResult.total;
    
    // Get activities
    const activitiesQuery = `
      SELECT * FROM activities 
      WHERE ${whereClause}
      ORDER BY start_date DESC 
      LIMIT ? OFFSET ?
    `;
    
    const activities = this.db.prepare(activitiesQuery).all(...params, limit, offset) as Activity[];
    
    return { activities, total };
  }

  // Get activity by ID
  async getActivityById(id: number): Promise<Activity | null> {
    const activity = this.db.prepare('SELECT * FROM activities WHERE id = ?').get(id) as Activity | undefined;
    return activity || null;
  }

  // Get activity summary statistics
  async getActivitySummary(filters: ActivityFilters = {}): Promise<ActivitySummary> {
    // Build WHERE clause
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    
    if (filters.type?.length) {
      conditions.push(`type IN (${filters.type.map(() => '?').join(',')})`);
      params.push(...filters.type);
    }
    
    if (filters.startDate) {
      conditions.push('start_date >= ?');
      params.push(filters.startDate.toISOString());
    }
    
    if (filters.endDate) {
      conditions.push('start_date <= ?');
      params.push(filters.endDate.toISOString());
    }
    
    const whereClause = conditions.join(' AND ');
    
    const query = `
      SELECT 
        COUNT(*) as totalActivities,
        COALESCE(SUM(distance), 0) as totalDistance,
        COALESCE(SUM(moving_time), 0) as totalTime,
        COALESCE(AVG(distance), 0) as averageDistance,
        COALESCE(MAX(distance), 0) as longestRun,
        COALESCE(SUM(total_elevation_gain), 0) as totalElevationGain,
        COALESCE(SUM(calories), 0) as totalCalories
      FROM activities 
      WHERE ${whereClause}
    `;
    
    const result = this.db.prepare(query).get(...params) as any;
    
    // Calculate average pace (weighted by distance)
    const paceQuery = `
      SELECT 
        SUM(distance * (moving_time / (distance / 1000))) as weighted_pace_sum,
        SUM(distance) as total_distance
      FROM activities 
      WHERE ${whereClause} AND distance > 0 AND moving_time > 0
    `;
    
    const paceResult = this.db.prepare(paceQuery).get(...params) as any;
    const averagePace = paceResult.total_distance > 0 
      ? paceResult.weighted_pace_sum / paceResult.total_distance 
      : 0;
    
    // Get fastest pace
    const fastestPaceQuery = `
      SELECT MIN(moving_time / (distance / 1000)) as fastest_pace
      FROM activities 
      WHERE ${whereClause} AND distance > 0 AND moving_time > 0
    `;
    
    const fastestResult = this.db.prepare(fastestPaceQuery).get(...params) as any;
    const fastestPace = fastestResult.fastest_pace || 0;
    
    return {
      totalDistance: result.totalDistance || 0,
      totalTime: result.totalTime || 0,
      totalActivities: result.totalActivities || 0,
      averagePace,
      averageDistance: result.averageDistance || 0,
      longestRun: result.longestRun || 0,
      fastestPace,
      totalElevationGain: result.totalElevationGain || 0,
      totalCalories: result.totalCalories || 0,
    };
  }

  // Get recent activities
  async getRecentActivities(limit = 5): Promise<Activity[]> {
    const query = `
      SELECT * FROM activities 
      ORDER BY start_date DESC 
      LIMIT ?
    `;
    
    return this.db.prepare(query).all(limit) as Activity[];
  }

  // Get monthly activity data
  async getMonthlyData(year?: number): Promise<Array<{
    month: string;
    distance: number;
    activities: number;
    avgPace: number;
  }>> {
    const yearFilter = year ? `AND strftime('%Y', start_date) = '${year}'` : '';
    
    const query = `
      SELECT 
        strftime('%m', start_date) as month_num,
        CASE strftime('%m', start_date)
          WHEN '01' THEN 'Jan' WHEN '02' THEN 'Feb' WHEN '03' THEN 'Mar'
          WHEN '04' THEN 'Apr' WHEN '05' THEN 'May' WHEN '06' THEN 'Jun'
          WHEN '07' THEN 'Jul' WHEN '08' THEN 'Aug' WHEN '09' THEN 'Sep'
          WHEN '10' THEN 'Oct' WHEN '11' THEN 'Nov' WHEN '12' THEN 'Dec'
        END as month,
        COALESCE(SUM(distance) / 1000, 0) as distance,
        COUNT(*) as activities,
        COALESCE(AVG(moving_time / (distance / 1000)), 0) as avgPace
      FROM activities 
      WHERE distance > 0 ${yearFilter}
      GROUP BY strftime('%Y-%m', start_date)
      ORDER BY strftime('%Y-%m', start_date)
    `;
    
    return this.db.prepare(query).all() as any[];
  }

  // Get activity types distribution
  async getActivityTypesDistribution(): Promise<Array<{ type: string; count: number; percentage: number }>> {
    const query = `
      SELECT 
        type,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM activities), 2) as percentage
      FROM activities 
      GROUP BY type 
      ORDER BY count DESC
    `;
    
    return this.db.prepare(query).all() as any[];
  }

  // Get yearly statistics
  async getYearlyStats(year: number): Promise<ActivitySummary> {
    const filters: ActivityFilters = {
      startDate: new Date(year, 0, 1),
      endDate: new Date(year, 11, 31, 23, 59, 59),
    };
    
    return this.getActivitySummary(filters);
  }

  // Create new activity
  async createActivity(activityData: Partial<Activity>): Promise<Activity> {
    const now = new Date().toISOString();
    
    const insertQuery = `
      INSERT INTO activities (
        external_id, source, name, description, type, sport_type,
        start_date, start_date_local, timezone, distance, moving_time,
        elapsed_time, average_speed, average_heartrate, location_country,
        summary_polyline, raw_data, created_at, updated_at, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = this.db.prepare(insertQuery).run(
      activityData.externalId || null,
      activityData.source || 'manual',
      activityData.name || 'Untitled Activity',
      activityData.description || null,
      activityData.type || 'Other',
      activityData.sportType || null,
      activityData.startDate?.toISOString() || now,
      activityData.startDateLocal?.toISOString() || now,
      activityData.timezone || null,
      activityData.distance || null,
      activityData.movingTime || null,
      activityData.elapsedTime || null,
      activityData.averageSpeed || null,
      activityData.averageHeartrate || null,
      activityData.locationCountry || null,
      activityData.summaryPolyline || null,
      JSON.stringify(activityData.rawData || {}),
      now,
      now,
      now
    );
    
    // Get the created activity
    const createdActivity = this.db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid) as Activity;
    return createdActivity;
  }
}

// Export singleton instance
export const activityRepository = new ActivityRepository();
