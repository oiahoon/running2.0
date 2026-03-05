# Visualization Libraries & Implementation Guide

## 📊 Library Selection Strategy

### Core Visualization Stack

#### 1. Maps - Mapbox GL JS 3.x
**Why Mapbox:**
- Industry-standard for web mapping
- Excellent performance with large datasets
- Rich styling and customization options
- WebGL-based rendering
- Strong React integration

**Implementation:**
```typescript
// packages/ui/src/components/Map/MapComponent.tsx
import mapboxgl from 'mapbox-gl';
import { useRef, useEffect } from 'react';

interface MapComponentProps {
  activities: Activity[];
  style?: string;
  onActivitySelect?: (activity: Activity) => void;
}

export const MapComponent = ({ activities, style = 'dark-v11' }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${style}`,
      center: [-74.5, 40],
      zoom: 9,
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    });

    // Add activity routes
    activities.forEach(activity => {
      if (activity.polyline) {
        addRouteToMap(map.current!, activity);
      }
    });

    return () => map.current?.remove();
  }, [activities, style]);

  return <div ref={mapContainer} className="w-full h-full" />;
};
```

**Features to Implement:**
- Route visualization with polylines
- Heatmap overlays
- Clustering for dense data
- 3D terrain visualization
- Custom markers and popups
- Animation and transitions

#### 2. Charts - Recharts + D3.js
**Why This Combination:**
- **Recharts**: React-native, declarative, easy to use
- **D3.js**: Powerful for custom visualizations
- Complementary strengths

**Recharts for Standard Charts:**
```typescript
// packages/ui/src/components/Charts/DistanceChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DistanceChartProps {
  data: ChartDataPoint[];
  timeRange: 'week' | 'month' | 'year';
}

