'use client'

export default function TestMobilePage() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mobile Layout Test</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Testing mobile width constraints and overflow handling.
          </p>
        </div>

        {/* Test Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white">
                      {i}
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="text-lg font-medium text-gray-900 dark:text-white truncate">
                      Test Card {i}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      This is a very long subtitle that should truncate properly on mobile devices
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Test Flexbox Layout */}
        <div className="flex flex-col xl:flex-row xl:space-x-6 space-y-6 xl:space-y-0">
          <div className="xl:w-1/2">
            <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-full overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Left Panel
                </h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {i}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                              Very Long Activity Name That Should Truncate Properly On Mobile Devices Test Item {i}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex-shrink-0">5.2 km</span>
                              <span className="flex-shrink-0">•</span>
                              <span className="flex-shrink-0">25:30</span>
                              <span className="flex-shrink-0">•</span>
                              <span className="text-green-600 dark:text-green-400 flex-shrink-0">📍 GPS</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                          Dec 15
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="xl:w-1/2">
            <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-full overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Right Panel
                </h3>
                <div className="h-48 sm:h-64 xl:h-80 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🗺️</div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Map placeholder
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Heatmap Container */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Heatmap Test (Horizontal Scroll)
            </h3>
            <div className="w-full overflow-x-auto">
              <div className="min-w-max">
                <div 
                  className="bg-gradient-to-r from-green-200 to-green-600 rounded-lg p-4 text-white font-medium"
                  style={{ width: '800px' }}
                >
                  This is a wide element (800px) that should scroll horizontally on mobile without affecting page width
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Width Test */}
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
            Width Test
          </h3>
          <div className="text-sm text-red-700 dark:text-red-300">
            <p>If you can see this red box completely without horizontal scrolling, the width constraints are working correctly.</p>
            <p className="mt-2">Screen width: <span id="screen-width">Loading...</span></p>
            <p>Container width: <span id="container-width">Loading...</span></p>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          if (typeof window !== 'undefined') {
            const updateWidths = () => {
              const screenWidth = document.getElementById('screen-width');
              const containerWidth = document.getElementById('container-width');
              if (screenWidth) screenWidth.textContent = window.innerWidth + 'px';
              if (containerWidth) containerWidth.textContent = document.body.scrollWidth + 'px';
            };
            updateWidths();
            window.addEventListener('resize', updateWidths);
          }
        `
      }} />
    </div>
  )
}
