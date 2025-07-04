# Running Page 2.0 - UI Wireframes & Specifications

## 📱 Page Layout Structure

### 1. Dashboard/Home Page

```
┌─────────────────────────────────────────────────────────────┐
│ Header Navigation                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Total Stats   │  │  This Year      │  │  This Month │ │
│  │                 │  │                 │  │             │ │
│  │  🏃 1,234 km    │  │  🏃 456 km      │  │  🏃 89 km   │ │
│  │  ⏱️ 123h 45m    │  │  ⏱️ 45h 30m     │  │  ⏱️ 8h 15m  │ │
│  │  📊 156 runs    │  │  📊 67 runs     │  │  📊 12 runs │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Interactive Map                          │ │
│  │                                                         │ │
│  │  [Map with running routes, heat map overlay]            │ │
│  │                                                         │ │
│  │  Controls: [Year Filter] [Activity Type] [View Mode]   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────────────────────────┐ │
│  │  Recent Runs    │  │        Activity Chart               │ │
│  │                 │  │                                     │ │
│  │  • Run 1        │  │  [Distance/Pace/Heart Rate Chart]   │ │
│  │  • Run 2        │  │                                     │ │
│  │  • Run 3        │  │                                     │ │
│  │  • Run 4        │  │                                     │ │
│  │  • Run 5        │  │                                     │ │
│  │                 │  │                                     │ │
│  │  [View All]     │  │  [Time Period Selector]            │ │
│  └─────────────────┘  └─────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Statistics Page

```
┌─────────────────────────────────────────────────────────────┐
│ Header Navigation                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Year Selector & Filters                   │ │
│  │  [2024 ▼] [All Activities ▼] [Distance ▼] [Export]    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Distance       │  │  Time           │  │  Pace       │ │
│  │                 │  │                 │  │             │ │
│  │  📊 Bar Chart   │  │  📊 Line Chart  │  │  📊 Scatter │ │
│  │                 │  │                 │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Calendar Heatmap                        │ │
│  │                                                         │ │
│  │  Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov │ │
│  │  ████ ████ ████ ████ ████ ████ ████ ████ ████ ████ ████ │ │
│  │  ████ ████ ████ ████ ████ ████ ████ ████ ████ ████ ████ │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────────────────────────┐ │
│  │  Achievements   │  │        Personal Records            │ │
│  │                 │  │                                     │ │
│  │  🏆 Marathon    │  │  Longest Run: 42.2 km              │ │
│  │  🏆 100km Month │  │  Fastest 5K: 22:30                 │ │
│  │  🏆 Consistency │  │  Best Month: 156 km (Mar 2024)     │ │
│  │  🏆 Early Bird  │  │  Total Elevation: 12,345 m         │ │
│  │                 │  │                                     │ │
│  └─────────────────┘  └─────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Activities List Page

```
┌─────────────────────────────────────────────────────────────┐
│ Header Navigation                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Search & Filters                                       │ │
│  │  [🔍 Search] [Date Range] [Activity Type] [Distance]   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Activity Item                                           │ │
│  │ ┌─────┐ Morning Run                    Dec 15, 2024    │ │
│  │ │ MAP │ 🏃 5.2 km • ⏱️ 28:45 • 📈 5:32/km • ❤️ 145   │ │
│  │ │IMAGE│ 📍 Central Park, New York                      │ │
│  │ └─────┘ [View Details] [Edit] [Share]                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Activity Item                                           │ │
│  │ ┌─────┐ Evening Run                    Dec 14, 2024    │ │
│  │ │ MAP │ 🏃 8.1 km • ⏱️ 45:20 • 📈 5:35/km • ❤️ 152   │ │
│  │ │IMAGE│ 📍 Brooklyn Bridge, New York                   │ │
│  │ └─────┘ [View Details] [Edit] [Share]                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  [Load More Activities]                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4. Activity Detail Page

```
┌─────────────────────────────────────────────────────────────┐
│ Header Navigation                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Activity Header                          │ │
│  │  Morning Run • Dec 15, 2024 • 7:30 AM                 │ │
│  │  📍 Central Park, New York                             │ │
│  │  [Edit] [Share] [Export GPX]                           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  Route Map                             │ │
│  │                                                         │ │
│  │  [Interactive map with route, start/end markers]       │ │
│  │                                                         │ │
│  │  [Satellite] [Terrain] [Street] [3D View]             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Distance       │  │  Time           │  │  Avg Pace   │ │
│  │  5.2 km         │  │  28:45          │  │  5:32/km    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Elevation      │  │  Heart Rate     │  │  Calories   │ │
│  │  +125m          │  │  145 bpm        │  │  312 kcal   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  Performance Charts                    │ │
│  │                                                         │ │
│  │  [Pace Chart] [Heart Rate] [Elevation Profile]        │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Lap Analysis                        │ │
│  │  Lap 1: 1.0 km • 5:30/km • 142 bpm                   │ │
│  │  Lap 2: 1.0 km • 5:28/km • 145 bpm                   │ │
│  │  Lap 3: 1.0 km • 5:35/km • 148 bpm                   │ │
│  │  ...                                                   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Component Specifications

