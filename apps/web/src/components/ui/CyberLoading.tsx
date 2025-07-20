'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export interface CyberLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse' | 'terminal'
  color?: 'cyan' | 'pink' | 'green' | 'purple' | 'orange'
  text?: string
  className?: string
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12'
}

const colors = {
  cyan: 'text-neonCyan-400',
  pink: 'text-neonPink-500',
  green: 'text-neonGreen-500',
  purple: 'text-neonPurple-500',
  orange: 'text-neonOrange-500'
}

// 旋转加载器
export function CyberSpinner({ 
  size = 'md', 
  color = 'cyan', 
  className 
}: Pick<CyberLoadingProps, 'size' | 'color' | 'className'>) {
  return (
    <motion.div
      className={clsx(
        'border-2 border-transparent rounded-full',
        sizes[size],
        colors[color],
        className
      )}
      style={{
        borderTopColor: 'currentColor',
        borderRightColor: 'currentColor'
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  )
}

// 点状加载器
export function CyberDots({ 
  size = 'md', 
  color = 'cyan', 
  className 
}: Pick<CyberLoadingProps, 'size' | 'color' | 'className'>) {
  const dotSize = size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'
  
  return (
    <div className={clsx('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={clsx(
            'rounded-full',
            dotSize,
            colors[color],
            'bg-current'
          )}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )
}

// 脉冲加载器
export function CyberPulse({ 
  size = 'md', 
  color = 'cyan', 
  className 
}: Pick<CyberLoadingProps, 'size' | 'color' | 'className'>) {
  return (
    <motion.div
      className={clsx(
        'rounded-full border-2',
        sizes[size],
        colors[color],
        'border-current',
        className
      )}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.5, 1]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  )
}

// 终端风格加载器
export function CyberTerminalLoader({ 
  text = 'Loading', 
  color = 'green',
  className 
}: Pick<CyberLoadingProps, 'text' | 'color' | 'className'>) {
  return (
    <div className={clsx('font-mono', colors[color], className)}>
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {'>'} {text}
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          _
        </motion.span>
      </motion.span>
    </div>
  )
}

// 数据流加载器
export function CyberDataStream({ 
  className 
}: Pick<CyberLoadingProps, 'className'>) {
  return (
    <div className={clsx('relative w-full h-1 bg-cyber-800 rounded-full overflow-hidden', className)}>
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-neonCyan-400 to-transparent"
        animate={{ x: ['-100%', '300%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

// 主加载组件
export function CyberLoading({
  size = 'md',
  variant = 'spinner',
  color = 'cyan',
  text,
  className
}: CyberLoadingProps) {
  const LoadingComponent = {
    spinner: CyberSpinner,
    dots: CyberDots,
    pulse: CyberPulse,
    terminal: CyberTerminalLoader
  }[variant]

  return (
    <div className={clsx('flex flex-col items-center justify-center space-y-4', className)}>
      {variant === 'terminal' ? (
        <CyberTerminalLoader text={text} color={color} />
      ) : (
        <>
          <LoadingComponent size={size} color={color} />
          {text && (
            <div className={clsx('text-sm font-mono uppercase tracking-wider', colors[color])}>
              {text}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// 页面级加载组件
export function CyberPageLoader({ 
  text = 'Initializing System' 
}: { 
  text?: string 
}) {
  return (
    <div className="fixed inset-0 bg-cyber-950 flex items-center justify-center z-50">
      {/* 背景效果 */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neonCyan-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neonPink-500/10 rounded-full blur-3xl" />
      </div>
      
      {/* 加载内容 */}
      <div className="relative z-10 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-display font-bold cyber-title neon-text-pulse mb-4">
            RUNNING.EXE
          </h1>
          <CyberTerminalLoader text={text} />
        </motion.div>
        
        <div className="space-y-4">
          <CyberDataStream />
          <div className="flex justify-center space-x-8 text-xs font-mono text-gray-500">
            <span>LOADING_MODULES...</span>
            <span>SYNC_STATUS: OK</span>
            <span>MEMORY: 98%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// 骨架屏加载组件
export function CyberSkeleton({ 
  className,
  lines = 1,
  width = 'full'
}: { 
  className?: string
  lines?: number
  width?: 'full' | '3/4' | '1/2' | '1/4'
}) {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/4': 'w-1/4'
  }

  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'h-4 bg-cyber-800 rounded animate-pulse',
            i === lines - 1 && lines > 1 ? widthClasses['3/4'] : widthClasses[width]
          )}
        />
      ))}
    </div>
  )
}
