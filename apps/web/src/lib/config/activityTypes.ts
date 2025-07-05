// Activity types configuration with environment variable support
export const DEFAULT_ACTIVITY_TYPES = [
  'Run',
  'Hike', 
  'Ride'
] as const

// Get activity types from environment variable or use defaults
export function getDefaultActivityTypes(): string[] {
  if (typeof window !== 'undefined') {
    // Client side - get from window object set by server
    return (window as any).__DEFAULT_ACTIVITY_TYPES__ || DEFAULT_ACTIVITY_TYPES
  }
  
  // Server side - get from environment variable
  const envTypes = process.env.NEXT_PUBLIC_DEFAULT_ACTIVITY_TYPES
  if (envTypes) {
    return envTypes.split(',').map(type => type.trim())
  }
  
  return [...DEFAULT_ACTIVITY_TYPES]
}

// Common activity type mappings (for data normalization)
export const ACTIVITY_TYPE_MAPPINGS = {
  // Running variations
  'Run': 'Run',
  'Running': 'Run',
  'run': 'Run',
  'running': 'Run',
  
  // Hiking variations
  'Hike': 'Hike',
  'Hiking': 'Hike',
  'hike': 'Hike',
  'hiking': 'Hike',
  'Walk': 'Hike', // Map walking to hiking
  'walk': 'Hike',
  'walking': 'Hike',
  
  // Cycling variations
  'Ride': 'Ride',
  'Cycling': 'Ride',
  'Bike': 'Ride',
  'ride': 'Ride',
  'cycling': 'Ride',
  'bike': 'Ride',
  'biking': 'Ride',
  
  // Swimming
  'Swim': 'Swim',
  'Swimming': 'Swim',
  'swim': 'Swim',
  'swimming': 'Swim',
  
  // Other activities
  'WeightTraining': 'WeightTraining',
  'Workout': 'WeightTraining',
  'Gym': 'WeightTraining'
} as const

// Normalize activity type
export function normalizeActivityType(type: string): string {
  return ACTIVITY_TYPE_MAPPINGS[type as keyof typeof ACTIVITY_TYPE_MAPPINGS] || type
}

// Check if activity type should be included in default filters
export function isDefaultActivityType(type: string): boolean {
  const normalizedType = normalizeActivityType(type)
  const defaultTypes = getDefaultActivityTypes()
  return defaultTypes.includes(normalizedType)
}
