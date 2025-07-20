'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { CyberStatusBadge } from './CyberBadge'

interface NavItem {
  name: string
  href: string
  icon: string
  description?: string
  badge?: string
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '🏠',
    description: 'System Overview'
  },
  {
    name: 'Activities',
    href: '/activities',
    icon: '🏃',
    description: 'Training Log'
  },
  {
    name: 'Statistics',
    href: '/stats',
    icon: '📊',
    description: 'Data Analysis'
  },
  {
    name: 'Map',
    href: '/map',
    icon: '🗺️',
    description: 'Route Visualization'
  },
  {
    name: 'Sync',
    href: '/sync',
    icon: '🔄',
    description: 'Data Synchronization'
  },
  {
    name: 'Debug',
    href: '/debug',
    icon: '🔧',
    description: 'System Diagnostics'
  }
]

export function CyberSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          
          {/* 侧边栏 */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-cyber-900/95 backdrop-blur-xl border-r border-neonCyan-400/30 z-50 lg:relative lg:translate-x-0"
          >
            {/* 头部 */}
            <div className="p-6 border-b border-cyber-700">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-display font-bold cyber-title neon-text">
                    RUNNING.EXE
                  </h1>
                  <p className="text-sm text-gray-400 font-mono mt-1">
                    v2.0.0-cyberpunk
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="lg:hidden text-gray-400 hover:text-neonCyan-400 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* 系统状态 */}
              <div className="mt-4 flex items-center gap-2">
                <CyberStatusBadge status="online" size="sm" />
                <span className="text-xs text-gray-400 font-mono">ALL_SYSTEMS_OPERATIONAL</span>
              </div>
            </div>

            {/* 导航菜单 */}
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={clsx(
                      'group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300',
                      'hover:bg-cyber-800/50 hover:border-neonCyan-400/50',
                      'border border-transparent',
                      isActive ? [
                        'bg-neonCyan-400/10 border-neonCyan-400/50 text-neonCyan-400',
                        'shadow-neon-cyan'
                      ] : 'text-gray-300 hover:text-white'
                    )}
                  >
                    {/* 活动指示器 */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-neonCyan-400 rounded-r"
                        initial={false}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      />
                    )}
                    
                    {/* 图标 */}
                    <div className={clsx(
                      'text-xl transition-all duration-300',
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    )}>
                      {item.icon}
                    </div>
                    
                    {/* 文本 */}
                    <div className="flex-1">
                      <div className={clsx(
                        'font-mono uppercase tracking-wider text-sm',
                        isActive ? 'font-semibold' : 'font-medium'
                      )}>
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </div>
                    
                    {/* 徽章 */}
                    {item.badge && (
                      <div className="text-xs bg-neonPink-500/20 text-neonPink-500 px-2 py-1 rounded-full font-mono">
                        {item.badge}
                      </div>
                    )}
                    
                    {/* 悬浮效果 */}
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute inset-0 bg-data-stream animate-data-flow" />
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* 底部信息 */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyber-700">
              <div className="space-y-2 text-xs font-mono text-gray-500">
                <div className="flex justify-between">
                  <span>CPU:</span>
                  <span className="text-neonGreen-500">23%</span>
                </div>
                <div className="flex justify-between">
                  <span>MEMORY:</span>
                  <span className="text-neonCyan-400">1.2GB</span>
                </div>
                <div className="flex justify-between">
                  <span>UPTIME:</span>
                  <span className="text-neonPink-500">2h 34m</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function CyberTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="bg-cyber-900/80 backdrop-blur-xl border-b border-cyber-700 px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="text-gray-400 hover:text-neonCyan-400 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <h1 className="text-lg font-display font-bold cyber-title">
          RUNNING.EXE
        </h1>
        
        <div className="w-6" /> {/* 占位符保持居中 */}
      </div>
    </div>
  )
}

export function CyberBreadcrumb({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav className="flex items-center space-x-2 text-sm font-mono">
      <span className="text-neonCyan-400">{'>'}</span>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-500">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-400 hover:text-neonCyan-400 transition-colors uppercase tracking-wider"
            >
              {item.name}
            </Link>
          ) : (
            <span className="text-white uppercase tracking-wider">
              {item.name}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

// 主导航布局组件
export function CyberNavigationLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-cyber-950">
      {/* 桌面端侧边栏 */}
      <div className="hidden lg:block">
        <CyberSidebar isOpen={true} onClose={() => {}} />
      </div>
      
      {/* 移动端侧边栏 */}
      <CyberSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 移动端顶部栏 */}
        <CyberTopBar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* 页面内容 */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
