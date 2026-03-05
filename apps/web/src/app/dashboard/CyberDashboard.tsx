'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useActivityStats, useRecentActivities } from '@/lib/hooks/useActivities'
import { formatDuration, formatPace } from '@/lib/database/models/Activity'
import { CyberCard, CyberCardContent, CyberCardHeader, CyberStatsCard } from '@/components/ui/CyberCard'
import { CyberButton, CyberPrimaryButton, CyberSecondaryButton } from '@/components/ui/CyberButton'
import { CyberStatusBadge, CyberActivityBadge, CyberMetricBadge } from '@/components/ui/CyberBadge'

export function CyberDashboard() {
  const router = useRouter()
  const currentYear = new Date().getFullYear()
  const { data: statsData, isLoading: statsLoading } = useActivityStats(currentYear)
  const { data: recentActivities = [], isLoading: recentLoading } = useRecentActivities(6)

  const basicStats = statsData?.basicStats
  const totalDistanceKm = Number(basicStats?.total_distance || 0)
  const totalTimeSeconds = Number(basicStats?.total_time || 0)
  const averageSpeedMps = totalTimeSeconds > 0 ? (totalDistanceKm * 1000) / totalTimeSeconds : 0
  const avgPaceDisplay = averageSpeedMps > 0 ? formatPace(averageSpeedMps) : '--:--/km'

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 7)

  const weeklyActivities = recentActivities.filter((activity: any) => {
    const startDate = new Date(activity.start_date || activity.startDate || '')
    return !Number.isNaN(startDate.getTime()) && startDate >= weekStart
  })

  const thisWeekDistanceKm = weeklyActivities.reduce((sum: number, activity: any) => {
    const meters = Number(activity.distance || 0)
    return sum + meters / 1000
  }, 0)

  const recentActivityRows = recentActivities.slice(0, 4)

  const handleSyncData = () => {
    router.push('/sync')
  }

  const handleViewMap = () => {
    router.push('/map')
  }

  const handleViewStats = () => {
    router.push('/stats')
  }

  const handleViewActivities = () => {
    router.push('/activities')
  }
  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-5xl font-display font-bold cyber-title neon-text-pulse">
          RUNNING.EXE
        </h1>
        <div className="text-xl text-gray-400 font-mono flex items-center gap-2">
          {'>'} SYSTEM STATUS: <CyberStatusBadge status="online" />
        </div>
      </motion.div>

      {/* 主要统计数据 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <CyberStatsCard
          title="Total Distance"
          value={statsLoading ? '...' : totalDistanceKm.toFixed(1)}
          subtitle="kilometers"
          icon="🏃"
          color="cyan"
        />
        
        <CyberStatsCard
          title="Activities"
          value={statsLoading ? '...' : Number(basicStats?.total_activities || 0)}
          subtitle="completed"
          icon="⚡"
          color="pink"
        />
        
        <CyberStatsCard
          title="Avg Pace"
          value={statsLoading ? '...' : avgPaceDisplay}
          subtitle="min/km"
          icon="⏱️"
          color="green"
        />
        
        <CyberStatsCard
          title="Total Time"
          value={statsLoading ? '...' : formatDuration(totalTimeSeconds)}
          subtitle="hours"
          icon="🕐"
          color="purple"
        />
      </motion.div>

      {/* 本周数据和快速操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 本周统计 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <CyberCard glow scanLines>
            <CyberCardHeader
              title="This Week Performance"
              subtitle="Weekly Progress Analysis"
              icon="📊"
            />
            <CyberCardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <CyberMetricBadge
                  label="Distance"
                  value={thisWeekDistanceKm.toFixed(1)}
                  unit="km"
                  variant="primary"
                />
                <CyberMetricBadge
                  label="Activities"
                  value={weeklyActivities.length}
                  variant="success"
                />
                <CyberMetricBadge
                  label="PBs"
                  value={statsData?.personalRecords ? Object.values(statsData.personalRecords).filter(Boolean).length : 0}
                  variant="warning"
                />
                <CyberMetricBadge
                  label="Streak"
                  value={weeklyActivities.length > 0 ? 'ON' : 'OFF'}
                  variant="info"
                />
              </div>
              
              {/* 进度条 */}
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neonCyan-400 font-mono">Weekly Goal</span>
                    <span className="text-white">{thisWeekDistanceKm.toFixed(1)}/50 km</span>
                  </div>
                  <div className="cyber-progress h-2">
                    <div 
                      className="cyber-progress-bar"
                      style={{ width: `${Math.min((thisWeekDistanceKm / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CyberCardContent>
          </CyberCard>
        </motion.div>

        {/* 快速操作 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <CyberCard variant="terminal">
            <CyberCardHeader
              title="Quick Actions"
              subtitle="System Commands"
              icon="⚡"
            />
            <CyberCardContent className="space-y-4">
              <CyberPrimaryButton size="sm" className="w-full" onClick={handleSyncData}>
                Sync Data
              </CyberPrimaryButton>
              <CyberSecondaryButton size="sm" className="w-full" onClick={handleViewMap}>
                View Map
              </CyberSecondaryButton>
              <CyberButton variant="success" size="sm" className="w-full" onClick={handleViewStats}>
                Statistics
              </CyberButton>
              <CyberButton variant="ghost" size="sm" className="w-full">
                Settings
              </CyberButton>
            </CyberCardContent>
          </CyberCard>
        </motion.div>
      </div>

      {/* 最近活动 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <CyberCard dataFlow>
          <CyberCardHeader
            title="Recent Activities"
            subtitle="Latest Training Sessions"
            icon="🏃‍♂️"
          />
          <CyberCardContent>
            <div className="space-y-4">
              {recentLoading && (
                <div className="text-gray-400 font-mono text-sm">LOADING_RECENT_ACTIVITIES...</div>
              )}
              {!recentLoading && recentActivityRows.length === 0 && (
                <div className="text-gray-400 font-mono text-sm">NO_RECENT_ACTIVITIES</div>
              )}
              {recentActivityRows.map((activity: any, index) => {
                const date = new Date(activity.start_date || activity.startDate || '')
                const type = String(activity.type || 'Other')
                const speed = Number(activity.average_speed || activity.averageSpeed || 0)
                return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 bg-cyber-800/50 rounded-lg border border-cyber-700 hover:border-neonCyan-400 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <CyberActivityBadge type={type.toLowerCase()} />
                    <div>
                      <h4 className="text-white font-semibold">{activity.name}</h4>
                      <p className="text-gray-400 text-sm font-mono">
                        {Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm font-mono">
                    <div className="text-center">
                      <div className="text-neonCyan-400">{((Number(activity.distance || 0)) / 1000).toFixed(1)} km</div>
                      <div className="text-gray-500">distance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-neonGreen-500">{formatDuration(Number(activity.moving_time || 0))}</div>
                      <div className="text-gray-500">time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-neonPink-500">{speed > 0 ? formatPace(speed) : '--:--/km'}</div>
                      <div className="text-gray-500">pace</div>
                    </div>
                  </div>
                </motion.div>
              )})}
            </div>
            
            <div className="mt-6 text-center">
              <CyberButton variant="ghost" onClick={handleViewActivities}>
                View All Activities →
              </CyberButton>
            </div>
          </CyberCardContent>
        </CyberCard>
      </motion.div>

      {/* 系统信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <CyberCard variant="terminal" className="text-center">
          <CyberCardContent>
            <div className="terminal-text">
              <div className="text-lg font-mono">SYSTEM.STATUS</div>
              <div className="mt-2">ALL_SYSTEMS_OPERATIONAL</div>
              <div className="text-sm mt-2 opacity-80">
                LAST_SYNC: {statsData?.recentActivities?.[0]?.start_date ? new Date(statsData.recentActivities[0].start_date).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </CyberCardContent>
        </CyberCard>

        <CyberCard variant="glow" className="text-center">
          <CyberCardContent>
            <div className="text-neonPink-500">
              <div className="text-2xl font-bold font-mono">
                {totalDistanceKm > 0 ? `${Math.min(Math.round((thisWeekDistanceKm / 50) * 100), 999)}%` : '0%'}
              </div>
              <div className="text-sm mt-1">PERFORMANCE_INDEX</div>
              <div className="text-xs mt-2 opacity-80">WEEKLY_GOAL_PROGRESS</div>
            </div>
          </CyberCardContent>
        </CyberCard>

        <CyberCard variant="elevated" className="text-center">
          <CyberCardContent>
            <div className="text-neonOrange-500">
              <div className="text-2xl font-bold font-mono">{Number(basicStats?.total_activities || 0)}</div>
              <div className="text-sm mt-1">TOTAL_SESSIONS</div>
              <div className="text-xs mt-2 opacity-80">DATA_DRIVEN</div>
            </div>
          </CyberCardContent>
        </CyberCard>
      </motion.div>
    </div>
  )
}
