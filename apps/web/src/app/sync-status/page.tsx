import { Metadata } from 'next';
import { Badge } from '@/components/catalyst';
import { getDatabase } from '@/lib/database/connection';

export const metadata: Metadata = {
  title: 'Sync Status - Running Page 2.0',
  description: 'Data synchronization status and statistics',
};

function StatsCard({ title, value, subtitle, icon }: {
  title: string
  value: string | number
  subtitle?: string
  icon: string
}) {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="text-2xl">{icon}</div>
          </div>
          <div className="ml-4 flex-1">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {value}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ title, children }: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        {children}
      </div>
    </div>
  )
}

async function getSyncStatus() {
  try {
    const db = await getDatabase();
    
    // Get total activities count
    const totalResult = db.prepare('SELECT COUNT(*) as count FROM activities').get() as { count: number };
    
    // Get latest activity
    const latestResult = db.prepare(`
      SELECT name, start_date, type 
      FROM activities 
      ORDER BY start_date DESC 
      LIMIT 1
    `).get() as { name: string; start_date: string; type: string } | undefined;
    
    // Get activities by type
    const typeStats = db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM activities 
      GROUP BY type 
      ORDER BY count DESC
    `).all() as { type: string; count: number }[];
    
    // Get recent activities (last 7 days)
    const recentResult = db.prepare(`
      SELECT COUNT(*) as count 
      FROM activities 
      WHERE start_date >= datetime('now', '-7 days')
    `).get() as { count: number };
    
    // Get sync timestamp (from database file modification time)
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.join(process.cwd(), 'data', 'running_page_2.db');
    let lastSync = null;
    
    try {
      const stats = fs.statSync(dbPath);
      lastSync = stats.mtime.toISOString();
    } catch (error) {
      // Database file not found, try public directory
      const publicDbPath = path.join(process.cwd(), 'public', 'running_page_2.db');
      try {
        const stats = fs.statSync(publicDbPath);
        lastSync = stats.mtime.toISOString();
      } catch (error) {
        console.error('Could not get database modification time:', error);
      }
    }
    
    return {
      totalActivities: totalResult.count,
      latestActivity: latestResult,
      typeStats,
      recentActivities: recentResult.count,
      lastSync,
    };
  } catch (error) {
    console.error('Error getting sync status:', error);
    return {
      totalActivities: 0,
      latestActivity: null,
      typeStats: [],
      recentActivities: 0,
      lastSync: null,
      error: 'Failed to load sync status',
    };
  }
}

export default async function SyncStatusPage() {
  const status = await getSyncStatus();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Data Sync Status
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your Strava data synchronization status and statistics
        </p>
      </div>
      
      {status.error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium">Error</h3>
          <p className="text-red-700 dark:text-red-300 text-sm mt-1">{status.error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard 
          title="Total Activities" 
          value={status.totalActivities.toLocaleString()} 
          icon="🏃‍♂️"
          subtitle="All time"
        />
        <StatsCard 
          title="Recent Activities" 
          value={status.recentActivities} 
          icon="📅"
          subtitle="Last 7 days"
        />
        <StatsCard 
          title="Last Sync" 
          value={status.lastSync ? new Date(status.lastSync).toLocaleDateString() : 'Unknown'} 
          icon="🔄"
          subtitle={status.lastSync ? new Date(status.lastSync).toLocaleTimeString() : 'No sync data'}
        />
        <StatsCard 
          title="Sync Status" 
          value={status.lastSync ? 'Active' : 'Unknown'} 
          icon="✅"
          subtitle="Automatic sync"
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <InfoCard title="Latest Activity">
          {status.latestActivity ? (
            <div className="space-y-2">
              <div className="font-medium text-gray-900 dark:text-white">
                {status.latestActivity.name}
              </div>
              <div className="flex items-center gap-2">
                <Badge color="blue">{status.latestActivity.type}</Badge>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(status.latestActivity.start_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No activities found</p>
          )}
        </InfoCard>
        
        <InfoCard title="Activity Types">
          <div className="space-y-2">
            {status.typeStats.slice(0, 5).map((stat) => (
              <div key={stat.type} className="flex items-center justify-between">
                <span className="text-sm text-gray-900 dark:text-white">{stat.type}</span>
                <Badge color="gray">{stat.count}</Badge>
              </div>
            ))}
            {status.typeStats.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No activity types found</p>
            )}
          </div>
        </InfoCard>
      </div>
      
      <InfoCard title="Sync Information">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Automatic Sync Schedule</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Data is automatically synchronized from Strava every 6 hours using GitHub Actions.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Data Sources</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Strava API for activity data</li>
              <li>• SQLite database for local storage</li>
              <li>• GitHub repository for data persistence</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Deployment</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Database is automatically deployed to Vercel with each sync to ensure data availability.
            </p>
          </div>
        </div>
      </InfoCard>
    </div>
  );
}