### 1. Statistics Cards

```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  color?: 'primary' | 'success' | 'warning' | 'error';
}

// Example Usage:
<StatsCard
  title="Total Distance"
  value={1234.5}
  unit="km"
  icon={<RunningIcon />}
  trend={{ value: 12.5, direction: 'up', period: 'vs last month' }}
  color="success"
/>
```

### 2. Interactive Map Component

```typescript
interface MapComponentProps {
  activities: Activity[];
  selectedActivity?: Activity;
  viewMode: 'routes' | 'heatmap' | 'clusters';
  filters: {
    year?: number;
    activityType?: string[];
    dateRange?: [Date, Date];
  };
  onActivitySelect: (activity: Activity) => void;
  onViewModeChange: (mode: string) => void;
}
```

### 3. Activity Chart Component

```typescript
interface ActivityChartProps {
  data: ChartData[];
  type: 'distance' | 'pace' | 'heartRate' | 'elevation';
  timeRange: 'week' | 'month' | 'year' | 'all';
  showTrend?: boolean;
  interactive?: boolean;
  height?: number;
}
```

### 4. Calendar Heatmap

```typescript
interface CalendarHeatmapProps {
  data: DailyActivity[];
  year: number;
  metric: 'distance' | 'time' | 'activities';
  colorScale: string[];
  onDateClick: (date: Date, data: DailyActivity) => void;
}
```

## 📱 Responsive Behavior

### Mobile Layout (< 768px)
- Stack cards vertically
- Collapse navigation to hamburger menu
- Full-width map with overlay controls
- Simplified chart views
- Touch-optimized interactions

### Tablet Layout (768px - 1024px)
- 2-column card layout
- Side navigation drawer
- Larger map with side panel
- Enhanced chart interactions

### Desktop Layout (> 1024px)
- Multi-column layouts
- Persistent navigation
- Large interactive map
- Full-featured charts and tables
- Keyboard shortcuts support

## 🎯 Interaction Patterns

### Map Interactions
- **Click**: Select activity/route
- **Hover**: Show activity preview
- **Zoom**: Mouse wheel or pinch
- **Pan**: Click and drag
- **Filter**: Control panel overlay

### Chart Interactions
- **Hover**: Show data point details
- **Click**: Drill down to specific period
- **Brush**: Select time range
- **Legend**: Toggle data series

### List Interactions
- **Infinite Scroll**: Load more activities
- **Search**: Real-time filtering
- **Sort**: Multiple sort options
- **Quick Actions**: Swipe gestures on mobile

## 🎨 Visual Hierarchy

### Information Architecture
1. **Primary**: Key metrics and main map
2. **Secondary**: Charts and recent activities
3. **Tertiary**: Detailed statistics and settings
4. **Utility**: Navigation and actions

### Typography Hierarchy
- **Display**: Page titles (3xl, bold)
- **Heading**: Section titles (xl, semibold)
- **Subheading**: Card titles (lg, medium)
- **Body**: Regular content (base, normal)
- **Caption**: Metadata (sm, normal)
- **Label**: Form labels (sm, medium)

This comprehensive wireframe and specification document provides a clear blueprint for implementing the Running Page 2.0 user interface with modern design principles and enhanced user experience.
