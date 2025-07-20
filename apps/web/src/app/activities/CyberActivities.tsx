'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useActivities } from '@/lib/hooks/useActivities'
import { formatDistance, formatDuration, formatPace, getActivityIcon, Activity } from '@/lib/database/models/Activity'
import { getDefaultActivityTypes } from '@/lib/config/activityTypes'
import { CyberCard, CyberCardContent, CyberCardHeader } from '@/components/ui/CyberCard'
import { CyberButton, CyberPrimaryButton } from '@/components/ui/CyberButton'
import { CyberInput, CyberSearchInput } from '@/components/ui/CyberInput'
import { CyberActivityBadge, CyberMetricBadge, CyberStatusBadge } from '@/components/ui/CyberBadge'
import { CyberBreadcrumb } from '@/components/ui/CyberNavigation'
import { CyberLoading } from '@/components/ui/CyberLoading'

function ActivityCard({ activity, index }: { activity: Activity; index: number }) {
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
                  {activity.name || `${activity.type} Activity`}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-400 font-mono">
                  <span>{new Date(activity.start_date).toLocaleDateString()}</span>
                  <span>{new Date(activity.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {activity.location_city && (
                    <span>📍 {activity.location_city}</span>
                  )}
                </div>
              </div>
            </div>
            <CyberStatusBadge status="online" size="sm" />
          </div>

          {/* 主要指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-neonCyan-400 font-mono">
                {formatDistance(activity.distance)}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                Distance
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neonGreen-500 font-mono">
                {formatDuration(activity.moving_time)}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                Duration
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neonPink-500 font-mono">
                {activity.average_speed ? formatPace(activity.average_speed, activity.type) : 'N/A'}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                {activity.type === 'cycling' ? 'Speed' : 'Pace'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neonOrange-500 font-mono">
                {activity.calories || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                Calories
              </div>
            </div>
          </div>

          {/* 次要指标 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {activity.total_elevation_gain && activity.total_elevation_gain > 0 && (
                <CyberMetricBadge
                  label="Elevation"
                  value={Math.round(activity.total_elevation_gain)}
                  unit="m"
                  variant="info"
                  size="sm"
                />
              )}
              {activity.average_heartrate && activity.average_heartrate > 0 && (
                <CyberMetricBadge
                  label="HR"
                  value={Math.round(activity.average_heartrate)}
                  unit="bpm"
                  variant="warning"
                  size="sm"
                />
              )}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {getActivityIcon(activity.type)} {activity.type.toUpperCase()}
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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 构建查询参数
  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    types: selectedType === 'all' ? getDefaultActivityTypes() : [selectedType],
  }

  // 使用真实的活动数据API
  const { data, isLoading, error } = useActivities(queryParams)
  const activities = data?.activities || []
  const pagination = data?.pagination
  const summary = data?.summary

  const handleSyncData = async () => {
    // 这里可以添加数据同步逻辑
    console.log('Syncing data...')
  }

  const handleExport = () => {
    console.log('Exporting data...')
    // 这里可以添加导出逻辑
  }

  const handlePreviousPage = () => {
    if (pagination?.hasPrev) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination?.hasNext) {
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CyberCard variant="terminal" className="text-center py-12">
          <CyberCardContent>
            <div className="terminal-text">
              <div className="text-2xl mb-4">⚠️</div>
              <div className="text-lg font-mono text-red-400">SYSTEM_ERROR</div>
              <div className="text-sm mt-2 opacity-80">
                {error.message}
              </div>
              <CyberButton 
                variant="danger" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                RETRY_CONNECTION
              </CyberButton>
            </div>
          </CyberCardContent>
        </CyberCard>
      </div>
    )
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
          {'>'} TRAINING_SESSIONS: <span className="text-neonCyan-400">{summary?.totalActivities || 0}</span> ENTRIES_FOUND
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
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <CyberCard glow className="text-center">
            <CyberCardContent>
              <div className="text-3xl font-bold text-neonCyan-400 font-mono mb-2">
                {summary.totalActivities}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Total Activities
              </div>
            </CyberCardContent>
          </CyberCard>

          <CyberCard glow className="text-center">
            <CyberCardContent>
              <div className="text-3xl font-bold text-neonGreen-500 font-mono mb-2">
                {formatDistance(summary.totalDistance)}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Total Distance
              </div>
            </CyberCardContent>
          </CyberCard>

          <CyberCard glow className="text-center">
            <CyberCardContent>
              <div className="text-3xl font-bold text-neonPink-500 font-mono mb-2">
                {formatDuration(summary.totalTime)}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Total Time
              </div>
            </CyberCardContent>
          </CyberCard>

          <CyberCard glow className="text-center">
            <CyberCardContent>
              <div className="text-3xl font-bold text-neonOrange-500 font-mono mb-2">
                {summary.totalActivities > 0 ? Math.round(summary.totalDistance / summary.totalActivities * 1000) / 1000 : 0}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Avg Distance (km)
              </div>
            </CyberCardContent>
          </CyberCard>
        </motion.div>
      )}

      {/* 活动列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="space-y-4"
      >
        {isLoading ? (
          <div className="text-center py-12">
            <CyberLoading variant="terminal" text="Loading Activities" />
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity, index) => (
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
      {pagination && pagination.total > pagination.limit && (
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
            disabled={!pagination.hasPrev}
            className={!pagination.hasPrev ? 'opacity-50 cursor-not-allowed' : ''}
          >
            ← Previous
          </CyberButton>
          
          <div className="flex items-center space-x-2 font-mono text-sm">
            <span className="text-gray-400">Page</span>
            <span className="text-neonCyan-400">{pagination.page}</span>
            <span className="text-gray-400">of</span>
            <span className="text-neonCyan-400">{Math.ceil(pagination.total / pagination.limit)}</span>
          </div>
          
          <CyberButton 
            variant="ghost" 
            size="sm"
            onClick={handleNextPage}
            disabled={!pagination.hasNext}
            className={!pagination.hasNext ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Next →
          </CyberButton>
        </motion.div>
      )}

      {/* 显示总数信息 */}
      {pagination && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center text-sm text-gray-400 font-mono"
        >
          Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} activities
        </motion.div>
      )}
    </div>
  )
}
