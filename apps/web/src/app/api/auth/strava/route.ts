// Strava OAuth authentication routes
import { NextRequest, NextResponse } from 'next/server';
import { createStravaIntegration } from '@/lib/integrations/strava';

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID!;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/api/auth/strava/callback';

// GET /api/auth/strava - Redirect to Strava authorization
export async function GET(request: NextRequest) {
  try {
    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Strava credentials not configured' },
        { status: 500 }
      );
    }

    const strava = createStravaIntegration(STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET);
    const authUrl = strava.getAuthorizationUrl(REDIRECT_URI, ['read', 'activity:read_all']);

    return NextResponse.redirect(authUrl);
    
  } catch (error) {
    console.error('Strava auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Strava authentication' },
      { status: 500 }
    );
  }
}
