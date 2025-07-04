'use client'

import { useState } from 'react'

const viewModes = [
  { id: 'routes', name: 'Routes', description: 'Show individual running routes' },
  { id: 'heatmap', name: 'Heatmap', description: 'Show activity density heatmap' },
  { id: 'clusters', name: 'Clusters', description: 'Group nearby activities' },
]

const mapStyles = [
  { id: 'streets', name: 'Streets' },
  { id: 'satellite', name: 'Satellite' },
  { id: 'terrain', name: 'Terrain' },
  { id: 'dark', name: 'Dark' },
]

function MapControls({ 
  selectedView, 
  onViewChange, 
  selectedStyle, 
  onStyleChange 
}: {
  selectedView: string
  onViewChange: (view: string) => void
  selectedStyle: string
  onStyleChange: (style: string) => void
}) {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* View Mode */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              View Mode
            </label>
            <select 
              value={selectedView}
              onChange={(e) => onViewChange(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:text-white"
            >
              {viewModes.map((mode) => (
                <option key={mode.id} value={mode.id}>{mode.name}</option>
              ))}
            </select>
          </div>

          {/* Map Style */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Map Style
            </label>
            <select 
              value={selectedStyle}
              onChange={(e) => onStyleChange(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:text-white"
            >
              {mapStyles.map((style) => (
                <option key={style.id} value={style.id}>{style.name}</option>
              ))}
            </select>
          </div>

          {/* Activity Type Filter */}
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Activity
            </label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:text-white">
              <option>All</option>
              <option>Running</option>
              <option>Walking</option>
              <option>Cycling</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Year
            </label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:text-white">
              <option>2024</option>
              <option>2023</option>
              <option>2022</option>
              <option>All Time</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

function MapContainer({ viewMode, mapStyle }: { viewMode: string, mapStyle: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Interactive Route Map
          </h3>
          <div className="flex space-x-2">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              📍 Center
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              🔍 Zoom Fit
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              📤 Export
            </button>
          </div>
        </div>
        
        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center relative">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Interactive Map Coming Soon
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Your running routes will be displayed here with Mapbox integration
            </p>
            <div className="text-sm text-gray-400 dark:text-gray-500 space-y-1">
              <p>Current Mode: <span className="font-medium">{viewMode}</span></p>
              <p>Map Style: <span className="font-medium">{mapStyle}</span></p>
            </div>
          </div>
          
          {/* Mock route overlay */}
          <div className="absolute inset-4 border-2 border-dashed border-green-400 rounded-lg opacity-30"></div>
          <div className="absolute top-8 left-8 w-4 h-4 bg-green-500 rounded-full"></div>
          <div className="absolute bottom-8 right-8 w-4 h-4 bg-red-500 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

function MapStats() {
  const stats = [
    { name: 'Total Routes', value: '156', icon: '🛤️' },
    { name: 'Unique Locations', value: '23', icon: '📍' },
    { name: 'Countries Visited', value: '3', icon: '🌍' },
    { name: 'Favorite Route', value: 'Central Park Loop', icon: '⭐' },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">{stat.icon}</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function RecentRoutes() {
  const routes = [
    { id: 1, name: 'Morning Central Park Loop', distance: '5.2 km', date: '2024-07-04', color: 'green' },
    { id: 2, name: 'Brooklyn Bridge Run', distance: '3.8 km', date: '2024-07-03', color: 'blue' },
    { id: 3, name: 'Hudson River Trail', distance: '12.1 km', date: '2024-07-02', color: 'purple' },
    { id: 4, name: 'High Line Walk', distance: '2.5 km', date: '2024-07-01', color: 'orange' },
  ]

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Recent Routes
        </h3>
        <div className="space-y-3">
          {routes.map((route) => (
            <div key={route.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full bg-${route.color}-500 mr-3`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {route.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {route.distance} • {route.date}
                  </p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                View on Map
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MapPage() {
  const [selectedView, setSelectedView] = useState('routes')
  const [selectedStyle, setSelectedStyle] = useState('streets')

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Route Map</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Explore your running routes on interactive maps with various visualization modes.
        </p>
      </div>

      {/* Map Controls */}
      <MapControls 
        selectedView={selectedView}
        onViewChange={setSelectedView}
        selectedStyle={selectedStyle}
        onStyleChange={setSelectedStyle}
      />

      {/* Map Stats */}
      <MapStats />

      {/* Main Map Container */}
      <MapContainer viewMode={selectedView} mapStyle={selectedStyle} />

      {/* Recent Routes */}
      <RecentRoutes />

      {/* Feature Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="text-2xl">🚀</div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Coming Soon: Advanced Map Features
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul className="list-disc list-inside space-y-1">
                <li>Interactive Mapbox integration with route visualization</li>
                <li>Heatmap overlays showing activity density</li>
                <li>3D terrain views and elevation profiles</li>
                <li>Route clustering and performance analytics</li>
                <li>Custom map styles and privacy controls</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
