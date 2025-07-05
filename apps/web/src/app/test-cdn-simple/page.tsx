'use client'

import { useState, useEffect } from 'react'

export default function SimpleCDNTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testCDN = async () => {
    setLoading(true)
    setTestResult('')
    
    const activityId = '15002226211' // Use the activity ID you mentioned
    const githubUser = 'oiahoon'
    
    // Test URLs
    const urls = [
      {
        name: 'jsDelivr CDN',
        url: `https://cdn.jsdelivr.net/gh/${githubUser}/running2.0@master/apps/web/public/maps/${activityId}.png`
      },
      {
        name: 'Local/Vercel',
        url: `/maps/${activityId}.png`
      }
    ]
    
    let results = []
    
    for (const test of urls) {
      const startTime = performance.now()
      try {
        const response = await fetch(test.url, { method: 'HEAD' })
        const loadTime = Math.round(performance.now() - startTime)
        
        results.push({
          name: test.name,
          url: test.url,
          success: response.ok,
          loadTime,
          status: response.status
        })
      } catch (error) {
        results.push({
          name: test.name,
          url: test.url,
          success: false,
          loadTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    setTestResult(JSON.stringify(results, null, 2))
    setLoading(false)
  }

  useEffect(() => {
    // Show current environment variables
    console.log('Environment variables:')
    console.log('NEXT_PUBLIC_CDN_PROVIDER:', process.env.NEXT_PUBLIC_CDN_PROVIDER)
    console.log('NEXT_PUBLIC_GITHUB_USERNAME:', process.env.NEXT_PUBLIC_GITHUB_USERNAME)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Simple CDN Test
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2 text-sm">
            <p><strong>CDN Provider:</strong> {process.env.NEXT_PUBLIC_CDN_PROVIDER || 'Not set'}</p>
            <p><strong>GitHub Username:</strong> {process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'Not set'}</p>
            <p><strong>Test Activity ID:</strong> 15002226211</p>
          </div>
          
          <button
            onClick={testCDN}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test CDN URLs'}
          </button>
        </div>

        {testResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Test Results</h2>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-auto">
              {testResult}
            </pre>
          </div>
        )}

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
            Expected jsDelivr URL
          </h2>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 break-all">
            https://cdn.jsdelivr.net/gh/oiahoon/running2.0@master/apps/web/public/maps/15002226211.png
          </p>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-2">
            If this URL works, your maps should load from jsDelivr CDN instead of run2.miaowu.org
          </p>
        </div>
      </div>
    </div>
  )
}
