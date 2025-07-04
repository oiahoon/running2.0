'use client'

// Temporarily disabled for deployment - will fix map integration later
export default function RunningMap({ activities, height = 400 }: any) {
  return (
    <div 
      className="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600"
      style={{ height }}
    >
      <div className="text-center p-8">
        <div className="text-4xl mb-4">🗺️</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Interactive Map
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Map functionality temporarily disabled for deployment
        </p>
        <div className="text-sm text-gray-400 dark:text-gray-500">
          <p>Will be restored after fixing react-map-gl integration</p>
          <p className="mt-1">Activities loaded: {activities?.length || 0}</p>
        </div>
      </div>
    </div>
  )
}
