// Strava OAuth callback handler
import { NextRequest, NextResponse } from 'next/server';
import { createStravaIntegration } from '@/lib/integrations/strava';
import { getDatabase } from '@/lib/database/connection';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID!;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/api/auth/strava/callback';

// GET /api/auth/strava/callback - Handle OAuth callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Strava OAuth error:', error);
      return NextResponse.redirect(
        new URL('/dashboard?error=strava_auth_denied', request.nextUrl.origin)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard?error=strava_auth_failed', request.nextUrl.origin)
      );
    }

    // Exchange code for tokens
    const strava = createStravaIntegration(STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET);
    const tokens = await strava.exchangeCodeForTokens(code, REDIRECT_URI);

    // Get athlete info
    const athlete = await strava.getAthlete();

    // Save tokens to database
    const db = getDatabase();
    
    const upsertQuery = `
      INSERT INTO data_source_settings (
        user_id, source, access_token, refresh_token, token_expires_at,
        auto_sync, sync_frequency, is_active, connection_status,
        created_at, updated_at
      ) VALUES (1, 'strava', ?, ?, ?, true, 'daily', true, 'connected', ?, ?)
      ON CONFLICT(user_id, source) DO UPDATE SET
        access_token = excluded.access_token,
        refresh_token = excluded.refresh_token,
        token_expires_at = excluded.token_expires_at,
        connection_status = 'connected',
        updated_at = excluded.updated_at
    `;

    const now = new Date().toISOString();
    const expiresAt = new Date(tokens.expiresAt * 1000).toISOString();

    db.prepare(upsertQuery).run(
      tokens.accessToken,
      tokens.refreshToken,
      expiresAt,
      now,
      now
    );

    console.log(`Strava connected for athlete: ${athlete.firstname} ${athlete.lastname}`);

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      new URL('/dashboard?success=strava_connected', request.nextUrl.origin)
    );

  } catch (error) {
    console.error('Strava callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=strava_connection_failed', request.nextUrl.origin)
    );
  }
}
