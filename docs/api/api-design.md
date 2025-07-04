# Running Page 2.0 - API Design

## 🎯 API Architecture Overview

### Design Principles
- **RESTful**: Follow REST conventions for predictable endpoints
- **Type-Safe**: Full TypeScript integration with runtime validation
- **Performance**: Efficient data fetching with caching strategies
- **Scalable**: Designed to handle growing data volumes
- **Backward Compatible**: Maintain compatibility with existing data

### Technology Stack
- **Framework**: Next.js 14 API Routes (App Router)
- **Validation**: Zod for runtime type checking
- **Database**: SQLite (existing) with potential PostgreSQL migration
- **Caching**: Redis for production, in-memory for development
- **Authentication**: Optional JWT for future features

## 📊 Data Models

### Core Types
```typescript
// packages/types/src/activity.ts
export interface Activity {
  id: number;
  name: string;
  distance: number; // in meters
  movingTime: number; // in seconds
  elapsedTime: number; // in seconds
  type: ActivityType;
  startDate: string; // ISO 8601
  startDateLocal: string; // ISO 8601
  locationCountry?: string;
  summaryPolyline?: string;
  averageHeartrate?: number;
  averageSpeed: number; // m/s
  maxSpeed?: number;
  elevationGain?: number;
  calories?: number;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 
  | 'Run' 
  | 'Walk' 
  | 'Ride' 
  | 'Swim' 
  | 'Hike' 
  | 'WeightTraining'
  | 'Yoga'
  | 'Other';

export interface ActivitySummary {
  totalDistance: number;
  totalTime: number;
  totalActivities: number;
  averagePace: number;
  averageDistance: number;
  longestRun: number;
  fastestPace: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  distance: number;
  time: number;
  activities: number;
  averagePace?: number;
}

export interface MonthlyActivity {
  year: number;
  month: number;
  distance: number;
  time: number;
  activities: number;
  averagePace: number;
}
```

### Chart Data Types
```typescript
// packages/types/src/charts.ts
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  data: ChartDataPoint[];
  period: 'day' | 'week' | 'month' | 'year';
  metric: 'distance' | 'time' | 'pace' | 'heartRate';
}

export interface HeatmapData {
  date: string;
  value: number;
  intensity: number; // 0-1
}

export interface GeographicData {
  country: string;
  region?: string;
  city?: string;
  coordinates: [number, number]; // [lng, lat]
  activities: number;
  totalDistance: number;
}
```

## 🛠️ API Endpoints

### Activities API

#### GET /api/activities
**Purpose**: Retrieve paginated list of activities
```typescript
// Query Parameters
interface ActivitiesQuery {
  page?: number;          // Default: 1
  limit?: number;         // Default: 20, Max: 100
  type?: ActivityType[];  // Filter by activity types
  startDate?: string;     // ISO 8601 date
  endDate?: string;       // ISO 8601 date
  minDistance?: number;   // Minimum distance in meters
  maxDistance?: number;   // Maximum distance in meters
  search?: string;        // Search in activity names
  sortBy?: 'date' | 'distance' | 'time' | 'pace';
  sortOrder?: 'asc' | 'desc';
}

// Response
interface ActivitiesResponse {
  activities: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    appliedFilters: Partial<ActivitiesQuery>;
    availableTypes: ActivityType[];
    dateRange: {
      earliest: string;
      latest: string;
    };
  };
}
```

#### GET /api/activities/[id]
**Purpose**: Get detailed activity information
```typescript
interface ActivityDetailResponse {
  activity: Activity;
  route?: {
    polyline: string;
    coordinates: [number, number][]; // Decoded polyline
    elevationProfile?: {
      distance: number;
      elevation: number;
    }[];
  };
  laps?: {
    lapNumber: number;
    distance: number;
    time: number;
    pace: number;
    averageHeartRate?: number;
  }[];
  weather?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    conditions: string;
  };
}
```

### Statistics API

#### GET /api/stats/summary
**Purpose**: Get overall activity summary
```typescript
interface StatsSummaryQuery {
  year?: number;
  month?: number;
  type?: ActivityType[];
}

interface StatsSummaryResponse {
  period: {
    start: string;
    end: string;
    label: string;
  };
  summary: ActivitySummary;
  comparison?: {
    previousPeriod: ActivitySummary;
    percentageChange: {
      distance: number;
      time: number;
      activities: number;
    };
  };
  goals?: {
    distance: {
      target: number;
      current: number;
      percentage: number;
    };
    activities: {
      target: number;
      current: number;
      percentage: number;
    };
  };
}
```

#### GET /api/stats/trends
**Purpose**: Get trend data for charts
```typescript
interface TrendsQuery {
  metric: 'distance' | 'time' | 'pace' | 'activities';
  period: 'week' | 'month' | 'year';
  groupBy: 'day' | 'week' | 'month';
  startDate?: string;
  endDate?: string;
  type?: ActivityType[];
}

interface TrendsResponse {
  data: ChartDataPoint[];
  metadata: {
    metric: string;
    period: string;
    unit: string;
    total: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
    trendPercentage: number;
  };
}
```

#### GET /api/stats/heatmap
**Purpose**: Get calendar heatmap data
```typescript
interface HeatmapQuery {
  year: number;
  metric: 'distance' | 'time' | 'activities';
  type?: ActivityType[];
}

interface HeatmapResponse {
  year: number;
  metric: string;
  data: HeatmapData[];
  statistics: {
    totalDays: number;
    activeDays: number;
    streaks: {
      current: number;
      longest: number;
    };
    averagePerDay: number;
    maxDay: {
      date: string;
      value: number;
    };
  };
}
```

