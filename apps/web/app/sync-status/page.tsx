import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Database, Activity, Clock } from 'lucide-react';
import { getDatabase } from '@/lib/database';

export const metadata: Metadata = {
  title: 'Sync Status - Running Page 2.0',
  description: 'Data synchronization status and statistics',
};

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Data Sync Status</h1>
        <p className="text-muted-foreground">
          Monitor your Strava data synchronization status and statistics
        </p>
      </div>
      
      {status.error && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{status.error}</p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.totalActivities.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.recentActivities}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {status.lastSync ? (
              <>
                <div className="text-sm font-medium">
                  {new Date(status.lastSync).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(status.lastSync).toLocaleTimeString()}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Unknown</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={status.lastSync ? "default" : "secondary"}>
              {status.lastSync ? "Active" : "Unknown"}
            </Badge>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latest Activity</CardTitle>
            <CardDescription>Most recent synchronized activity</CardDescription>
          </CardHeader>
          <CardContent>
            {status.latestActivity ? (
              <div className="space-y-2">
                <div className="font-medium">{status.latestActivity.name}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{status.latestActivity.type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(status.latestActivity.start_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No activities found</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Activity Types</CardTitle>
            <CardDescription>Breakdown by activity type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status.typeStats.slice(0, 5).map((stat) => (
                <div key={stat.type} className="flex items-center justify-between">
                  <span className="text-sm">{stat.type}</span>
                  <Badge variant="secondary">{stat.count}</Badge>
                </div>
              ))}
              {status.typeStats.length === 0 && (
                <p className="text-muted-foreground text-sm">No activity types found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sync Information</CardTitle>
          <CardDescription>Details about the data synchronization process</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Automatic Sync Schedule</h4>
            <p className="text-sm text-muted-foreground">
              Data is automatically synchronized from Strava every 6 hours using GitHub Actions.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Data Sources</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Strava API for activity data</li>
              <li>• SQLite database for local storage</li>
              <li>• GitHub repository for data persistence</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Deployment</h4>
            <p className="text-sm text-muted-foreground">
              Database is automatically deployed to Vercel with each sync to ensure data availability.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
