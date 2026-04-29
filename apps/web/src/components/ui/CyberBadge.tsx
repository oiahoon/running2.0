'use client'

import React from 'react'
import { clsx } from 'clsx'
import { ActivityIcon } from '@/components/icons/AtlasIcon'

export interface CyberBadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
  pulse?: boolean
  className?: string
  children: React.ReactNode
}

const variants = {
  primary: 'bg-neonCyan-400/20 text-neonCyan-400 border-neonCyan-400',
  secondary: 'bg-neonPink-500/20 text-neonPink-500 border-neonPink-500',
  success: 'bg-neonGreen-500/20 text-neonGreen-500 border-neonGreen-500',
  warning: 'bg-neonOrange-500/20 text-neonOrange-500 border-neonOrange-500',
  danger: 'bg-red-500/20 text-red-400 border-red-400',
  info: 'bg-neonPurple-500/20 text-neonPurple-500 border-neonPurple-500'
}

const sizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base'
}

export function CyberBadge({
  variant = 'primary',
  size = 'md',
  glow = false,
  pulse = false,
  className,
  children
}: CyberBadgeProps) {
  // 确保 variant 和 size 有有效值
  const safeVariant = variant && variants[variant] ? variant : 'primary'
  const safeSize = size && sizes[size] ? size : 'md'
  
  return (
    <span
      className={clsx(
        // 基础样式
        'inline-flex items-center rounded-full border font-mono uppercase tracking-wider',
        'transition-all duration-300',
        
        // 变体样式
        variants[safeVariant],
        
        // 尺寸样式
        sizes[safeSize],
        
        // 发光效果
        glow && 'shadow-lg',
        
        // 脉冲效果
        pulse && 'animate-pulse',
        
        className
      )}
    >
      {children}
    </span>
  )
}

// 状态徽章组件
export function CyberStatusBadge({
  status,
  className,
  ...props
}: Omit<CyberBadgeProps, 'variant'> & {
  status: 'online' | 'offline' | 'warning' | 'error' | 'syncing'
}) {
  const statusConfig: Record<string, { variant: CyberBadgeProps['variant'], text: string, pulse: boolean }> = {
    online: { variant: 'success', text: 'Online', pulse: true },
    offline: { variant: 'secondary', text: 'Offline', pulse: false },
    warning: { variant: 'warning', text: 'Warning', pulse: true },
    error: { variant: 'danger', text: 'Error', pulse: true },
    syncing: { variant: 'info', text: 'Syncing', pulse: true }
  }

  // 安全获取配置，如果状态不存在则使用默认配置
  const config = statusConfig[status] || statusConfig.online

  return (
    <CyberBadge
      variant={config.variant}
      pulse={config.pulse}
      className={clsx('gap-2', className)}
      {...props}
    >
      <span className={clsx(
        'inline-block w-2 h-2 rounded-full',
        status === 'online' && 'bg-neonGreen-500 shadow-neon-green',
        status === 'offline' && 'bg-gray-500',
        status === 'warning' && 'bg-neonOrange-500 shadow-neon-orange',
        status === 'error' && 'bg-red-500 shadow-[0_0_5px_#ef4444]',
        status === 'syncing' && 'bg-neonPurple-500 shadow-neon-purple animate-pulse'
      )} />
      {config.text}
    </CyberBadge>
  )
}

// 活动类型徽章
export function CyberActivityBadge({
  type,
  className,
  ...props
}: Omit<CyberBadgeProps, 'variant'> & {
  type: string // 支持所有活动类型
}) {
  const typeConfig: Record<string, { variant: CyberBadgeProps['variant'], color: string }> = {
    // 跑步相关
    run: { variant: 'success', color: 'text-neonGreen-500' },
    running: { variant: 'success', color: 'text-neonGreen-500' },
    
    // 骑行相关
    ride: { variant: 'primary', color: 'text-neonCyan-400' },
    cycling: { variant: 'primary', color: 'text-neonCyan-400' },
    
    // 游泳相关
    swim: { variant: 'info', color: 'text-neonPurple-500' },
    swimming: { variant: 'info', color: 'text-neonPurple-500' },
    
    // 步行相关
    walk: { variant: 'warning', color: 'text-neonOrange-500' },
    walking: { variant: 'warning', color: 'text-neonOrange-500' },
    
    // 徒步相关
    hike: { variant: 'success', color: 'text-neonGreen-500' },
    hiking: { variant: 'success', color: 'text-neonGreen-500' },
    
    // 健身相关
    workout: { variant: 'danger', color: 'text-red-400' },
    weighttraining: { variant: 'danger', color: 'text-red-400' },
    
    // 其他运动
    elliptical: { variant: 'secondary', color: 'text-neonPink-500' },
    rowing: { variant: 'info', color: 'text-neonPurple-500' },
    standuppaddling: { variant: 'primary', color: 'text-neonCyan-400' },
    
    // 默认
    other: { variant: 'secondary', color: 'text-neonPink-500' }
  }

  // 将类型转换为小写以匹配配置
  const normalizedType = type.toLowerCase()
  
  // 安全获取配置，如果类型不存在则使用默认配置
  const config = typeConfig[normalizedType] || typeConfig.other

  return (
    <CyberBadge
      variant={config.variant}
      className={clsx('gap-1', className)}
      {...props}
    >
      <ActivityIcon type={type} className={clsx('h-3.5 w-3.5', config.color)} />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </CyberBadge>
  )
}

// 数值徽章组件
export function CyberMetricBadge({
  label,
  value,
  unit,
  variant = 'primary',
  className,
  ...props
}: Omit<CyberBadgeProps, 'children'> & {
  label: string
  value: string | number
  unit?: string
}) {
  return (
    <CyberBadge
      variant={variant}
      className={clsx('flex-col gap-1 px-3 py-2', className)}
      {...props}
    >
      <div className="text-xs opacity-80">{label}</div>
      <div className="font-bold">
        {value}
        {unit && <span className="text-xs ml-1 opacity-80">{unit}</span>}
      </div>
    </CyberBadge>
  )
}
