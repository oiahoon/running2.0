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

export interface RouteFingerprint {
  pointCount: number
  distanceKm: number
  directness: number
  loopScore: number
  compactness: number
  complexity: number
  turnDensity: number
  aspectRatio: number
  shapeLabel: 'Loop' | 'Wander' | 'Out-and-back' | 'Point-to-point' | 'Glyph'
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
const EARTH_RADIUS_KM = 6371

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

export function calculateRouteFingerprint(route?: RouteData | null): RouteFingerprint | null {
  const points = samplePoints(resolveRoutePoints(route), 500)
  if (points.length < 2) return null

  let routeDistanceKm = 0
  let turnSum = 0
  let turnCount = 0

  for (let index = 1; index < points.length; index += 1) {
    routeDistanceKm += distanceBetweenPoints(points[index - 1], points[index])
  }

  for (let index = 2; index < points.length; index += 1) {
    const bearingA = bearingBetweenPoints(points[index - 2], points[index - 1])
    const bearingB = bearingBetweenPoints(points[index - 1], points[index])
    const delta = Math.abs(shortestAngleDelta(bearingA, bearingB))
    if (Number.isFinite(delta)) {
      turnSum += delta
      turnCount += 1
    }
  }

  const startToEndKm = distanceBetweenPoints(points[0], points[points.length - 1])
  const minLat = Math.min(...points.map((point) => point.lat))
  const maxLat = Math.max(...points.map((point) => point.lat))
  const minLng = Math.min(...points.map((point) => point.lng))
  const maxLng = Math.max(...points.map((point) => point.lng))
  const bboxDiagonalKm = distanceBetweenPoints({ lat: minLat, lng: minLng }, { lat: maxLat, lng: maxLng })
  const latRange = Math.max(maxLat - minLat, MIN_ROUTE_RANGE)
  const lngRange = Math.max(maxLng - minLng, MIN_ROUTE_RANGE)
  const directness = clamp01(startToEndKm / Math.max(routeDistanceKm, 0.001))
  const loopScore = clamp01(1 - startToEndKm / Math.max(routeDistanceKm * 0.35, 0.001))
  const compactness = clamp01(1 - bboxDiagonalKm / Math.max(routeDistanceKm, 0.001))
  const averageTurn = turnCount > 0 ? turnSum / turnCount : 0
  const turnDensity = clamp01(turnSum / Math.max(routeDistanceKm * 360, 1))
  const complexity = clamp01(averageTurn / 95 + turnDensity * 0.45 + Math.min(points.length / 500, 1) * 0.12)
  const aspectRatio = lngRange / latRange

  return {
    pointCount: points.length,
    distanceKm: routeDistanceKm,
    directness,
    loopScore,
    compactness,
    complexity,
    turnDensity,
    aspectRatio,
    shapeLabel: classifyRouteShape({ directness, loopScore, compactness, complexity, aspectRatio }),
  }
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

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(1, value))
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

function distanceBetweenPoints(a: RoutePoint, b: RoutePoint): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const latA = toRadians(a.lat)
  const latB = toRadians(b.lat)
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(latA) * Math.cos(latB) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

function bearingBetweenPoints(a: RoutePoint, b: RoutePoint): number {
  const latA = toRadians(a.lat)
  const latB = toRadians(b.lat)
  const dLng = toRadians(b.lng - a.lng)
  const y = Math.sin(dLng) * Math.cos(latB)
  const x = Math.cos(latA) * Math.sin(latB) - Math.sin(latA) * Math.cos(latB) * Math.cos(dLng)
  return (toDegrees(Math.atan2(y, x)) + 360) % 360
}

function shortestAngleDelta(a: number, b: number): number {
  return ((b - a + 540) % 360) - 180
}

function classifyRouteShape(input: {
  directness: number
  loopScore: number
  compactness: number
  complexity: number
  aspectRatio: number
}): RouteFingerprint['shapeLabel'] {
  if (input.loopScore > 0.72 && input.complexity > 0.55) return 'Glyph'
  if (input.loopScore > 0.62) return 'Loop'
  if (input.directness < 0.28 && input.complexity > 0.5) return 'Wander'
  if (input.directness < 0.42) return 'Out-and-back'
  return 'Point-to-point'
}
