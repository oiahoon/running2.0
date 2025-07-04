'use client'

import { useActivityStats, useRecentActivities } from '@/lib/hooks/useActivities'
import { useUserInfo } from '@/lib/hooks/useUserInfo'

export default function TestFixesPage() {
  const userInfo = useUserInfo()
  const { data: stats, isLoading: statsLoading, error: statsError } = useActivityStats()
  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useRecentActivities(5)

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Test Fixes Page</h1>
      
      {/* User Info Test */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">User Info Test</h2>
        <div className="flex items-center space-x-4">
          <img 
            src={userInfo.avatar} 
            alt={userInfo.name}
            className="w-16 h-16 rounded-full"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=3b82f6&color=fff`
            }}
          />
          <div>
            <p><strong>Name:</strong> {userInfo.name}</p>
            <p><strong>Username:</strong> @{userInfo.username}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
            <p><strong>Avatar URL:</strong> {userInfo.avatar}</p>
            {userInfo.githubUrl && (
              <p><strong>GitHub:</strong> <a href={userInfo.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">{userInfo.githubUrl}</a></p>
            )}
          </div>
        </div>
      </div>

      {/* Stats API Test */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Stats API Test</h2>
        {statsLoading && <p>Loading stats...</p>}
        {statsError && <p className="text-red-600">Error: {statsError.message}</p>}
        {stats && (
          <div className="space-y-2">
            <p><strong>Total Activities:</strong> {stats.basicStats?.totalActivities || 0}</p>
            <p><strong>Total Distance:</strong> {((stats.basicStats?.totalDistance || 0) / 1000).toFixed(2)} km</p>
            <p><strong>Monthly Stats Count:</strong> {stats.monthlyStats?.length || 0}</p>
            <p><strong>Type Distribution Count:</strong> {stats.typeDistribution?.length || 0}</p>
            <p><strong>Daily Stats Count:</strong> {stats.dailyStats?.length || 0}</p>
            {stats.monthlyStats && stats.monthlyStats.length > 0 && (
              <div>
                <p><strong>Sample Monthly Data:</strong></p>
                <pre className="text-xs bg-gray-100 p-2 rounded">
                  {JSON.stringify(stats.monthlyStats[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Activities API Test */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Activities API Test</h2>
        {activitiesLoading && <p>Loading activities...</p>}
        {activitiesError && <p className="text-red-600">Error: {activitiesError.message}</p>}
        {activities && (
          <div className="space-y-2">
            <p><strong>Recent Activities Count:</strong> {activities.length}</p>
            {activities.length > 0 && (
              <div>
                <p><strong>Sample Activity:</strong></p>
                <pre className="text-xs bg-gray-100 p-2 rounded">
                  {JSON.stringify(activities[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Test */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Navigation Test</h2>
        <div className="space-y-2">
          <p><a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a> - Should show stats and recent activities</p>
          <p><a href="/activities" className="text-blue-600 hover:underline">Activities</a> - Should show activities list (was 404 before)</p>
          <p><a href="/stats" className="text-blue-600 hover:underline">Stats</a> - Should show charts with data</p>
          <p><a href="/map" className="text-blue-600 hover:underline">Map</a> - Should show map</p>
          <p><a href="/sync" className="text-blue-600 hover:underline">Sync</a> - Should show sync page</p>
        </div>
      </div>
    </div>
  )
}
