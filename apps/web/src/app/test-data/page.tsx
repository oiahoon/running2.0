'use client'

import { useEffect, useState } from 'react'

export default function TestDataPage() {
  const [stats, setStats] = useState<any>(null)
  const [activities, setActivities] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Test stats API
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        console.log('Stats data:', data)
        setStats(data)
      })
      .catch(err => {
        console.error('Stats error:', err)
        setError('Failed to fetch stats: ' + err.message)
      })

    // Test activities API
    fetch('/api/activities')
      .then(res => res.json())
      .then(data => {
        console.log('Activities data:', data)
        setActivities(data)
      })
      .catch(err => {
        console.error('Activities error:', err)
        setError('Failed to fetch activities: ' + err.message)
      })
  }, [])

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Data Test Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Stats API Response</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {stats ? JSON.stringify(stats, null, 2) : 'Loading...'}
          </pre>
        </div>

        {/* Activities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Activities API Response</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {activities ? JSON.stringify(activities, null, 2) : 'Loading...'}
          </pre>
        </div>
      </div>

      {/* Database Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.basicStats?.totalActivities || 0}
              </div>
              <div className="text-sm text-gray-600">Total Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.basicStats?.totalDistance ? Math.round(stats.basicStats.totalDistance / 1000) : 0} km
              </div>
              <div className="text-sm text-gray-600">Total Distance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.typeDistribution?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Activity Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.dailyStats?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Days with Data</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
