// Activity data model for Running Page 2.0
// Enhanced from original schema with modern TypeScript types

export type ActivityType = 
  | 'Run' 
  | 'Walk' 
  | 'Ride' 
  | 'Swim' 
  | 'Hike'
  | 'WeightTraining'
  | 'Yoga'
  | 'CrossTraining'
  | 'Other';

export type SportType = 
  | 'TrailRun'
  | 'RoadRun'
  | 'Treadmill'
  | 'VirtualRun'
  | 'RoadBike'
  | 'MountainBike'
  | 'IndoorBike'
  | 'OpenWaterSwim'
  | 'PoolSwim';

export type DataSource = 
  | 'strava'
  | 'garmin'
  | 'nike'
  | 'keep'
  | 'codoon'
  | 'joyrun'
  | 'manual'
  | 'gpx'
  | 'tcx'
  | 'fit';

export type Visibility = 'public' | 'private' | 'followers';

export interface HeartRateZones {
  zone1?: number; // Active recovery
  zone2?: number; // Aerobic base
  zone3?: number; // Aerobic
  zone4?: number; // Lactate threshold
  zone5?: number; // Anaerobic
}

export interface WeatherData {
  temperature?: number; // Celsius
  humidity?: number; // Percentage
  windSpeed?: number; // m/s
  windDirection?: number; // Degrees
  conditions?: string; // 'sunny', 'cloudy', 'rain', etc.
  visibility?: number; // km
}

export interface PrivacyZone {
  latitude: number;
  longitude: number;
  radius: number; // meters
  name?: string;
}

export interface Activity {
  // Primary keys
  id: number;
  externalId?: string;
  userId: number;
  source: DataSource;

  // Basic info
  name: string;
  description?: string;
  type: ActivityType;
  sportType?: SportType;

  // Time and date
  startDate: Date;
  startDateLocal: Date;
  timezone?: string;

  // Distance and duration
  distance?: number; // meters
  movingTime?: number; // seconds
  elapsedTime?: number; // seconds
  totalElevationGain?: number; // meters

  // Performance metrics
  averageSpeed?: number; // m/s
  maxSpeed?: number; // m/s
  averagePace?: number; // seconds per km
  bestPace?: number; // seconds per km

  // Heart rate
  averageHeartrate?: number; // bpm
  maxHeartrate?: number; // bpm
  heartrateZones?: HeartRateZones;

  // Location
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;

  // Route data
  summaryPolyline?: string;
  detailedPolyline?: string;
  mapId?: string;

  // Additional metrics
  calories?: number;
  averageCadence?: number; // steps/min for running
  averagePower?: number; // watts
  weightedAveragePower?: number;
  trainingStressScore?: number;

  // Weather
  weather?: WeatherData;

  // Privacy
  visibility: Visibility;
  privacyZones?: PrivacyZone[];

  // Metadata
  gearId?: string;
  deviceName?: string;
  rawData?: Record<string, any>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  syncedAt: Date;
}

export interface ActivitySegment {
  id: number;
  activityId: number;
  segmentType: 'lap' | 'split' | 'climb' | 'interval';
  sequenceNumber: number;

  // Metrics
  distance?: number;
  movingTime?: number;
  elapsedTime?: number;
  averageSpeed?: number;
  maxSpeed?: number;
  averageHeartrate?: number;
  maxHeartrate?: number;
  totalElevationGain?: number;

  // Boundaries
  startIndex?: number;
  endIndex?: number;

  createdAt: Date;
}

export interface ActivityDataPoint {
  id: number;
  activityId: number;

  // Time and position
  timestamp: Date;
  elapsedTime: number; // seconds from start
  latitude?: number;
  longitude?: number;
  altitude?: number; // meters

  // Performance
  distance?: number; // cumulative meters
  speed?: number; // m/s
  heartrate?: number; // bpm
  cadence?: number; // steps/min or rpm
  power?: number; // watts
  temperature?: number; // celsius

  // Movement
  grade?: number; // percentage
  bearing?: number; // degrees

  createdAt: Date;
}

// Utility types for API responses
export interface ActivitySummary {
  totalDistance: number;
  totalTime: number;
  totalActivities: number;
  averagePace: number;
  averageDistance: number;
  longestRun: number;
  fastestPace: number;
  totalElevationGain: number;
  totalCalories: number;
}

export interface ActivityFilters {
  type?: ActivityType[];
  source?: DataSource[];
  startDate?: Date;
  endDate?: Date;
  minDistance?: number;
  maxDistance?: number;
  minDuration?: number;
  maxDuration?: number;
  search?: string;
}

export interface ActivityCreateInput {
  externalId?: string;
  source: DataSource;
  name: string;
  description?: string;
  type: ActivityType;
  sportType?: SportType;
  startDate: Date;
  startDateLocal: Date;
  distance?: number;
  movingTime?: number;
  elapsedTime?: number;
  summaryPolyline?: string;
  averageSpeed?: number;
  averageHeartrate?: number;
  locationCountry?: string;
  rawData?: Record<string, any>;
}

export interface ActivityUpdateInput {
  name?: string;
  description?: string;
  type?: ActivityType;
  visibility?: Visibility;
  privacyZones?: PrivacyZone[];
}

// Helper functions
export function formatDistance(meters?: number): string {
  if (!meters) return '0 km';
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function formatPace(metersPerSecond?: number): string {
  if (!metersPerSecond || metersPerSecond === 0) return '--:--/km';
  const secondsPerKm = 1000 / metersPerSecond;
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
}

export function calculatePace(distance?: number, time?: number): number | undefined {
  if (!distance || !time || distance === 0) return undefined;
  return time / (distance / 1000); // seconds per km
}

export function getActivityIcon(type: ActivityType): string {
  const icons: Record<ActivityType, string> = {
    Run: '🏃',
    Walk: '🚶',
    Ride: '🚴',
    Swim: '🏊',
    Hike: '🥾',
    WeightTraining: '🏋️',
    Yoga: '🧘',
    CrossTraining: '💪',
    Other: '⚡',
  };
  return icons[type] || '⚡';
}

export function getActivityColor(type: ActivityType): string {
  const colors: Record<ActivityType, string> = {
    Run: 'green',
    Walk: 'blue',
    Ride: 'purple',
    Swim: 'cyan',
    Hike: 'orange',
    WeightTraining: 'red',
    Yoga: 'pink',
    CrossTraining: 'yellow',
    Other: 'gray',
  };
  return colors[type] || 'gray';
}
