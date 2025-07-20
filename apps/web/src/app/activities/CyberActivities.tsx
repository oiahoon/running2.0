'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CyberCard, CyberCardContent, CyberCardHeader } from '@/components/ui/CyberCard'
import { CyberButton, CyberPrimaryButton } from '@/components/ui/CyberButton'
import { CyberInput, CyberSearchInput } from '@/components/ui/CyberInput'
import { CyberActivityBadge, CyberMetricBadge, CyberStatusBadge } from '@/components/ui/CyberBadge'
import { CyberBreadcrumb } from '@/components/ui/CyberNavigation'
import { CyberLoading } from '@/components/ui/CyberLoading'

// 模拟活动数据
const mockActivities = [
  {
    id: 1,
    type: 'running',
    name: 'Morning Interval Training',
    distance: 8.5,
    duration: '38:24',
    pace: '4:31',
    date: '2025-07-19',
    time: '06:30',
    elevation: 145,
    heartRate: 165,
    calories: 420,
    status: 'completed',
    weather: '☀️ 18°C',
    location: 'Central Park'
  },
  {
    id: 2,
    type: 'cycling',
    name: 'Evening Ride - City Loop',
    distance: 25.2,
    duration: '1:12:15',
    pace: '20.8',
    date: '2025-07-18',
    time: '18:45',
    elevation: 320,
    heartRate: 142,
    calories: 680,
    status: 'completed',
    weather: '⛅ 22°C',
    location: 'Downtown Circuit'
  },
  {
    id: 3,
    type: 'running',
    name: 'Recovery Run',
    distance: 6.0,
    duration: '28:45',
    pace: '4:47',
    date: '2025-07-17',
    time: '07:00',
    elevation: 85,
    heartRate: 138,
    calories: 310,
    status: 'completed',
    weather: '🌧️ 15°C',
    location: 'Riverside Trail'
  },
  {
    id: 4,
    type: 'swimming',
    name: 'Pool Training Session',
    distance: 2.0,
    duration: '45:30',
    pace: '2:15',
    date: '2025-07-16',
    time: '19:00',
    elevation: 0,
    heartRate: 155,
    calories: 380,
    status: 'completed',
    weather: '🏊 Indoor',
    location: 'Aquatic Center'
  },
  {
    id: 5,
    type: 'running',
    name: 'Long Run - Weekend',
    distance: 15.8,
    duration: '1:18:22',
    pace: '4:58',
    date: '2025-07-15',
    time: '08:00',
    elevation: 280,
    heartRate: 152,
    calories: 890,
    status: 'completed',
    weather: '☀️ 20°C',
    location: 'Mountain Trail'
  }
]

