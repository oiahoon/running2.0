'use client'

import { useActivityStats, useRecentActivities } from '@/lib/hooks/useActivities'
import { formatDistance, formatDuration, getActivityIcon } from '@/lib/database/models/Activity'
import {
  Heading,
  Text,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Alert,
} from '@/components/catalyst'
import GitHubHeatmap from '@/components/charts/GitHubHeatmap'

function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  color = 'blue' 
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  trend?: { value: number; isPositive: boolean }
  color?: 'blue' | 'green' | 'amber' | 'red'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-950/5 bg-white dark:border-white/10 dark:bg-zinc-900">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className={`flex size-12 items-center justify-center rounded-lg ${colorClasses[color]}`}>
            <span className="text-xl">{icon}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-semibold text-zinc-950 dark:text-white">
                {value}
              </div>
              {trend && (
                <Badge color={trend.isPositive ? 'green' : 'red'}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </Badge>
              )}
            </div>
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-zinc-400 dark:text-zinc-500">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsGrid() {
  const { data: stats, isLoading, error } = useActivityStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-zinc-950/5 bg-white dark:border-white/10 dark:bg-zinc-900 animate-pulse">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-lg bg-zinc-200 dark:bg-zinc-700"></div>
                <div className="flex-1">
                  <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Activities" value="0" icon="🏃‍♂️" color="blue" />
        <StatsCard title="Total Distance" value="0 km" icon="📏" color="green" />
        <StatsCard title="Total Time" value="0h 0m" icon="⏱️" color="amber" />
        <StatsCard title="Avg Distance" value="0 km" icon="📊" color="red" />
      </div>
    )
  }

  const basicStats = stats.basicStats || {}

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="Total Activities" 
        value={basicStats.totalActivities || 0}
        icon="🏃‍♂️"
        color="blue"
        subtitle={`Since ${basicStats.firstActivity ? new Date(basicStats.firstActivity).getFullYear() : 'N/A'}`}
      />
      <StatsCard 
        title="Total Distance" 
        value={formatDistance(basicStats.totalDistance || 0)}
        icon="📏"
        color="green"
        subtitle="All time"
      />
      <StatsCard 
        title="Total Time" 
        value={formatDuration(basicStats.totalTime || 0)}
        icon="⏱️"
        color="amber"
        subtitle="Moving time"
      />
      <StatsCard 
        title="Avg Distance" 
        value={formatDistance(basicStats.avgDistance || 0)}
        icon="📊"
        color="red"
        subtitle="Per activity"
      />
    </div>
  )
}

function RecentActivitiesTable() {
  const { data: activities, isLoading } = useRecentActivities(10)

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-zinc-950/5 bg-white dark:border-white/10 dark:bg-zinc-900">
        <div className="p-6">
          <Heading level={3}>Recent Activities</Heading>
          <div className="mt-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-950/5 bg-white dark:border-white/10 dark:bg-zinc-900">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <Heading level={3}>Recent Activities</Heading>
          <Button href="/activities" plain>
            View all
          </Button>
        </div>
        
        {activities && activities.length > 0 ? (
          <div className="mt-6">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Activity</TableHeader>
                  <TableHeader>Distance</TableHeader>
                  <TableHeader>Time</TableHeader>
                  <TableHeader>Date</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.slice(0, 5).map((activity: any) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getActivityIcon(activity.type)}</span>
                        <div>
                          <div className="font-medium text-zinc-950 dark:text-white">
                            {activity.name || `${activity.type} Activity`}
                          </div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            {activity.type}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-500 dark:text-zinc-400">
                      {formatDistance(activity.distance)}
                    </TableCell>
                    <TableCell className="text-zinc-500 dark:text-zinc-400">
                      {formatDuration(activity.moving_time)}
                    </TableCell>
                    <TableCell className="text-zinc-500 dark:text-zinc-400">
                      {new Date(activity.start_date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="mt-6 text-center py-12">
            <div className="text-4xl mb-4">🏃‍♂️</div>
            <Heading level={4} className="text-zinc-500 dark:text-zinc-400">
              No recent activities
            </Heading>
            <Text className="mt-2 text-zinc-400 dark:text-zinc-500">
              Connect your Strava account to see activities
            </Text>
            <Button href="/sync" className="mt-4">
              Connect Strava
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function ActivityHeatmap() {
  const currentYear = new Date().getFullYear()
  const { data: stats } = useActivityStats()

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-950/5 bg-white dark:border-white/10 dark:bg-zinc-900">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <Heading level={3}>🔥 Activity Heatmap - {currentYear}</Heading>
          <Badge color="blue">{currentYear}</Badge>
        </div>
        
        <div className="mt-6">
          {stats?.dailyStats && stats.dailyStats.length > 0 ? (
            <GitHubHeatmap 
              data={stats.dailyStats.map((day: any) => ({
                date: day.date,
                count: day.activities,
                distance: day.distance,
                duration: day.duration
              }))}
              year={currentYear}
              showTooltip={true}
            />
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">📅</div>
                <Heading level={4} className="text-zinc-500 dark:text-zinc-400">
                  Loading activity heatmap...
                </Heading>
                <Text className="mt-2 text-zinc-400 dark:text-zinc-500">
                  GitHub-style activity calendar will be displayed here
                </Text>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NewDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <Heading>Dashboard</Heading>
        <Text className="mt-2">
          Welcome back! Here&apos;s an overview of your running activities.
        </Text>
      </div>

      {/* Stats Grid */}
      <StatsGrid />

      {/* Recent Activities */}
      <RecentActivitiesTable />

      {/* Activity Heatmap */}
      <ActivityHeatmap />
    </div>
  )
}
