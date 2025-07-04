'use client'

import { useState } from 'react'

interface MapControlsProps {
  mapStyle: string
  onMapStyleChange: (style: string) => void
  showHeatmap: boolean
  onHeatmapToggle: (show: boolean) => void
  showClusters: boolean
  onClustersToggle: (show: boolean) => void
  activityTypes: string[]
  selectedTypes: string[]
  onTypesChange: (types: string[]) => void
}

const MAP_STYLES = [
  { id: 'streets', name: 'Streets', icon: '🗺️' },
  { id: 'satellite', name: 'Satellite', icon: '🛰️' },
  { id: 'outdoors', name: 'Outdoors', icon: '🏔️' },
  { id: 'dark', name: 'Dark', icon: '🌙' },
  { id: 'light', name: 'Light', icon: '☀️' },
]

export default function MapControls({
  mapStyle,
  onMapStyleChange,
  showHeatmap,
  onHeatmapToggle,
  showClusters,
  onClustersToggle,
  activityTypes,
  selectedTypes,
  onTypesChange,
}: MapControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type))
    } else {
      onTypesChange([...selectedTypes, type])
    }
  }

  const handleSelectAll = () => {
    onTypesChange(activityTypes)
  }

  const handleSelectNone = () => {
    onTypesChange([])
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Map Controls
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <svg
              className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden'}`}>
          {/* Map Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Map Style
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {MAP_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => onMapStyleChange(style.id)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                    mapStyle === style.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <span className="text-lg mb-1">{style.icon}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{style.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* View Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              View Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => onHeatmapToggle(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  🔥 Show Heatmap
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showClusters}
                  onChange={(e) => onClustersToggle(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  📍 Cluster Markers
                </span>
              </label>
            </div>
          </div>

          {/* Activity Types Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Activity Types
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-500"
                >
                  All
                </button>
                <button
                  onClick={handleSelectNone}
                  className="text-xs text-gray-500 hover:text-gray-400"
                >
                  None
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {activityTypes.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {getActivityIcon(type)} {type}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions (Always Visible) */}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => window.location.reload()} // Temporary - will be replaced with proper fit bounds
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            🎯 Center Map
          </button>
          <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            📤 Export
          </button>
        </div>
      </div>
    </div>
  )
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    Run: '🏃',
    Walk: '🚶',
    Ride: '🚴',
    Swim: '🏊',
    Hike: '🥾',
    WeightTraining: '🏋️',
    Yoga: '🧘',
    Other: '⚡',
  }
  return icons[type] || '⚡'
}
