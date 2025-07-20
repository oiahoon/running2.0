'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export interface CyberCardProps {
  variant?: 'default' | 'glow' | 'terminal' | 'elevated'
  glow?: boolean
  scanLines?: boolean
  dataFlow?: boolean
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

const variants = {
  default: 'bg-cyber-900/80 border-cyber-700',
  glow: 'bg-cyber-900/80 border-neonCyan-400 shadow-neon-cyan',
  terminal: 'bg-black border-neonGreen-500 text-neonGreen-500 shadow-neon-green',
  elevated: 'bg-cyber-800/90 border-cyber-600 shadow-xl'
}

export function CyberCard({
  variant = 'default',
  glow = false,
  scanLines = false,
  dataFlow = false,
  className,
  children,
  onClick
}: CyberCardProps) {
  const isInteractive = !!onClick

  return (
    <motion.div
      className={clsx(
        // 基础样式
        'relative border rounded-lg backdrop-blur-sm overflow-hidden',
        'transition-all duration-300',
        
        // 变体样式
        variants[variant],
        
        // 交互样式
        isInteractive && 'cursor-pointer hover:border-neonCyan-400 hover:shadow-neon-cyan',
        
        // 发光效果
        glow && 'shadow-lg',
        
        className
      )}
      whileHover={isInteractive ? { scale: 1.02, y: -2 } : {}}
      onClick={onClick}
    >
      {/* 网格背景 */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* 扫描线效果 */}
      {scanLines && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(34, 211, 238, 0.03) 2px,
              rgba(34, 211, 238, 0.03) 4px
            )`
          }}
        />
      )}
      
      {/* 数据流动效果 */}
      {dataFlow && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-data-stream animate-data-flow" />
        </div>
      )}
      
      {/* 卡片内容 */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* 边框发光效果 */}
      {glow && (
        <div className="absolute inset-0 rounded-lg opacity-20 blur-sm bg-current pointer-events-none" />
      )}
    </motion.div>
  )
}

// 卡片头部组件
export function CyberCardHeader({ 
  title, 
  subtitle, 
  icon,
  className 
}: { 
  title: string
  subtitle?: string
  icon?: React.ReactNode
  className?: string 
}) {
  return (
    <div className={clsx('p-6 border-b border-cyber-700', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="text-neonCyan-400 text-xl">
            {icon}
          </div>
        )}
        <div>
          <h3 className="cyber-title text-lg font-semibold">
            {title}
          </h3>
          {subtitle && (
            <p className="cyber-subtitle mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// 卡片内容组件
export function CyberCardContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={clsx('p-6', className)}>
      {children}
    </div>
  )
}

// 卡片底部组件
export function CyberCardFooter({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={clsx('p-6 border-t border-cyber-700 bg-cyber-800/50', className)}>
      {children}
    </div>
  )
}

// 统计卡片组件
export function CyberStatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'cyan',
  className
}: {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: { value: number; isPositive: boolean }
  color?: 'cyan' | 'pink' | 'green' | 'purple' | 'orange'
  className?: string
}) {
  const colorClasses = {
    cyan: 'text-neonCyan-400 border-neonCyan-400',
    pink: 'text-neonPink-500 border-neonPink-500',
    green: 'text-neonGreen-500 border-neonGreen-500',
    purple: 'text-neonPurple-500 border-neonPurple-500',
    orange: 'text-neonOrange-500 border-neonOrange-500'
  }

  return (
    <CyberCard className={clsx('hover:glow-' + color, className)} glow>
      <CyberCardContent>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <div className={clsx('text-3xl font-bold font-mono', colorClasses[color])}>
                {value}
              </div>
              {trend && (
                <div className={clsx(
                  'flex items-center text-sm font-mono',
                  trend.isPositive ? 'text-neonGreen-500' : 'text-neonPink-500'
                )}>
                  <span>{trend.isPositive ? '↗' : '↘'}</span>
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>
            <div className="mt-2">
              <div className="text-white font-medium">
                {title}
              </div>
              {subtitle && (
                <div className="text-gray-400 text-sm mt-1">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          {icon && (
            <div className={clsx('text-4xl opacity-80', colorClasses[color])}>
              {icon}
            </div>
          )}
        </div>
      </CyberCardContent>
    </CyberCard>
  )
}
