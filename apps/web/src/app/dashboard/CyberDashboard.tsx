'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CyberCard, CyberCardContent, CyberCardHeader, CyberStatsCard } from '@/components/ui/CyberCard'
import { CyberButton, CyberPrimaryButton, CyberSecondaryButton } from '@/components/ui/CyberButton'
import { CyberStatusBadge, CyberActivityBadge, CyberMetricBadge } from '@/components/ui/CyberBadge'

// 模拟数据
const mockStats = {
  totalDistance: 1247.8,
  totalActivities: 156,
  avgPace: '4:32',
  totalTime: '127:45',
  thisWeekDistance: 42.1,
  thisWeekActivities: 5,
  personalBests: 8,
  streakDays: 12
}

const mockRecentActivities = [
  {
    id: 1,
    type: 'running',
    name: 'Morning Run',
    distance: 8.5,
    duration: '38:24',
    pace: '4:31',
    date: '2025-07-19',
    status: 'completed'
  },
  {
    id: 2,
    type: 'cycling',
    name: 'Evening Ride',
    distance: 25.2,
    duration: '1:12:15',
    pace: '20.8',
    date: '2025-07-18',
    status: 'completed'
  },
  {
    id: 3,
    type: 'running',
    name: 'Interval Training',
    distance: 6.0,
    duration: '28:45',
    pace: '4:47',
    date: '2025-07-17',
    status: 'completed'
  }
]

export function CyberDashboard() {
  const router = useRouter()

  const handleSyncData = () => {
    console.log('Syncing data...')
    // 这里可以添加实际的数据同步逻辑
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
          value={mockStats.totalDistance}
          subtitle="kilometers"
          icon="🏃"
          color="cyan"
          trend={{ value: 12.5, isPositive: true }}
        />
        
        <CyberStatsCard
          title="Activities"
          value={mockStats.totalActivities}
          subtitle="completed"
          icon="⚡"
          color="pink"
          trend={{ value: 8.2, isPositive: true }}
        />
        
        <CyberStatsCard
          title="Avg Pace"
          value={mockStats.avgPace}
          subtitle="min/km"
          icon="⏱️"
          color="green"
          trend={{ value: 3.1, isPositive: false }}
        />
        
        <CyberStatsCard
          title="Total Time"
          value={mockStats.totalTime}
          subtitle="hours"
          icon="🕐"
          color="purple"
          trend={{ value: 15.7, isPositive: true }}
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
                  value={mockStats.thisWeekDistance}
                  unit="km"
                  variant="primary"
                />
                <CyberMetricBadge
                  label="Activities"
                  value={mockStats.thisWeekActivities}
                  variant="success"
                />
                <CyberMetricBadge
                  label="PBs"
                  value={mockStats.personalBests}
                  variant="warning"
                />
                <CyberMetricBadge
                  label="Streak"
                  value={mockStats.streakDays}
                  unit="days"
                  variant="info"
                />
              </div>
              
              {/* 进度条 */}
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neonCyan-400 font-mono">Weekly Goal</span>
                    <span className="text-white">{mockStats.thisWeekDistance}/50 km</span>
                  </div>
                  <div className="cyber-progress h-2">
                    <div 
                      className="cyber-progress-bar"
                      style={{ width: `${(mockStats.thisWeekDistance / 50) * 100}%` }}
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
              {mockRecentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 bg-cyber-800/50 rounded-lg border border-cyber-700 hover:border-neonCyan-400 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <CyberActivityBadge type={activity.type as any} />
                    <div>
                      <h4 className="text-white font-semibold">{activity.name}</h4>
                      <p className="text-gray-400 text-sm font-mono">{activity.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm font-mono">
                    <div className="text-center">
                      <div className="text-neonCyan-400">{activity.distance} km</div>
                      <div className="text-gray-500">distance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-neonGreen-500">{activity.duration}</div>
                      <div className="text-gray-500">time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-neonPink-500">{activity.pace}</div>
                      <div className="text-gray-500">pace</div>
                    </div>
                  </div>
                </motion.div>
              ))}
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
              <div className="text-sm mt-2 opacity-80">LAST_SYNC: 2MIN_AGO</div>
            </div>
          </CyberCardContent>
        </CyberCard>

        <CyberCard variant="glow" className="text-center">
          <CyberCardContent>
            <div className="text-neonPink-500">
              <div className="text-2xl font-bold font-mono">98.7%</div>
              <div className="text-sm mt-1">PERFORMANCE_INDEX</div>
              <div className="text-xs mt-2 opacity-80">ABOVE_AVERAGE</div>
            </div>
          </CyberCardContent>
        </CyberCard>

        <CyberCard variant="elevated" className="text-center">
          <CyberCardContent>
            <div className="text-neonOrange-500">
              <div className="text-2xl font-bold font-mono">RANK #42</div>
              <div className="text-sm mt-1">GLOBAL_LEADERBOARD</div>
              <div className="text-xs mt-2 opacity-80">TOP_5%</div>
            </div>
          </CyberCardContent>
        </CyberCard>
      </motion.div>
    </div>
  )
}
