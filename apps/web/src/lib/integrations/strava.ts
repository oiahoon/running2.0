// Strava API integration for Running Page 2.0
// Based on original strava_sync.py but modernized with TypeScript

import axios, { AxiosInstance } from 'axios';
import { Activity, ActivityCreateInput, DataSource } from '../database/models/Activity';

// Strava API configuration
const STRAVA_BASE_URL = 'https://www.strava.com/api/v3';
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/token';

// Rate limiting configuration
const RATE_LIMIT = {
  requests: 100, // requests per 15 minutes
  daily: 1000,   // requests per day
  interval: 15 * 60 * 1000, // 15 minutes in milliseconds
};

export interface StravaTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number; // meters
  type: string; // 'Run', 'Ride', etc.
  sport_type: string; // 'Run', 'TrailRun', etc.
  start_date: string; // ISO 8601
  start_date_local: string; // ISO 8601
  timezone: string;
  utc_offset: number;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  start_latlng?: [number, number]; // [lat, lng]
  end_latlng?: [number, number];
  map?: {
    id: string;
    summary_polyline: string;
    resource_state: number;
  };
  average_speed: number; // m/s
  max_speed: number; // m/s
  average_heartrate?: number; // bpm
  max_heartrate?: number; // bpm
  average_cadence?: number;
  calories?: number;
  device_name?: string;
  gear_id?: string;
  description?: string;
  visibility_type: 'everyone' | 'followers_only' | 'only_me';
  workout_type?: number;
  trainer?: boolean;
  commute?: boolean;
  manual?: boolean;
  private?: boolean;
  flagged?: boolean;
}

export interface StravaAthlete {
  id: number;
  username?: string;
  firstname: string;
  lastname: string;
  city?: string;
  state?: string;
  country?: string;
  profile?: string;
  created_at: string;
  updated_at: string;
}

export class StravaIntegration {
  private client: AxiosInstance;
  private tokens: StravaTokens | null = null;
  private rateLimitRemaining = RATE_LIMIT.requests;
  private rateLimitReset = Date.now() + RATE_LIMIT.interval;

