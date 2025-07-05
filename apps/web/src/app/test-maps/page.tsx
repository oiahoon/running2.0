'use client'

import { useState, useEffect } from 'react'

export default function TestMapsPage() {
  const [cacheStats, setCacheStats] = useState<any>(null)
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function runTests() {
      try {
        // Get cache statistics
        const cacheResponse = await fetch('/api/cache/stats')
        const cacheData = await cacheResponse.json()
        setCacheStats(cacheData)

        // Test a few random maps
        const testMaps = cacheData.files?.slice(0, 5) || []
        const results = []

        for (const file of testMaps) {
          const activityId = file.activityId
          
          // Test static map availability
          const mapResponse = await fetch(`/api/maps/${activityId}`)
          const mapData = await mapResponse.json()
          
          // Test direct file access
          const fileResponse = await fetch(`/maps/${activityId}.png`, { method: 'HEAD' })
          
          results.push({
            activityId,
            apiCheck: mapData.exists,
            fileAccess: fileResponse.ok,
            fileSize: file.size,
            url: `/maps/${activityId}.png`
          })
        }

        setTestResults(results)
      } catch (error) {
        console.error('Test failed:', error)
      } finally {
        setLoading(false)
      }
    }

    runTests()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Testing Static Maps...</h1>
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Static Map Cache Test Results
        </h1>

        {/* Cache Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            📊 Cache Statistics
          </h2>
          {cacheStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Total Files:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {cacheStats.totalFiles}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Total Size:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {cacheStats.totalSizeMB} MB
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Newest:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {cacheStats.newestFile ? new Date(cacheStats.newestFile).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Oldest:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {cacheStats.oldestFile ? new Date(cacheStats.oldestFile).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Test Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            🧪 Static Map Access Tests
          </h2>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={result.activityId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Activity {result.activityId}
                  </h3>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.apiCheck 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      API: {result.apiCheck ? '✅' : '❌'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.fileAccess 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      File: {result.fileAccess ? '✅' : '❌'}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Size: {(result.fileSize / 1024).toFixed(1)} KB
                </div>

                {/* Display the actual map */}
                {result.fileAccess && (
                  <div className="mt-3">
                    <img 
                      src={result.url} 
                      alt={`Map for activity ${result.activityId}`}
                      className="w-full max-w-md h-48 object-cover rounded border"
                      onLoad={() => console.log(`✅ Static map loaded for ${result.activityId}`)}
                      onError={() => console.log(`❌ Static map failed for ${result.activityId}`)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
            🔍 How to Verify Static Map Usage
          </h2>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>1. Open browser developer tools (F12)</p>
            <p>2. Go to Network tab</p>
            <p>3. Navigate to Dashboard or Activities page</p>
            <p>4. Look for image requests:</p>
            <ul className="ml-4 space-y-1">
              <li>✅ <code>/maps/[activityId].png</code> - Using static cache</li>
              <li>❌ <code>api.mapbox.com/styles/...</code> - Using Mapbox API</li>
            </ul>
            <p>5. Check console for log messages about map loading</p>
          </div>
        </div>
      </div>
    </div>
  )
}
