export type RouteEffort =
  | 'easy'
  | 'steady'
  | 'tempo'
  | 'long'
  | 'hard'
  | 'recovery'
  | 'unknown'

export interface RoutePoint {
  lat: number
  lng: number
  elevationMeters?: number
  timestamp?: string
}

export interface NormalizedRoutePoint {
  x: number
  y: number
}

export interface RouteBoundingBox {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

export interface RouteData {
  encodedPolyline?: string
  points?: RoutePoint[]
  boundingBox?: RouteBoundingBox
}

export interface EffortInput {
  effort?: string
  type?: string
  distanceMeters?: number
  movingTimeSeconds?: number
  averagePaceSecPerKm?: number
  averageSpeedMetersPerSecond?: number
  elevationGainMeters?: number
  averageHeartRate?: number
}

const MIN_ROUTE_RANGE = 0.000001

export const effortColors: Record<RouteEffort, string> = {
  easy: 'var(--route-green, #5DFF9D)',
  recovery: 'var(--route-lime, #B8FF70)',
  steady: 'var(--route-cyan, #58D8FF)',
  tempo: 'var(--route-orange, #FF8946)',
  long: 'var(--route-purple, #AA7DFF)',
  hard: 'var(--route-red, #FF5C5C)',
  unknown: 'var(--route-green, #5DFF9D)',
}

export function isRouteEffort(value?: string): value is RouteEffort {
  return (
    value === 'easy' ||
    value === 'steady' ||
    value === 'tempo' ||
    value === 'long' ||
    value === 'hard' ||
    value === 'recovery' ||
    value === 'unknown'
  )
}

export function normalizeEffort(value?: string): RouteEffort {
  if (!value) return 'unknown'
  const normalized = value.toLowerCase()
  return isRouteEffort(normalized) ? normalized : 'unknown'
}

export function getEffortColor(effort?: string): string {
  return effortColors[normalizeEffort(effort)]
}

export function decodePolyline(encodedPolyline?: string, precision = 5): RoutePoint[] {
  if (!encodedPolyline) return []

  const points: RoutePoint[] = []
  const factor = 10 ** precision
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encodedPolyline.length) {
    const latResult = decodePolylineValue(encodedPolyline, index)
    if (!latResult) return []
    index = latResult.nextIndex
    lat += latResult.value

    const lngResult = decodePolylineValue(encodedPolyline, index)
    if (!lngResult) return []
    index = lngResult.nextIndex
    lng += lngResult.value

    points.push({
      lat: lat / factor,
      lng: lng / factor,
    })
  }

  return points
}

function decodePolylineValue(
  encodedPolyline: string,
  startIndex: number
): { value: number; nextIndex: number } | undefined {
  let result = 0
  let shift = 0
  let index = startIndex
  let byte = 0

  do {
    if (index >= encodedPolyline.length) return undefined
    byte = encodedPolyline.charCodeAt(index) - 63
    if (byte < 0) return undefined
    result |= (byte & 0x1f) << shift
    shift += 5
    index += 1
  } while (byte >= 0x20)

  return {
    value: result & 1 ? ~(result >> 1) : result >> 1,
    nextIndex: index,
  }
}

export function resolveRoutePoints(route?: RouteData | null): RoutePoint[] {
  if (!route) return []

  const points = route.points?.filter(isValidRoutePoint) ?? []
  if (points.length > 0) return points

  return decodePolyline(route.encodedPolyline).filter(isValidRoutePoint)
}

export function normalizeRoute(
  points: RoutePoint[],
  width: number,
  height: number,
  padding: number
): NormalizedRoutePoint[] {
  const validPoints = points.filter(isValidRoutePoint)
  if (validPoints.length === 0 || width <= 0 || height <= 0) return []

  const minLat = Math.min(...validPoints.map((point) => point.lat))
  const maxLat = Math.max(...validPoints.map((point) => point.lat))
  const minLng = Math.min(...validPoints.map((point) => point.lng))
  const maxLng = Math.max(...validPoints.map((point) => point.lng))

  const latRangeRaw = maxLat - minLat
  const lngRangeRaw = maxLng - minLng
  const latRange = Math.max(latRangeRaw, MIN_ROUTE_RANGE)
  const lngRange = Math.max(lngRangeRaw, MIN_ROUTE_RANGE)
  const boundedPadding = Math.max(0, Math.min(padding, width / 2, height / 2))
  const innerW = Math.max(width - boundedPadding * 2, 1)
  const innerH = Math.max(height - boundedPadding * 2, 1)
  const scale = Math.min(innerW / lngRange, innerH / latRange)
  const routeW = lngRange * scale
  const routeH = latRange * scale
  const offsetX = boundedPadding + (innerW - routeW) / 2
  const offsetY = boundedPadding + (innerH - routeH) / 2
  const centerX = width / 2
  const centerY = height / 2

  return validPoints.map((point) => ({
    x:
      lngRangeRaw < MIN_ROUTE_RANGE
        ? centerX
        : offsetX + (point.lng - minLng) * scale,
    y:
      latRangeRaw < MIN_ROUTE_RANGE
        ? centerY
        : offsetY + (maxLat - point.lat) * scale,
  }))
}

export function pointsToPath(points: NormalizedRoutePoint[]): string {
  if (points.length === 0) return ''

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')
}

export function samplePoints<T>(points: T[], maxPoints = 300): T[] {
  if (maxPoints <= 0) return []
  if (points.length <= maxPoints) return points
  if (maxPoints === 1) return [points[0]]

  const sampled: T[] = []
  const lastIndex = points.length - 1

  for (let index = 0; index < maxPoints; index += 1) {
    const sourceIndex = Math.round((index / (maxPoints - 1)) * lastIndex)
    sampled.push(points[sourceIndex])
  }

  return sampled
}

export function inferRouteEffort(input: EffortInput): RouteEffort {
  const explicitEffort = normalizeEffort(input.effort)
  if (explicitEffort !== 'unknown') return explicitEffort

  const type = input.type?.toLowerCase()
  if (type && !type.includes('run') && type !== 'walk' && type !== 'hike') return 'unknown'

  const distanceKm = input.distanceMeters ? input.distanceMeters / 1000 : undefined
  const paceSecPerKm =
    input.averagePaceSecPerKm ??
    (input.averageSpeedMetersPerSecond && input.averageSpeedMetersPerSecond > 0
      ? 1000 / input.averageSpeedMetersPerSecond
      : undefined) ??
    (distanceKm && input.movingTimeSeconds ? input.movingTimeSeconds / distanceKm : undefined)

  if (distanceKm && distanceKm >= 15) return 'long'
  if (input.averageHeartRate && input.averageHeartRate >= 170) return 'hard'
  if (input.elevationGainMeters && distanceKm && input.elevationGainMeters / distanceKm >= 35) return 'hard'
  if (!paceSecPerKm) {
    if (distanceKm && distanceKm < 3) return 'recovery'
    return 'unknown'
  }

  if (paceSecPerKm <= 270) return 'hard'
  if (paceSecPerKm <= 330) return 'tempo'
  if (paceSecPerKm <= 390) return 'steady'
  if (paceSecPerKm >= 450) return 'recovery'
  return 'easy'
}

function isValidRoutePoint(point: RoutePoint): boolean {
  return Number.isFinite(point.lat) && Number.isFinite(point.lng)
}