  constructor(
    private clientId: string,
    private clientSecret: string,
    tokens?: StravaTokens
  ) {
    this.client = axios.create({
      baseURL: STRAVA_BASE_URL,
      timeout: 30000,
    });

    if (tokens) {
      this.tokens = tokens;
      this.setAuthHeader(tokens.accessToken);
    }

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(async (config) => {
      await this.checkRateLimit();
      return config;
    });

    // Add response interceptor for rate limit tracking
    this.client.interceptors.response.use(
      (response) => {
        // Update rate limit info from headers
        const remaining = response.headers['x-ratelimit-limit'];
        const usage = response.headers['x-ratelimit-usage'];
        
        if (remaining) {
          this.rateLimitRemaining = parseInt(remaining);
        }
        
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired, need to refresh
          console.log('Strava token expired, refreshing...');
          return this.refreshTokenAndRetry(error.config);
        }
        throw error;
      }
    );
  }

  // OAuth 2.0 Authorization URL
  getAuthorizationUrl(redirectUri: string, scopes: string[] = ['read', 'activity:read_all']): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(','),
      approval_prompt: 'force',
    });

    return `https://www.strava.com/oauth/authorize?${params.toString()}`;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<StravaTokens> {
    try {
      const response = await axios.post(STRAVA_AUTH_URL, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      });

      const tokens: StravaTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: response.data.expires_at,
      };

      this.tokens = tokens;
      this.setAuthHeader(tokens.accessToken);

      return tokens;
    } catch (error) {
      console.error('Failed to exchange code for tokens:', error);
      throw new Error('Failed to authenticate with Strava');
    }
  }

  // Refresh access token
  async refreshTokens(): Promise<StravaTokens> {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(STRAVA_AUTH_URL, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.tokens.refreshToken,
        grant_type: 'refresh_token',
      });

      const newTokens: StravaTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: response.data.expires_at,
      };

      this.tokens = newTokens;
      this.setAuthHeader(newTokens.accessToken);

      return newTokens;
    } catch (error) {
      console.error('Failed to refresh tokens:', error);
      throw new Error('Failed to refresh Strava tokens');
    }
  }

  // Get authenticated athlete
  async getAthlete(): Promise<StravaAthlete> {
    const response = await this.client.get('/athlete');
    return response.data;
  }

  // Get activities with pagination
  async getActivities(
    page = 1,
    perPage = 30,
    after?: Date,
    before?: Date
  ): Promise<StravaActivity[]> {
    const params: any = {
      page,
      per_page: Math.min(perPage, 200), // Strava max is 200
    };

    if (after) {
      params.after = Math.floor(after.getTime() / 1000);
    }

    if (before) {
      params.before = Math.floor(before.getTime() / 1000);
    }

    const response = await this.client.get('/athlete/activities', { params });
    return response.data;
  }

  // Get all activities (with automatic pagination)
  async getAllActivities(after?: Date, before?: Date): Promise<StravaActivity[]> {
    const allActivities: StravaActivity[] = [];
    let page = 1;
    const perPage = 200; // Maximum allowed by Strava

    while (true) {
      console.log(`Fetching Strava activities page ${page}...`);
      
      const activities = await this.getActivities(page, perPage, after, before);
      
      if (activities.length === 0) {
        break; // No more activities
      }

      allActivities.push(...activities);
      
      if (activities.length < perPage) {
        break; // Last page
      }

      page++;
      
      // Add delay to respect rate limits
      await this.delay(1000);
    }

    console.log(`Fetched ${allActivities.length} activities from Strava`);
    return allActivities;
  }

  // Get detailed activity
  async getActivity(id: number): Promise<StravaActivity> {
    const response = await this.client.get(`/activities/${id}`);
    return response.data;
  }

  // Convert Strava activity to our Activity model
  convertToActivity(stravaActivity: StravaActivity): ActivityCreateInput {
    return {
      externalId: stravaActivity.id.toString(),
      source: 'strava' as DataSource,
      name: stravaActivity.name,
      description: stravaActivity.description,
      type: this.mapActivityType(stravaActivity.type),
      sportType: stravaActivity.sport_type,
      startDate: new Date(stravaActivity.start_date),
      startDateLocal: new Date(stravaActivity.start_date_local),
      distance: stravaActivity.distance,
      movingTime: stravaActivity.moving_time,
      elapsedTime: stravaActivity.elapsed_time,
      averageSpeed: stravaActivity.average_speed,
      averageHeartrate: stravaActivity.average_heartrate,
      locationCountry: stravaActivity.location_country,
      summaryPolyline: stravaActivity.map?.summary_polyline,
      rawData: stravaActivity,
    };
  }

  // Private helper methods
  private setAuthHeader(accessToken: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  private async checkRateLimit() {
    if (Date.now() > this.rateLimitReset) {
      // Reset rate limit
      this.rateLimitRemaining = RATE_LIMIT.requests;
      this.rateLimitReset = Date.now() + RATE_LIMIT.interval;
    }

    if (this.rateLimitRemaining <= 1) {
      const waitTime = this.rateLimitReset - Date.now();
      console.log(`Rate limit reached, waiting ${Math.ceil(waitTime / 1000)}s...`);
      await this.delay(waitTime);
    }

    this.rateLimitRemaining--;
  }

  private async refreshTokenAndRetry(originalRequest: any) {
    try {
      await this.refreshTokens();
      originalRequest.headers['Authorization'] = `Bearer ${this.tokens?.accessToken}`;
      return this.client.request(originalRequest);
    } catch (error) {
      throw new Error('Failed to refresh token and retry request');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private mapActivityType(stravaType: string): string {
    const typeMap: Record<string, string> = {
      'Run': 'Run',
      'TrailRun': 'Run',
      'Treadmill': 'Run',
      'VirtualRun': 'Run',
      'Walk': 'Walk',
      'Hike': 'Hike',
      'Ride': 'Ride',
      'MountainBikeRide': 'Ride',
      'RoadBike': 'Ride',
      'Swim': 'Swim',
      'Workout': 'CrossTraining',
      'WeightTraining': 'WeightTraining',
      'Yoga': 'Yoga',
    };

    return typeMap[stravaType] || 'Other';
  }
}

// Factory function for creating Strava integration
export function createStravaIntegration(
  clientId: string,
  clientSecret: string,
  tokens?: StravaTokens
): StravaIntegration {
  return new StravaIntegration(clientId, clientSecret, tokens);
}
