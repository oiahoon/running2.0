// Activity configuration for tracking and display preferences

export interface ActivityConfig {
  type: string
  displayName: string
  icon: string
  color: string
  showOnMap: boolean
  showTrack: boolean
  category: 'cardio' | 'strength' | 'outdoor' | 'indoor' | 'other'
}

export const ACTIVITY_CONFIGS: Record<string, ActivityConfig> = {
  'Run': {
    type: 'Run',
    displayName: 'Running',
    icon: '🏃‍♂️',
    color: '#ef4444', // red-500
    showOnMap: true,
    showTrack: true,
    category: 'cardio'
  },
  'Walk': {
    type: 'Walk',
    displayName: 'Walking',
    icon: '🚶‍♂️',
    color: '#10b981', // emerald-500
    showOnMap: true,
    showTrack: true,
    category: 'cardio'
  },
  'Hike': {
    type: 'Hike',
    displayName: 'Hiking',
    icon: '🥾',
    color: '#f59e0b', // amber-500
    showOnMap: true,
    showTrack: true,
    category: 'outdoor'
  },
  'Ride': {
    type: 'Ride',
    displayName: 'Cycling',
    icon: '🚴‍♂️',
    color: '#3b82f6', // blue-500
    showOnMap: true,
    showTrack: true,
    category: 'cardio'
  },
  'Swim': {
    type: 'Swim',
    displayName: 'Swimming',
    icon: '🏊‍♂️',
    color: '#06b6d4', // cyan-500
    showOnMap: false,
    showTrack: false,
    category: 'cardio'
  },
  'WeightTraining': {
    type: 'WeightTraining',
    displayName: 'Weight Training',
    icon: '🏋️‍♂️',
    color: '#8b5cf6', // violet-500
    showOnMap: false,
    showTrack: false,
    category: 'strength'
  },
  'Yoga': {
    type: 'Yoga',
    displayName: 'Yoga',
    icon: '🧘‍♀️',
    color: '#ec4899', // pink-500
    showOnMap: false,
    showTrack: false,
    category: 'indoor'
  },
  'Workout': {
    type: 'Workout',
    displayName: 'Workout',
    icon: '💪',
    color: '#f97316', // orange-500
    showOnMap: false,
    showTrack: false,
    category: 'strength'
  }
}

// Get activities that should show on map
export function getMapEnabledActivityTypes(): string[] {
  return Object.values(ACTIVITY_CONFIGS)
    .filter(config => config.showOnMap)
    .map(config => config.type)
}

// Get activities that should show track/route
export function getTrackEnabledActivityTypes(): string[] {
  return Object.values(ACTIVITY_CONFIGS)
    .filter(config => config.showTrack)
    .map(config => config.type)
}

// Get activity configuration
export function getActivityConfig(type: string): ActivityConfig {
  return ACTIVITY_CONFIGS[type] || {
    type,
    displayName: type,
    icon: '🏃‍♂️',
    color: '#6b7280', // gray-500
    showOnMap: false,
    showTrack: false,
    category: 'other'
  }
}

// Get activity color
export function getActivityColor(type: string): string {
  return getActivityConfig(type).color
}

// Get activity icon
export function getActivityIcon(type: string): string {
  return getActivityConfig(type).icon
}

// Check if activity should show on map
export function shouldShowOnMap(type: string): boolean {
  return getActivityConfig(type).showOnMap
}

// Check if activity should show track
export function shouldShowTrack(type: string): boolean {
  return getActivityConfig(type).showTrack
}

// Default activity types for filtering
export const DEFAULT_MAP_ACTIVITY_TYPES = getMapEnabledActivityTypes()
export const DEFAULT_TRACK_ACTIVITY_TYPES = getTrackEnabledActivityTypes()
