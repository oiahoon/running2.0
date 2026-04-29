'use client'

import { useId } from 'react'
import {
  type EffortInput,
  getEffortColor,
  inferRouteEffort,
  normalizeRoute,
  pointsToPath,
  resolveRoutePoints,
  type RouteData,
  type RouteEffort,
  type RoutePoint,
  samplePoints,
} from '../../lib/routes'

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export interface RouteGlyphProps extends EffortInput {
  route?: RouteData | null
  points?: RoutePoint[]
  encodedPolyline?: string
  ghostRoutes?: Array<RouteData | null | undefined>
  effort?: RouteEffort | string
  color?: string
  width?: number
  height?: number
  padding?: number
  maxPoints?: number
  grid?: boolean
  glow?: boolean
  ghost?: boolean
  showGrid?: boolean
  showGlow?: boolean
  animate?: boolean
  strokeWidth?: number
  className?: string
  pathClassName?: string
  emptyLabel?: string
  showEmptyLabel?: boolean
  title?: string
  label?: string
}

export function RouteGlyph({
  route,
  ghostRoutes = [],
  effort = 'unknown',
  color,
  width = 320,
  height = 220,
  padding = 24,
  maxPoints = 300,
  showGrid = true,
  showGlow = true,
  animate = true,
  strokeWidth = 5,
  className,
  label = 'Route shape',
}: RouteGlyphProps) {
  const points = samplePoints(resolveRoutePoints(route), maxPoints)
  const path = pointsToPath(normalizeRoute(points, width, height, padding))
  const routeColor = color ?? getEffortColor(effort)
  const hasRoute = path.length > 0

  const ghostPaths = ghostRoutes
    .slice(0, 6)
    .map((ghostRoute) => {
      const ghostPoints = samplePoints(resolveRoutePoints(ghostRoute), Math.min(maxPoints, 160))
      return pointsToPath(normalizeRoute(ghostPoints, width, height, padding))
    })
    .filter(Boolean)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={hasRoute ? label : 'No route shape available'}
      className={classNames('block h-full w-full overflow-hidden', className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect width={width} height={height} rx="18" fill="rgba(7,10,12,0.58)" />
      {showGrid ? (
        <g opacity="0.8">
          {Array.from({ length: Math.floor(width / 24) + 1 }, (_, index) => (
            <line key={`vx-${index}`} x1={index * 24} y1={0} x2={index * 24} y2={height} stroke="rgba(139,154,147,0.12)" strokeWidth="1" />
          ))}
          {Array.from({ length: Math.floor(height / 24) + 1 }, (_, index) => (
            <line key={`hy-${index}`} x1={0} y1={index * 24} x2={width} y2={index * 24} stroke="rgba(139,154,147,0.12)" strokeWidth="1" />
          ))}
        </g>
      ) : null}

      {ghostPaths.map((ghostPath, index) => (
        <path
          key={`${ghostPath}-${index}`}
          d={ghostPath}
          fill="none"
          stroke="rgba(139,154,147,0.34)"
          strokeWidth={Math.max(strokeWidth - 1.5, 1.5)}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {hasRoute ? (
        <>
          {showGlow ? (
            <path
              d={path}
              fill="none"
              stroke={routeColor}
              strokeWidth={strokeWidth + 5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.16"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          <path
            d={path}
            fill="none"
            stroke={routeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            vectorEffect="non-scaling-stroke"
            className={animate ? 'route-glyph-path' : undefined}
          />
        </>
      ) : (
        <g>
          <path
            d={`M ${width * 0.22} ${height * 0.58} C ${width * 0.34} ${height * 0.34}, ${width * 0.48} ${height * 0.7}, ${width * 0.62} ${height * 0.46} S ${width * 0.82} ${height * 0.48}, ${width * 0.78} ${height * 0.65}`}
            fill="none"
            stroke="rgba(139,154,147,0.5)"
            strokeDasharray="6 10"
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
          <text
            x={width / 2}
            y={height / 2 + 42}
            textAnchor="middle"
            fill="rgba(238,244,233,0.62)"
            fontSize="13"
            fontWeight="600"
          >
            No route shape
          </text>
        </g>
      )}
    </svg>
  )
}