function ActivityCard({ activity, index }: { activity: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <CyberCard 
        dataFlow 
        onClick={() => console.log('Navigate to activity', activity.id)}
        className="hover:scale-[1.02] transition-transform duration-300"
      >
        <CyberCardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <CyberActivityBadge type={activity.type} />
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {activity.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-400 font-mono">
                  <span>{activity.date}</span>
                  <span>{activity.time}</span>
                  <span>{activity.weather}</span>
                </div>
              </div>
            </div>
            <CyberStatusBadge status="online" size="sm" />
          </div>

          {/* 主要指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-neonCyan-400 font-mono">
                {activity.distance}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                {activity.type === 'swimming' ? 'km' : 'km'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neonGreen-500 font-mono">
                {activity.duration}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                Duration
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neonPink-500 font-mono">
                {activity.pace}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                {activity.type === 'cycling' ? 'km/h' : 'min/km'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neonOrange-500 font-mono">
                {activity.calories}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                Calories
              </div>
            </div>
          </div>

          {/* 次要指标 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CyberMetricBadge
                label="Elevation"
                value={activity.elevation}
                unit="m"
                variant="info"
                size="sm"
              />
              <CyberMetricBadge
                label="HR"
                value={activity.heartRate}
                unit="bpm"
                variant="warning"
                size="sm"
              />
            </div>
            <div className="text-xs text-gray-500 font-mono">
              📍 {activity.location}
            </div>
          </div>
        </CyberCardContent>
      </CyberCard>
    </motion.div>
  )
}

export function CyberActivities() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const handleSyncData = async () => {
    setIsLoading(true)
    // 模拟数据同步
    setTimeout(() => {
      setIsLoading(false)
      console.log('Data synced successfully!')
    }, 2000)
  }

  const handleExport = () => {
    console.log('Exporting data...')
    // 这里可以添加导出逻辑
  }

  const filteredActivities = mockActivities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || activity.type === selectedType
    return matchesSearch && matchesType
  })

  // 分页逻辑
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentActivities = filteredActivities.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // 当搜索或筛选条件改变时重置到第一页
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* 面包屑导航 */}
      <CyberBreadcrumb 
        items={[
          { name: 'System', href: '/dashboard' },
          { name: 'Activities' }
        ]} 
      />

      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-display font-bold cyber-title neon-text-pulse">
          ACTIVITY_LOG.EXE
        </h1>
        <p className="text-lg text-gray-400 font-mono">
          {'>'} TRAINING_SESSIONS: <span className="text-neonCyan-400">{mockActivities.length}</span> ENTRIES_FOUND
        </p>
      </motion.div>

      {/* 控制面板 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <CyberCard variant="terminal" scanLines>
          <CyberCardHeader
            title="Control Panel"
            subtitle="Filter & Search Operations"
            icon="🔍"
          />
          <CyberCardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 搜索 */}
              <CyberSearchInput
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onSearch={handleSearchChange}
              />
              
              {/* 类型筛选 */}
              <select
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="cyber-input"
              >
                <option value="all">All Activities</option>
                <option value="running">Running</option>
                <option value="cycling">Cycling</option>
                <option value="swimming">Swimming</option>
                <option value="walking">Walking</option>
              </select>
              
              {/* 操作按钮 */}
              <div className="flex gap-2">
                <CyberPrimaryButton 
                  size="sm" 
                  onClick={handleSyncData}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Syncing...' : 'Sync Data'}
                </CyberPrimaryButton>
                <CyberButton 
                  variant="ghost" 
                  size="sm"
                  onClick={handleExport}
                  className="flex-1"
                >
                  Export
                </CyberButton>
              </div>
            </div>
          </CyberCardContent>
        </CyberCard>
      </motion.div>

      {/* 统计概览 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <CyberCard glow className="text-center">
          <CyberCardContent>
            <div className="text-3xl font-bold text-neonCyan-400 font-mono mb-2">
              {filteredActivities.length}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">
              Total Activities
            </div>
          </CyberCardContent>
        </CyberCard>

        <CyberCard glow className="text-center">
          <CyberCardContent>
            <div className="text-3xl font-bold text-neonGreen-500 font-mono mb-2">
              {filteredActivities.reduce((sum, a) => sum + a.distance, 0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">
              Total Distance (km)
            </div>
          </CyberCardContent>
        </CyberCard>

        <CyberCard glow className="text-center">
          <CyberCardContent>
            <div className="text-3xl font-bold text-neonPink-500 font-mono mb-2">
              {filteredActivities.reduce((sum, a) => sum + a.calories, 0)}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">
              Total Calories
            </div>
          </CyberCardContent>
        </CyberCard>

        <CyberCard glow className="text-center">
          <CyberCardContent>
            <div className="text-3xl font-bold text-neonOrange-500 font-mono mb-2">
              {Math.round(filteredActivities.reduce((sum, a) => sum + a.heartRate, 0) / filteredActivities.length)}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">
              Avg Heart Rate
            </div>
          </CyberCardContent>
        </CyberCard>
      </motion.div>

      {/* 活动列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="space-y-4"
      >
        {isLoading ? (
          <div className="text-center py-12">
            <CyberLoading variant="terminal" text="Synchronizing Data" />
          </div>
        ) : currentActivities.length > 0 ? (
          currentActivities.map((activity, index) => (
            <ActivityCard key={activity.id} activity={activity} index={index} />
          ))
        ) : (
          <CyberCard variant="terminal" className="text-center py-12">
            <CyberCardContent>
              <div className="terminal-text">
                <div className="text-2xl mb-4">⚠️</div>
                <div className="text-lg font-mono">NO_ACTIVITIES_FOUND</div>
                <div className="text-sm mt-2 opacity-80">
                  ADJUST_SEARCH_PARAMETERS_OR_SYNC_NEW_DATA
                </div>
              </div>
            </CyberCardContent>
          </CyberCard>
        )}
      </motion.div>

      {/* 分页控制 */}
      {filteredActivities.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex justify-center items-center space-x-4"
        >
          <CyberButton 
            variant="ghost" 
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}
          >
            ← Previous
          </CyberButton>
          
          <div className="flex items-center space-x-2 font-mono text-sm">
            <span className="text-gray-400">Page</span>
            <span className="text-neonCyan-400">{currentPage}</span>
            <span className="text-gray-400">of</span>
            <span className="text-neonCyan-400">{totalPages}</span>
          </div>
          
          <CyberButton 
            variant="ghost" 
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Next →
          </CyberButton>
        </motion.div>
      )}

      {/* 显示总数信息 */}
      {filteredActivities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center text-sm text-gray-400 font-mono"
        >
          Showing {startIndex + 1}-{Math.min(endIndex, filteredActivities.length)} of {filteredActivities.length} activities
        </motion.div>
      )}
    </div>
  )
}
