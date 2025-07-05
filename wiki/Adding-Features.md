# Adding Features Guide 🚀

Learn how to extend your Running Page 2.0 with custom features, new data sources, and enhanced functionality.

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Architecture Overview](#architecture-overview)
- [Adding New Pages](#adding-new-pages)
- [Creating Custom Components](#creating-custom-components)
- [Extending Data Models](#extending-data-models)
- [Adding API Endpoints](#adding-api-endpoints)
- [Integrating New Data Sources](#integrating-new-data-sources)
- [Custom Visualizations](#custom-visualizations)
- [Example Projects](#example-projects)

## Development Setup

### Local Environment

1. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/running2.0.git
   cd running2.0/apps/web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

### Development Tools

**Recommended VS Code Extensions**:
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- Auto Rename Tag

**Useful Commands**:
```bash
npm run type-check    # TypeScript validation
npm run lint         # Code linting
npm run build        # Production build test
```

## Architecture Overview

### Project Structure

```
apps/web/src/
├── app/                    # Next.js App Router
│   ├── (pages)/           # Page routes
│   ├── api/               # API endpoints
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── charts/           # Chart components
│   ├── maps/             # Map components
│   └── layout/           # Layout components
├── lib/                  # Utilities and logic
│   ├── database/         # Database models and queries
│   ├── utils/            # Helper functions
│   └── hooks/            # Custom React hooks
└── types/                # TypeScript type definitions
```

### Key Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety and better DX
- **Tailwind CSS**: Utility-first styling
- **SQLite**: Local database storage
- **Recharts**: Chart and visualization library

## Adding New Pages

### Basic Page Structure

Create a new page in `src/app/`:

```typescript
// src/app/training-log/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Training Log - Running Page',
  description: 'Detailed training log and workout analysis',
}

export default function TrainingLogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Training Log</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyPlan />
        <WorkoutHistory />
      </div>
    </div>
  )
}
```

### Dynamic Routes

Create dynamic pages with parameters:

```typescript
// src/app/activity/[id]/page.tsx
interface ActivityPageProps {
  params: { id: string }
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  const activity = await getActivity(params.id)
  
  if (!activity) {
    return <div>Activity not found</div>
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ActivityDetail activity={activity} />
      <ActivityMap activity={activity} />
      <ActivityStats activity={activity} />
    </div>
  )
}
```

### Navigation Integration

Add to main navigation:

```typescript
// src/components/layout/Navigation.tsx
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Activities', href: '/activities' },
  { name: 'Statistics', href: '/stats' },
  { name: 'Training Log', href: '/training-log' }, // New page
  { name: 'Goals', href: '/goals' },              // New page
]
```

## Creating Custom Components

### Component Template

```typescript
// src/components/training/WeeklyPlan.tsx
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface WeeklyPlanProps {
  userId?: string
  weekStart?: Date
}

export function WeeklyPlan({ userId, weekStart = new Date() }: WeeklyPlanProps) {
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadWeeklyPlan()
  }, [weekStart])
  
  const loadWeeklyPlan = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/training/plan?week=${weekStart.toISOString()}`)
      const data = await response.json()
      setPlan(data)
    } catch (error) {
      console.error('Failed to load training plan:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return <div className="animate-pulse">Loading plan...</div>
  }
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Weekly Training Plan</h2>
      
      <div className="space-y-3">
        {plan?.workouts.map((workout, index) => (
          <WorkoutCard key={index} workout={workout} />
        ))}
      </div>
      
      <Button onClick={loadWeeklyPlan} className="mt-4">
        Refresh Plan
      </Button>
    </Card>
  )
}
```

### Reusable UI Components

```typescript
// src/components/ui/MetricCard.tsx
interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  className?: string
}

export function MetricCard({ 
  title, 
  value, 
  unit, 
  trend, 
  icon, 
  className 
}: MetricCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  }
  
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      <div className="flex items-baseline">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
      </div>
      
      {trend && (
        <div className={`text-xs mt-1 ${trendColors[trend]}`}>
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} vs last period
        </div>
      )}
    </div>
  )
}
```

## Extending Data Models

### Database Schema Extension

Add new tables to your database:

```sql
-- Add to your database migration
CREATE TABLE training_plans (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workouts (
  id INTEGER PRIMARY KEY,
  plan_id INTEGER,
  activity_id INTEGER,
  scheduled_date TEXT NOT NULL,
  workout_type TEXT NOT NULL,
  target_distance REAL,
  target_duration INTEGER,
  target_pace REAL,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (plan_id) REFERENCES training_plans(id),
  FOREIGN KEY (activity_id) REFERENCES activities(id)
);
```

### TypeScript Types

```typescript
// src/types/training.ts
export interface TrainingPlan {
  id: number
  userId: number
  name: string
  description?: string
  startDate: Date
  endDate?: Date
  workouts: Workout[]
  createdAt: Date
  updatedAt: Date
}

export interface Workout {
  id: number
  planId?: number
  activityId?: number
  scheduledDate: Date
  workoutType: WorkoutType
  targetDistance?: number
  targetDuration?: number
  targetPace?: number
  notes?: string
  completed: boolean
}

export type WorkoutType = 
  | 'easy_run'
  | 'tempo_run'
  | 'interval_training'
  | 'long_run'
  | 'recovery_run'
  | 'race'
  | 'cross_training'
  | 'rest'
```

### Data Repository

```typescript
// src/lib/database/repositories/TrainingRepository.ts
import { getDatabase } from '../connection'
import { TrainingPlan, Workout } from '@/types/training'

export class TrainingRepository {
  private db = getDatabase()
  
  async getTrainingPlan(id: number): Promise<TrainingPlan | null> {
    const plan = this.db.prepare(`
      SELECT * FROM training_plans WHERE id = ?
    `).get(id) as any
    
    if (!plan) return null
    
    const workouts = this.db.prepare(`
      SELECT * FROM workouts WHERE plan_id = ? ORDER BY scheduled_date
    `).all(id) as any[]
    
    return {
      ...plan,
      startDate: new Date(plan.start_date),
      endDate: plan.end_date ? new Date(plan.end_date) : undefined,
      createdAt: new Date(plan.created_at),
      updatedAt: new Date(plan.updated_at),
      workouts: workouts.map(this.mapWorkout)
    }
  }
  
  async createTrainingPlan(plan: Omit<TrainingPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<TrainingPlan> {
    const now = new Date().toISOString()
    
    const result = this.db.prepare(`
      INSERT INTO training_plans (
        user_id, name, description, start_date, end_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      plan.userId,
      plan.name,
      plan.description,
      plan.startDate.toISOString(),
      plan.endDate?.toISOString(),
      now,
      now
    )
    
    return this.getTrainingPlan(result.lastInsertRowid as number)!
  }
  
  private mapWorkout(row: any): Workout {
    return {
      ...row,
      scheduledDate: new Date(row.scheduled_date),
      completed: Boolean(row.completed)
    }
  }
}
```

## Adding API Endpoints

### REST API Endpoints

```typescript
// src/app/api/training/plans/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { TrainingRepository } from '@/lib/database/repositories/TrainingRepository'

const trainingRepo = new TrainingRepository()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const plans = await trainingRepo.getUserTrainingPlans(parseInt(userId))
    
    return NextResponse.json({
      plans,
      total: plans.length
    })
  } catch (error) {
    console.error('Error fetching training plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch training plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.startDate) {
      return NextResponse.json(
        { error: 'Name and start date are required' },
        { status: 400 }
      )
    }
    
    const plan = await trainingRepo.createTrainingPlan({
      userId: body.userId || 1,
      name: body.name,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      workouts: []
    })
    
    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Error creating training plan:', error)
    return NextResponse.json(
      { error: 'Failed to create training plan' },
      { status: 500 }
    )
  }
}
```

### Dynamic API Routes

```typescript
// src/app/api/training/plans/[id]/route.ts
interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const planId = parseInt(params.id)
    const plan = await trainingRepo.getTrainingPlan(planId)
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Training plan not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(plan)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch training plan' },
      { status: 500 }
    )
  }
}
```

## Integrating New Data Sources

### Garmin Connect Integration

```typescript
// src/lib/integrations/garmin.ts
export class GarminConnectIntegration {
  private baseUrl = 'https://connect.garmin.com/modern/proxy'
  private session: string | null = null
  
  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/gauth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          embed: false,
          lt: 'e1s1'
        })
      })
      
      if (response.ok) {
        this.session = response.headers.get('set-cookie')
        return true
      }
      
      return false
    } catch (error) {
      console.error('Garmin authentication failed:', error)
      return false
    }
  }
  
  async getActivities(limit = 20): Promise<any[]> {
    if (!this.session) {
      throw new Error('Not authenticated')
    }
    
    const response = await fetch(
      `${this.baseUrl}/activitylist-service/activities/search/activities?limit=${limit}`,
      {
        headers: {
          'Cookie': this.session
        }
      }
    )
    
    const data = await response.json()
    return data.map(this.transformActivity)
  }
  
  private transformActivity(garminActivity: any): Activity {
    return {
      id: 0, // Will be set by database
      externalId: garminActivity.activityId.toString(),
      source: 'garmin',
      name: garminActivity.activityName,
      type: this.mapActivityType(garminActivity.activityTypeDTO.typeKey),
      startDate: new Date(garminActivity.startTimeLocal),
      distance: garminActivity.distance,
      movingTime: garminActivity.duration,
      // ... map other fields
    }
  }
}
```

### GPX File Import

```typescript
// src/lib/importers/gpx.ts
import { parseString } from 'xml2js'

export class GPXImporter {
  async importFile(file: File): Promise<Activity[]> {
    const content = await file.text()
    const gpxData = await this.parseGPX(content)
    
    return gpxData.tracks.map(track => this.convertTrackToActivity(track))
  }
  
  private async parseGPX(content: string): Promise<any> {
    return new Promise((resolve, reject) => {
      parseString(content, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })
  }
  
  private convertTrackToActivity(track: any): Activity {
    const points = track.trkseg[0].trkpt
    const startTime = new Date(points[0].time[0])
    const endTime = new Date(points[points.length - 1].time[0])
    
    return {
      id: 0,
      externalId: `gpx-${Date.now()}`,
      source: 'gpx',
      name: track.name?.[0] || 'GPX Import',
      type: 'Run',
      startDate: startTime,
      distance: this.calculateDistance(points),
      movingTime: Math.floor((endTime.getTime() - startTime.getTime()) / 1000),
      // ... calculate other metrics
    }
  }
}
```

## Custom Visualizations

### Advanced Chart Components

```typescript
// src/components/charts/PaceDistributionChart.tsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

interface PaceDistributionProps {
  activities: Activity[]
}

export function PaceDistributionChart({ activities }: PaceDistributionProps) {
  const paceData = useMemo(() => {
    const paceRanges = [
      { min: 0, max: 4, label: '<4:00' },
      { min: 4, max: 5, label: '4:00-5:00' },
      { min: 5, max: 6, label: '5:00-6:00' },
      { min: 6, max: 7, label: '6:00-7:00' },
      { min: 7, max: 8, label: '7:00-8:00' },
      { min: 8, max: Infinity, label: '>8:00' }
    ]
    
    return paceRanges.map(range => {
      const count = activities.filter(activity => {
        const pace = activity.averageSpeed ? 1000 / (activity.averageSpeed * 60) : 0
        return pace >= range.min && pace < range.max
      }).length
      
      return {
        range: range.label,
        count,
        percentage: (count / activities.length) * 100
      }
    })
  }, [activities])
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Pace Distribution</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={paceData}>
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              `${value} runs (${((value as number) / activities.length * 100).toFixed(1)}%)`,
              'Count'
            ]}
          />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### Interactive Map Features

```typescript
// src/components/maps/HeatmapLayer.tsx
import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

interface HeatmapLayerProps {
  map: mapboxgl.Map
  activities: Activity[]
}

export function HeatmapLayer({ map, activities }: HeatmapLayerProps) {
  const layerAdded = useRef(false)
  
  useEffect(() => {
    if (!map || layerAdded.current) return
    
    // Create GeoJSON from activities
    const geojson = {
      type: 'FeatureCollection',
      features: activities
        .filter(a => a.startLatitude && a.startLongitude)
        .map(activity => ({
          type: 'Feature',
          properties: {
            distance: activity.distance,
            pace: activity.averageSpeed
          },
          geometry: {
            type: 'Point',
            coordinates: [activity.startLongitude!, activity.startLatitude!]
          }
        }))
    }
    
    // Add heatmap layer
    map.addSource('activities-heatmap', {
      type: 'geojson',
      data: geojson
    })
    
    map.addLayer({
      id: 'activities-heatmap',
      type: 'heatmap',
      source: 'activities-heatmap',
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'distance'],
          0, 0,
          10000, 1
        ],
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          15, 3
        ],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(33,102,172,0)',
          0.2, 'rgb(103,169,207)',
          0.4, 'rgb(209,229,240)',
          0.6, 'rgb(253,219,199)',
          0.8, 'rgb(239,138,98)',
          1, 'rgb(178,24,43)'
        ]
      }
    })
    
    layerAdded.current = true
  }, [map, activities])
  
  return null
}
```

## Example Projects

### 1. Training Plan Generator

**Features**:
- AI-powered plan generation
- Goal-based training schedules
- Progress tracking
- Workout reminders

**Implementation**:
```typescript
// Generate training plan based on goals
const generateTrainingPlan = async (goal: TrainingGoal) => {
  const plan = await openai.createCompletion({
    model: "gpt-3.5-turbo",
    messages: [{
      role: "system",
      content: "You are a running coach. Generate a training plan."
    }, {
      role: "user", 
      content: `Create a ${goal.weeks}-week plan for a ${goal.distance} ${goal.event}`
    }]
  })
  
  return parseTrainingPlan(plan.data.choices[0].message.content)
}
```

### 2. Social Features

**Features**:
- Activity sharing
- Friend connections
- Group challenges
- Leaderboards

**Implementation**:
```typescript
// Share activity to social feed
const shareActivity = async (activityId: number, message: string) => {
  await fetch('/api/social/share', {
    method: 'POST',
    body: JSON.stringify({
      activityId,
      message,
      visibility: 'friends'
    })
  })
}
```

### 3. Advanced Analytics

**Features**:
- Performance predictions
- Injury risk analysis
- Training load monitoring
- Race time predictions

**Implementation**:
```typescript
// Calculate training stress score
const calculateTSS = (activity: Activity) => {
  const normalizedPower = activity.averagePower || estimatePower(activity)
  const functionalThreshold = getUserFTP()
  const intensityFactor = normalizedPower / functionalThreshold
  
  return (activity.movingTime * normalizedPower * intensityFactor) / (functionalThreshold * 3600) * 100
}
```

## 🚀 Start Building!

Your Running Page 2.0 is designed to be extended. Start with:

1. **Small additions** - New metrics or visualizations
2. **Custom pages** - Training logs, goals, achievements
3. **Data integrations** - New fitness platforms
4. **Advanced features** - AI coaching, social features
5. **Share back** - Contribute to the community!

---

**Remember**: Every feature starts with a single line of code. Build what motivates your running journey! 🏃‍♂️💻**
