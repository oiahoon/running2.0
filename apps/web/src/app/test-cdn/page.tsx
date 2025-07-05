'use client'

import { useState, useEffect } from 'react'
import { getStaticMapUrl, checkStaticMapExists } from '@/lib/utils/cdn'

interface LoadTest {
  url: string
  source: string
  loadTime: number
  success: boolean
  size?: number
}

export default function CDNTestPage() {
  const [testResults, setTestResults] = useState<LoadTest[]>([])
  const [testing, setTesting] = useState(false)
  const [sampleActivityIds, setSampleActivityIds] = useState<string[]>([])

  useEffect(() => {
    // Get sample activity IDs from cache stats
    fetch('/api/cache/stats')
      .then(res => res.json())
      .then(data => {
        const ids = data.files?.slice(0, 5).map((f: any) => f.activityId) || []
        setSampleActivityIds(ids)
      })
      .catch(console.error)
  }, [])

  const testLoadSpeed = async (url: string, source: string): Promise<LoadTest> => {
    const startTime = performance.now()
    
    return new Promise((resolve) => {
      const img = new Image()
      
      img.onload = () => {
        const loadTime = performance.now() - startTime
        resolve({
          url,
          source,
          loadTime: Math.round(loadTime),
          success: true,
          size: 0 // Could be calculated if needed
        })
      }
      
      img.onerror = () => {
        const loadTime = performance.now() - startTime
        resolve({
          url,
          source,
          loadTime: Math.round(loadTime),
          success: false
        })
      }
      
      img.src = url
    })
  }

  const runSpeedTest = async () => {
    if (sampleActivityIds.length === 0) {
      alert('No sample activities found. Please ensure you have static maps generated.')
      return
    }

    setTesting(true)
    setTestResults([])
    
    const testActivityId = sampleActivityIds[0]
    const githubUser = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'oiahoon'
    
    const testUrls = [
      {
        url: `/maps/${testActivityId}.png`,
        source: 'Vercel Direct'
      },
      {
        url: `https://cdn.jsdelivr.net/gh/${githubUser}/running2.0@master/apps/web/public/maps/${testActivityId}.png`,
        source: 'jsDelivr CDN'
      },
      {
        url: getStaticMapUrl(testActivityId),
        source: 'Smart CDN (Auto)'
      }
    ]

    const results: LoadTest[] = []
    
    for (const test of testUrls) {
      try {
        console.log(`Testing ${test.source}: ${test.url}`)
        const result = await testLoadSpeed(test.url, test.source)
        results.push(result)
        setTestResults([...results])
        
        // Add delay between tests to avoid overwhelming
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Test failed for ${test.source}:`, error)
        results.push({
          url: test.url,
          source: test.source,
          loadTime: 0,
          success: false
        })
      }
    }
    
    setTesting(false)
  }

  const checkMapAvailability = async () => {
    if (sampleActivityIds.length === 0) return

    console.log('Checking map availability...')
    
    for (const activityId of sampleActivityIds.slice(0, 3)) {
      try {
        const result = await checkStaticMapExists(activityId)
        console.log(`Activity ${activityId}:`, result)
      } catch (error) {
        console.error(`Check failed for ${activityId}:`, error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          CDN Performance Test
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Test Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Sample Activities:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {sampleActivityIds.length} found
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">GitHub User:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'Not configured'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={runSpeedTest}
              disabled={testing || sampleActivityIds.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? 'Testing...' : 'Run Speed Test'}
            </button>
            
            <button
              onClick={checkMapAvailability}
              disabled={sampleActivityIds.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Availability
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Speed Test Results
            </h2>
            
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {result.source}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.success 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {result.success ? '✅ Success' : '❌ Failed'}
                      </span>
                      {result.success && (
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {result.loadTime}ms
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 break-all">
                    {result.url}
                  </div>
                  
                  {result.success && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(100, (result.loadTime / Math.max(...testResults.map(r => r.loadTime))) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {testResults.length > 0 && testResults.some(r => r.success) && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Performance Summary
                </h3>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p>
                    <strong>Fastest:</strong> {
                      testResults
                        .filter(r => r.success)
                        .sort((a, b) => a.loadTime - b.loadTime)[0]?.source
                    } ({
                      Math.min(...testResults.filter(r => r.success).map(r => r.loadTime))
                    }ms)
                  </p>
                  <p className="mt-1">
                    <strong>Recommendation:</strong> {
                      testResults.find(r => r.source.includes('jsDelivr'))?.success
                        ? 'jsDelivr CDN provides good global performance'
                        : 'Consider enabling CDN for better performance'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 mt-6 border border-yellow-200 dark:border-yellow-800">
          <h2 className="text-lg font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
            💡 CDN Optimization Tips
          </h2>
          <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
            <p><strong>jsDelivr CDN:</strong> Free global CDN, good for GitHub-hosted files</p>
            <p><strong>Vercel Direct:</strong> Good for users close to Vercel edge locations</p>
            <p><strong>Smart CDN:</strong> Automatically chooses the best available option</p>
            <p className="mt-3 font-medium">
              🚀 To enable jsDelivr CDN globally, set <code>NEXT_PUBLIC_CDN_PROVIDER=jsdelivr</code> in your environment variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
