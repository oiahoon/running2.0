'use client'

import { useState, useEffect } from 'react'
import { checkStaticMapExists } from '@/lib/utils/cdn'

export default function TestStaticMapsPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [testing, setTesting] = useState(false)
  const [sampleActivityIds, setSampleActivityIds] = useState<string[]>([])

  useEffect(() => {
    // Get sample activity IDs that actually have map files
    fetch('/api/activities?limit=50')
      .then(res => res.json())
      .then(data => {
        const activities = data.activities || []
        
        // Get a mix of activities and check which ones might have maps
        const candidateIds = activities
          .filter((a: any) => a.externalId && a.startLatitude && a.startLongitude)
          .map((a: any) => a.externalId.toString())
          .slice(0, 20)
        
        console.log('Candidate activity IDs:', candidateIds)
        
        // For testing, also include some known map file IDs
        const knownMapIds = [
          '10112609318', '10112609334', '10112609476', 
          '10129673832', '10155964048'
        ]
        
        // Combine and deduplicate
        const testIds = [...new Set([...knownMapIds, ...candidateIds.slice(0, 5)])]
        
        setSampleActivityIds(testIds.slice(0, 8))
        console.log('Final test activity IDs:', testIds.slice(0, 8))
      })
      .catch(console.error)
  }, [])

  const testStaticMaps = async () => {
    if (sampleActivityIds.length === 0) {
      alert('No sample activities found')
      return
    }

    setTesting(true)
    setTestResults([])
    
    const results = []
    
    for (const activityId of sampleActivityIds) {
      console.log(`Testing static map for activity ${activityId}`)
      
      try {
        const startTime = performance.now()
        const result = await checkStaticMapExists(activityId)
        const duration = Math.round(performance.now() - startTime)
        
        results.push({
          activityId,
          ...result,
          duration,
          success: true
        })
        
        console.log(`Activity ${activityId}:`, result)
      } catch (error) {
        results.push({
          activityId,
          exists: false,
          url: 'N/A',
          source: 'error',
          duration: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        console.error(`Activity ${activityId} failed:`, error)
      }
      
      setTestResults([...results])
      
      // Add small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setTesting(false)
  }

  const testKnownMaps = async () => {
    const knownMapIds = [
      '10112609318', '10112609334', '10112609476', 
      '10129673832', '10155964048'
    ]
    
    console.log('Testing known existing map files...')
    setTesting(true)
    setTestResults([])
    
    const results = []
    
    for (const activityId of knownMapIds) {
      console.log(`Testing known map for activity ${activityId}`)
      
      try {
        const startTime = performance.now()
        const result = await checkStaticMapExists(activityId)
        const duration = Math.round(performance.now() - startTime)
        
        results.push({
          activityId,
          ...result,
          duration,
          success: true
        })
        
        console.log(`Known map ${activityId}:`, result)
      } catch (error) {
        results.push({
          activityId,
          exists: false,
          url: 'N/A',
          source: 'error',
          duration: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        console.error(`Known map ${activityId} failed:`, error)
      }
      
      setTestResults([...results])
      
      // Add small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setTesting(false)
  }

  const testDirectUrls = async () => {
    if (sampleActivityIds.length === 0) return

    const activityId = sampleActivityIds[0]
    const githubUser = 'oiahoon'
    
    const testUrls = [
      {
        name: 'jsDelivr CDN',
        url: `https://cdn.jsdelivr.net/gh/${githubUser}/running2.0@master/apps/web/public/maps/${activityId}.png`
      },
      {
        name: 'Local/Vercel',
        url: `/maps/${activityId}.png`
      },
      {
        name: 'Direct GitHub Raw',
        url: `https://raw.githubusercontent.com/${githubUser}/running2.0/master/apps/web/public/maps/${activityId}.png`
      }
    ]

    console.log('Testing direct URLs:')
    
    for (const test of testUrls) {
      try {
        console.log(`Testing ${test.name}: ${test.url}`)
        const response = await fetch(test.url, { method: 'HEAD' })
        console.log(`${test.name}: ${response.status} ${response.statusText}`)
        
        // Also try to load as image
        const img = new Image()
        img.onload = () => console.log(`✅ ${test.name} image loaded successfully`)
        img.onerror = () => console.log(`❌ ${test.name} image failed to load`)
        img.src = test.url
        
      } catch (error) {
        console.error(`${test.name} failed:`, error)
      }
    }
  }

  const checkServerFiles = async () => {
    if (sampleActivityIds.length === 0) return

    console.log('Checking server-side file existence...')
    
    // Check maps directory
    try {
      const response = await fetch('/api/check-maps', { method: 'POST' })
      const data = await response.json()
      console.log('Maps directory info:', data)
    } catch (error) {
      console.error('Failed to check maps directory:', error)
    }
    
    // Check specific files
    for (const activityId of sampleActivityIds.slice(0, 3)) {
      try {
        const response = await fetch(`/api/check-maps?activityId=${activityId}`)
        const data = await response.json()
        console.log(`Server check for ${activityId}:`, data)
      } catch (error) {
        console.error(`Server check failed for ${activityId}:`, error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Static Maps Availability Test
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Test Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Sample Activities:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {sampleActivityIds.length} found
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">CDN Provider:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {process.env.NEXT_PUBLIC_CDN_PROVIDER || 'jsdelivr (default)'}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 mb-4">
            <p><strong>Activity IDs to test:</strong></p>
            <p className="font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
              {sampleActivityIds.join(', ') || 'Loading...'}
            </p>
          </div>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={testStaticMaps}
              disabled={testing || sampleActivityIds.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? 'Testing...' : 'Test Static Maps'}
            </button>
            
            <button
              onClick={testKnownMaps}
              disabled={testing}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Known Maps
            </button>
            
            <button
              onClick={testDirectUrls}
              disabled={sampleActivityIds.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Direct URLs
            </button>
            
            <button
              onClick={checkServerFiles}
              disabled={sampleActivityIds.length === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Server Files
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Test Results
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left p-2">Activity ID</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Source</th>
                    <th className="text-left p-2">Duration</th>
                    <th className="text-left p-2">URL</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="p-2 font-mono">{result.activityId}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.exists 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {result.exists ? '✅ Found' : '❌ Not Found'}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.source === 'cdn' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : result.source === 'local'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {result.source}
                        </span>
                      </td>
                      <td className="p-2">{result.duration}ms</td>
                      <td className="p-2 text-xs break-all max-w-xs">
                        {result.url}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Analysis
              </h3>
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p><strong>Total Tests:</strong> {testResults.length}</p>
                <p><strong>Found:</strong> {testResults.filter(r => r.exists).length}</p>
                <p><strong>CDN Hits:</strong> {testResults.filter(r => r.source === 'cdn').length}</p>
                <p><strong>Local Hits:</strong> {testResults.filter(r => r.source === 'local').length}</p>
                <p><strong>Not Found:</strong> {testResults.filter(r => !r.exists).length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
