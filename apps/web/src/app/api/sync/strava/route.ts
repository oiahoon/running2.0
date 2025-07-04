// Strava data synchronization API
import { NextRequest, NextResponse } from 'next/server';
import { createStravaIntegration } from '@/lib/integrations/strava';
import { getDatabase } from '@/lib/database/connection';

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID!;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!;

// POST /api/sync/strava - Sync activities from Strava
export async function POST(request: NextRequest) {
  const syncStartTime = new Date();
  let syncLogId: number | null = null;
  
  try {
    const body = await request.json();
    const { force = false, after, before } = body;

    const db = getDatabase();

    // Get Strava tokens from database
    const tokenData = db.prepare(`
      SELECT access_token, refresh_token, token_expires_at 
      FROM data_source_settings 
      WHERE user_id = 1 AND source = 'strava' AND is_active = true
    `).get() as any;

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Strava not connected. Please authenticate first.' },
        { status: 401 }
      );
    }

    // Create sync log entry
    const syncLogResult = db.prepare(`
      INSERT INTO sync_logs (
        user_id, source, sync_type, status, started_at, sync_params
      ) VALUES (1, 'strava', ?, 'running', ?, ?)
    `).run(
      force ? 'full' : 'incremental',
      syncStartTime.toISOString(),
      JSON.stringify({ force, after, before })
    );
    
    syncLogId = syncLogResult.lastInsertRowid as number;

    // Initialize Strava integration
    const tokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(tokenData.token_expires_at).getTime() / 1000,
    };

    const strava = createStravaIntegration(STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, tokens);

    // Determine sync date range
    let afterDate: Date | undefined;
    let beforeDate: Date | undefined;

    if (after) {
      afterDate = new Date(after);
    } else if (!force) {
      // Get last sync date for incremental sync
      const lastSync = db.prepare(`
        SELECT MAX(start_date) as last_date 
        FROM activities 
        WHERE source = 'strava'
      `).get() as { last_date: string | null };

      if (lastSync?.last_date) {
        afterDate = new Date(lastSync.last_date);
      }
    }

    if (before) {
      beforeDate = new Date(before);
    }

    console.log('Starting Strava sync...', { afterDate, beforeDate, force });

    // Fetch activities from Strava
    const stravaActivities = await strava.getAllActivities(afterDate, beforeDate);

    let processed = 0;
    let created = 0;
    let updated = 0;
    let skipped = 0;

    // Process activities in batches
    const batchSize = 50;
    const insertActivity = db.prepare(`
      INSERT INTO activities (
        external_id, source, name, description, type, sport_type,
        start_date, start_date_local, timezone, distance, moving_time,
        elapsed_time, average_speed, max_speed, average_heartrate, max_heartrate,
        start_latitude, start_longitude, end_latitude, end_longitude,
        location_city, location_state, location_country, summary_polyline,
        calories, average_cadence, total_elevation_gain, device_name,
        visibility, raw_data, created_at, updated_at, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(external_id, source) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        distance = excluded.distance,
        moving_time = excluded.moving_time,
        elapsed_time = excluded.elapsed_time,
        average_speed = excluded.average_speed,
        max_speed = excluded.max_speed,
        average_heartrate = excluded.average_heartrate,
        max_heartrate = excluded.max_heartrate,
        summary_polyline = excluded.summary_polyline,
        raw_data = excluded.raw_data,
        updated_at = excluded.updated_at,
        synced_at = excluded.synced_at
    `);

    const transaction = db.transaction((activities: any[]) => {
      for (const stravaActivity of activities) {
        try {
          const activity = strava.convertToActivity(stravaActivity);
          const now = new Date().toISOString();

          const result = insertActivity.run(
            activity.externalId,
            activity.source,
            activity.name,
            activity.description || null,
            activity.type,
            activity.sportType || null,
            activity.startDate.toISOString(),
            activity.startDateLocal.toISOString(),
            stravaActivity.timezone || null,
            activity.distance || null,
            activity.movingTime || null,
            activity.elapsedTime || null,
            activity.averageSpeed || null,
            stravaActivity.max_speed || null,
            activity.averageHeartrate || null,
            stravaActivity.max_heartrate || null,
            stravaActivity.start_latlng?.[0] || null,
            stravaActivity.start_latlng?.[1] || null,
            stravaActivity.end_latlng?.[0] || null,
            stravaActivity.end_latlng?.[1] || null,
            stravaActivity.location_city || null,
            stravaActivity.location_state || null,
            activity.locationCountry || null,
            activity.summaryPolyline || null,
            stravaActivity.calories || null,
            stravaActivity.average_cadence || null,
            stravaActivity.total_elevation_gain || null,
            stravaActivity.device_name || null,
            stravaActivity.visibility_type === 'everyone' ? 'public' : 'private',
            JSON.stringify(activity.rawData),
            now,
            now,
            now
          );

          if (result.changes > 0) {
            if (result.lastInsertRowid) {
              created++;
            } else {
              updated++;
            }
          } else {
            skipped++;
          }

          processed++;
        } catch (error) {
          console.error(`Failed to process activity ${stravaActivity.id}:`, error);
          skipped++;
        }
      }
    });

    // Process in batches
    for (let i = 0; i < stravaActivities.length; i += batchSize) {
      const batch = stravaActivities.slice(i, i + batchSize);
      transaction(batch);
      console.log(`Processed ${Math.min(i + batchSize, stravaActivities.length)}/${stravaActivities.length} activities`);
    }

    const syncEndTime = new Date();
    const duration = Math.floor((syncEndTime.getTime() - syncStartTime.getTime()) / 1000);

    // Update sync log
    db.prepare(`
      UPDATE sync_logs SET
        status = 'success',
        activities_processed = ?,
        activities_created = ?,
        activities_updated = ?,
        activities_skipped = ?,
        completed_at = ?,
        duration_seconds = ?
      WHERE id = ?
    `).run(processed, created, updated, skipped, syncEndTime.toISOString(), duration, syncLogId);

    // Update last sync time
    db.prepare(`
      UPDATE data_source_settings 
      SET last_sync_at = ? 
      WHERE user_id = 1 AND source = 'strava'
    `).run(syncEndTime.toISOString());

    console.log('Strava sync completed:', { processed, created, updated, skipped, duration });

    return NextResponse.json({
      success: true,
      summary: {
        processed,
        created,
        updated,
        skipped,
        duration,
      },
      message: `Successfully synced ${processed} activities from Strava`,
    });

  } catch (error) {
    console.error('Strava sync error:', error);

    // Update sync log with error
    if (syncLogId) {
      const db = getDatabase();
      db.prepare(`
        UPDATE sync_logs SET
          status = 'error',
          error_message = ?,
          completed_at = ?
        WHERE id = ?
      `).run(
        error instanceof Error ? error.message : 'Unknown error',
        new Date().toISOString(),
        syncLogId
      );
    }

    return NextResponse.json(
      { 
        error: 'Strava sync failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/sync/strava - Get sync status and history
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();

    // Get connection status
    const connection = db.prepare(`
      SELECT source, is_active, connection_status, last_sync_at, auto_sync, sync_frequency
      FROM data_source_settings 
      WHERE user_id = 1 AND source = 'strava'
    `).get();

    // Get recent sync logs
    const syncLogs = db.prepare(`
      SELECT * FROM sync_logs 
      WHERE user_id = 1 AND source = 'strava'
      ORDER BY started_at DESC 
      LIMIT 10
    `).all();

    // Get activity count from Strava
    const activityCount = db.prepare(`
      SELECT COUNT(*) as count FROM activities WHERE source = 'strava'
    `).get() as { count: number };

    return NextResponse.json({
      connection,
      syncLogs,
      activityCount: activityCount.count,
    });

  } catch (error) {
    console.error('Get Strava sync status error:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