### Geographic API

#### GET /api/geo/summary
**Purpose**: Get geographic distribution of activities
```typescript
interface GeoSummaryResponse {
  countries: GeographicData[];
  regions: GeographicData[];
  cities: GeographicData[];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  heatmapData: {
    coordinates: [number, number];
    weight: number;
  }[];
}
```

#### GET /api/geo/routes
**Purpose**: Get route data for map visualization
```typescript
interface RoutesQuery {
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  zoom?: number;
  cluster?: boolean;
  type?: ActivityType[];
  startDate?: string;
  endDate?: string;
}

interface RoutesResponse {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    geometry: {
      type: 'LineString';
      coordinates: [number, number][];
    };
    properties: {
      id: number;
      name: string;
      distance: number;
      type: ActivityType;
      date: string;
      pace?: number;
      color?: string;
    };
  }[];
  clusters?: {
    coordinates: [number, number];
    count: number;
    activities: number[];
  }[];
}
```

### Data Sync API

#### POST /api/sync/trigger
**Purpose**: Manually trigger data synchronization
```typescript
interface SyncTriggerRequest {
  source: 'strava' | 'garmin' | 'nike' | 'all';
  force?: boolean; // Force full sync
}

interface SyncTriggerResponse {
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  message: string;
  estimatedDuration?: number;
}
```

#### GET /api/sync/status/[jobId]
**Purpose**: Check sync job status
```typescript
interface SyncStatusResponse {
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  result?: {
    newActivities: number;
    updatedActivities: number;
    errors: string[];
  };
  startedAt: string;
  completedAt?: string;
}
```

## 🔧 Implementation Examples

### Next.js API Route Example
```typescript
// apps/web/app/api/activities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getActivities } from '@/lib/database';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: z.array(z.string()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['date', 'distance', 'time', 'pace']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));
    
    const result = await getActivities(query);
    
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Database Layer Example
```typescript
// apps/web/lib/database/activities.ts
import { Database } from 'sqlite3';
import { Activity, ActivitiesQuery, ActivitiesResponse } from '@/types';

export async function getActivities(query: ActivitiesQuery): Promise<ActivitiesResponse> {
  const db = new Database(process.env.DATABASE_PATH);
  
  // Build SQL query with filters
  let sql = 'SELECT * FROM activities WHERE 1=1';
  const params: any[] = [];
  
  if (query.type?.length) {
    sql += ` AND type IN (${query.type.map(() => '?').join(',')})`;
    params.push(...query.type);
  }
  
  if (query.startDate) {
    sql += ' AND start_date >= ?';
    params.push(query.startDate);
  }
  
  if (query.endDate) {
    sql += ' AND start_date <= ?';
    params.push(query.endDate);
  }
  
  if (query.search) {
    sql += ' AND name LIKE ?';
    params.push(`%${query.search}%`);
  }
  
  // Add sorting
  sql += ` ORDER BY ${query.sortBy} ${query.sortOrder}`;
  
  // Add pagination
  const offset = (query.page - 1) * query.limit;
  sql += ' LIMIT ? OFFSET ?';
  params.push(query.limit, offset);
  
  // Execute query
  const activities = await new Promise<Activity[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as Activity[]);
    });
  });
  
  // Get total count for pagination
  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count')
                     .replace(/ORDER BY.*$/, '')
                     .replace(/LIMIT.*$/, '');
  
  const totalCount = await new Promise<number>((resolve, reject) => {
    db.get(countSql, params.slice(0, -2), (err, row: any) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });
  
  db.close();
  
  return {
    activities,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / query.limit),
      hasNext: query.page * query.limit < totalCount,
      hasPrev: query.page > 1,
    },
    filters: {
      appliedFilters: query,
      availableTypes: ['Run', 'Walk', 'Ride'], // Get from DB
      dateRange: {
        earliest: '2020-01-01', // Get from DB
        latest: new Date().toISOString(),
      },
    },
  };
}
```

### React Hook Example
```typescript
// packages/ui/src/hooks/useActivities.ts
import { useQuery } from '@tanstack/react-query';
import { ActivitiesQuery, ActivitiesResponse } from '@/types';

export function useActivities(query: ActivitiesQuery) {
  return useQuery({
    queryKey: ['activities', query],
    queryFn: async (): Promise<ActivitiesResponse> => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
      
      const response = await fetch(`/api/activities?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

## 🚀 Performance Optimizations

### Caching Strategy
- **Browser Cache**: Static assets with long TTL
- **API Cache**: Redis for frequently accessed data
- **Query Cache**: TanStack Query for client-side caching
- **Database Indexes**: Optimize query performance

### Data Loading
- **Pagination**: Limit data transfer
- **Lazy Loading**: Load data on demand
- **Prefetching**: Anticipate user needs
- **Compression**: Gzip/Brotli for API responses

### Error Handling
- **Graceful Degradation**: Fallback for failed requests
- **Retry Logic**: Automatic retry with exponential backoff
- **Error Boundaries**: Prevent app crashes
- **Monitoring**: Track API performance and errors

This comprehensive API design provides a solid foundation for the Running Page 2.0 application with excellent performance, type safety, and scalability.