export const DistanceChart = ({ data, timeRange }: DistanceChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="date" 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <YAxis 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="distance" 
          stroke="#22C55E" 
          strokeWidth={2}
          dot={{ fill: '#22C55E', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#22C55E', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

**D3.js for Custom Visualizations:**
```typescript
// packages/ui/src/components/Charts/CalendarHeatmap.tsx
import * as d3 from 'd3';
import { useRef, useEffect } from 'react';

interface CalendarHeatmapProps {
  data: DailyActivity[];
  year: number;
  width?: number;
  height?: number;
}

export const CalendarHeatmap = ({ data, year, width = 800, height = 200 }: CalendarHeatmapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Calendar heatmap implementation
    const cellSize = 15;
    const yearData = d3.timeDays(new Date(year, 0, 1), new Date(year + 1, 0, 1));
    
    const colorScale = d3.scaleSequential(d3.interpolateGreens)
      .domain([0, d3.max(data, d => d.distance) || 0]);

    const cells = svg.selectAll('.day')
      .data(yearData)
      .enter().append('rect')
      .attr('class', 'day')
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('x', d => d3.timeWeek.count(d3.timeYear(d), d) * cellSize)
      .attr('y', d => d.getDay() * cellSize)
      .attr('fill', d => {
        const dayData = data.find(item => 
          item.date.toDateString() === d.toDateString()
        );
        return dayData ? colorScale(dayData.distance) : '#1F2937';
      })
      .attr('stroke', '#374151')
      .attr('stroke-width', 1);

    // Add tooltips
    cells.append('title')
      .text(d => {
        const dayData = data.find(item => 
          item.date.toDateString() === d.toDateString()
        );
        return `${d.toDateString()}: ${dayData?.distance || 0} km`;
      });

  }, [data, year, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
};
```

#### 3. 3D Visualization - Three.js (Optional)
**For Advanced Features:**
```typescript
// packages/ui/src/components/3D/Route3D.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

interface Route3DProps {
  routeData: RoutePoint[];
  elevationScale?: number;
}

export const Route3D = ({ routeData, elevationScale = 0.001 }: Route3DProps) => {
  return (
    <Canvas camera={{ position: [0, 5, 10] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <RouteGeometry points={routeData} elevationScale={elevationScale} />
      <OrbitControls />
    </Canvas>
  );
};
```

## 📈 Chart Types & Use Cases

### 1. Time Series Charts (Recharts)
```typescript
// Distance over time
<LineChart data={distanceData}>
  <Line dataKey="distance" stroke="#22C55E" />
</LineChart>

// Pace analysis
<AreaChart data={paceData}>
  <Area dataKey="pace" fill="#0EA5E9" />
</AreaChart>

// Heart rate zones
<BarChart data={heartRateZones}>
  <Bar dataKey="zone1" fill="#22C55E" />
  <Bar dataKey="zone2" fill="#F59E0B" />
  <Bar dataKey="zone3" fill="#EF4444" />
</BarChart>
```

### 2. Statistical Charts (Recharts)
```typescript
// Monthly summary
<ComposedChart data={monthlyData}>
  <Bar dataKey="distance" fill="#22C55E" />
  <Line dataKey="avgPace" stroke="#0EA5E9" />
</ComposedChart>

// Activity distribution
<PieChart>
  <Pie data={activityTypes} dataKey="count" />
</PieChart>

// Performance scatter
<ScatterChart data={performanceData}>
  <Scatter dataKey="pace" fill="#22C55E" />
</ScatterChart>
```

### 3. Custom Visualizations (D3.js)
```typescript
// Calendar heatmap
const CalendarHeatmap = () => {
  // D3 implementation for GitHub-style calendar
};

// Radial progress charts
const RadialProgress = () => {
  // D3 arc charts for goals and achievements
};

// Geographic heatmaps
const GeoHeatmap = () => {
  // D3 + Mapbox integration for density maps
};
```

## 🗺️ Map Visualization Features

### 1. Route Rendering
```typescript
// Add polyline to map
const addRouteToMap = (map: mapboxgl.Map, activity: Activity) => {
  const coordinates = decodePolyline(activity.polyline);
  
  map.addSource(`route-${activity.id}`, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {
        id: activity.id,
        distance: activity.distance,
        pace: activity.pace
      },
      geometry: {
        type: 'LineString',
        coordinates
      }
    }
  });

  map.addLayer({
    id: `route-${activity.id}`,
    type: 'line',
    source: `route-${activity.id}`,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#22C55E',
      'line-width': 3,
      'line-opacity': 0.8
    }
  });
};
```

### 2. Heatmap Overlay
```typescript
// Add heatmap layer
const addHeatmapLayer = (map: mapboxgl.Map, activities: Activity[]) => {
  const points = activities.flatMap(activity => 
    decodePolyline(activity.polyline).map(coord => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coord
      },
      properties: {
        weight: 1
      }
    }))
  );

  map.addSource('heatmap-data', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: points
    }
  });

  map.addLayer({
    id: 'heatmap',
    type: 'heatmap',
    source: 'heatmap-data',
    paint: {
      'heatmap-weight': 1,
      'heatmap-intensity': 1,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0,0,255,0)',
        0.2, 'rgb(0,255,255)',
        0.4, 'rgb(0,255,0)',
        0.6, 'rgb(255,255,0)',
        0.8, 'rgb(255,0,0)',
        1, 'rgb(255,0,255)'
      ],
      'heatmap-radius': 20
    }
  });
};
```

### 3. Clustering
```typescript
// Add clustering for dense data
const addClusterLayer = (map: mapboxgl.Map, activities: Activity[]) => {
  map.addSource('activities', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: activities.map(activity => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [activity.startLng, activity.startLat]
        },
        properties: {
          id: activity.id,
          distance: activity.distance
        }
      }))
    },
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50
  });

  // Cluster circles
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'activities',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#22C55E',
        100, '#F59E0B',
        750, '#EF4444'
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20, 100, 30, 750, 40
      ]
    }
  });
};
```

## 🎨 Animation & Interactions

### 1. Chart Animations (Framer Motion)
```typescript
import { motion } from 'framer-motion';

const AnimatedChart = ({ data }: { data: ChartData[] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <LineChart data={data}>
        {/* Chart content */}
      </LineChart>
    </motion.div>
  );
};
```

### 2. Map Animations
```typescript
// Animate route drawing
const animateRoute = (map: mapboxgl.Map, coordinates: number[][]) => {
  let step = 0;
  const animationDuration = 2000;
  const steps = coordinates.length;
  
  const animate = () => {
    if (step < steps) {
      const currentCoords = coordinates.slice(0, step);
      
      map.getSource('animated-route').setData({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: currentCoords
        }
      });
      
      step++;
      setTimeout(animate, animationDuration / steps);
    }
  };
  
  animate();
};
```

### 3. Interactive Tooltips
```typescript
// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-lg"
      >
        <p className="text-neutral-100 font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </motion.div>
    );
  }
  return null;
};
```

## 📱 Responsive Visualization

### 1. Responsive Charts
```typescript
const ResponsiveChart = ({ data }: { data: ChartData[] }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  const isMobile = dimensions.width < 768;
  
  return (
    <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
      <LineChart data={data}>
        {/* Responsive configuration */}
      </LineChart>
    </ResponsiveContainer>
  );
};
```

### 2. Mobile-Optimized Maps
```typescript
const MobileMap = ({ activities }: { activities: Activity[] }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className={`relative ${isMobile ? 'h-64' : 'h-96'}`}>
      <MapComponent 
        activities={activities}
        controls={isMobile ? 'minimal' : 'full'}
        gestures={isMobile ? 'touch' : 'all'}
      />
    </div>
  );
};
```

This comprehensive visualization strategy provides a solid foundation for creating engaging, interactive, and performant data visualizations in Running Page 2.0.
