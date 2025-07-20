'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
  pulse?: boolean
  children: React.ReactNode
}

const variants = {
  primary: 'border-neonCyan-400 text-neonCyan-400 hover:bg-neonCyan-400 hover:text-black hover:shadow-neon-cyan',
  secondary: 'border-neonPink-500 text-neonPink-500 hover:bg-neonPink-500 hover:text-black hover:shadow-neon-pink',
  success: 'border-neonGreen-500 text-neonGreen-500 hover:bg-neonGreen-500 hover:text-black hover:shadow-neon-green',
  warning: 'border-neonOrange-500 text-neonOrange-500 hover:bg-neonOrange-500 hover:text-black hover:shadow-neon-orange',
  danger: 'border-red-500 text-red-500 hover:bg-red-500 hover:text-black hover:shadow-[0_0_15px_#ef4444]',
  ghost: 'border-transparent text-white hover:text-neonCyan-400 hover:shadow-neon-cyan hover:border-neonCyan-400'
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
}

export function CyberButton({
  variant = 'primary',
  size = 'md',
  glow = false,
  pulse = false,
  className,
  children,
  disabled,
  ...props
}: CyberButtonProps) {
  return (
    <motion.button
      className={clsx(
        // 基础样式
        'relative bg-transparent border-2 rounded-lg font-mono uppercase tracking-wider',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-950',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
        'overflow-hidden',
        
        // 变体样式
        variants[variant],
        
        // 尺寸样式
        sizes[size],
        
        // 发光效果
        glow && 'shadow-lg',
        
        // 脉冲效果
        pulse && 'animate-glow-pulse',
        
        className
      )}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      disabled={disabled}
      {...props}
    >
      {/* 数据流动效果 */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-data-stream animate-data-flow" />
      </div>
      
      {/* 按钮内容 */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      
      {/* 边框发光效果 */}
      {glow && (
        <div className="absolute inset-0 rounded-lg opacity-50 blur-sm bg-current" />
      )}
    </motion.button>
  )
}

// 预设按钮组件
export function CyberPrimaryButton(props: Omit<CyberButtonProps, 'variant'>) {
  return <CyberButton variant="primary" {...props} />
}

export function CyberSecondaryButton(props: Omit<CyberButtonProps, 'variant'>) {
  return <CyberButton variant="secondary" {...props} />
}

export function CyberSuccessButton(props: Omit<CyberButtonProps, 'variant'>) {
  return <CyberButton variant="success" {...props} />
}

export function CyberGhostButton(props: Omit<CyberButtonProps, 'variant'>) {
  return <CyberButton variant="ghost" {...props} />
}
