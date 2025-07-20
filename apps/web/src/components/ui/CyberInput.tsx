'use client'

import React, { forwardRef } from 'react'
import { clsx } from 'clsx'

export interface CyberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  glow?: boolean
  terminal?: boolean
  icon?: React.ReactNode
}

export const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(
  ({ label, error, glow = false, terminal = false, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className={clsx(
            'block text-sm font-mono uppercase tracking-wider',
            terminal ? 'text-neonGreen-500' : 'text-neonCyan-400'
          )}>
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={clsx(
              // 基础样式
              'w-full rounded-lg border-2 px-4 py-3 transition-all duration-300',
              'focus:outline-none focus:ring-0',
              'placeholder:text-gray-500 placeholder:font-mono',
              
              // 终端风格
              terminal ? [
                'bg-black border-neonGreen-500 text-neonGreen-500',
                'focus:border-neonGreen-400 focus:shadow-neon-green',
                'font-mono'
              ] : [
                'bg-cyber-900/50 border-cyber-700 text-white',
                'focus:border-neonCyan-400 focus:shadow-neon-cyan',
                'backdrop-blur-sm'
              ],
              
              // 发光效果
              glow && 'shadow-lg',
              
              // 图标偏移
              icon && 'pl-10',
              
              // 错误状态
              error && 'border-red-500 focus:border-red-400',
              
              className
            )}
            {...props}
          />
          
          {/* 扫描线效果 */}
          {terminal && (
            <div 
              className="absolute inset-0 pointer-events-none rounded-lg"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(34, 197, 94, 0.03) 2px,
                  rgba(34, 197, 94, 0.03) 4px
                )`
              }}
            />
          )}
        </div>
        
        {error && (
          <p className="text-red-400 text-sm font-mono">
            {error}
          </p>
        )}
      </div>
    )
  }
)

CyberInput.displayName = 'CyberInput'

// 搜索输入框组件
export function CyberSearchInput({
  placeholder = "Search...",
  onSearch,
  className,
  ...props
}: Omit<CyberInputProps, 'type'> & {
  onSearch?: (value: string) => void
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(e.currentTarget.value)
    }
  }

  return (
    <CyberInput
      type="search"
      placeholder={placeholder}
      onKeyDown={handleKeyDown}
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      className={className}
      {...props}
    />
  )
}

// 终端输入框组件
export function CyberTerminalInput(props: Omit<CyberInputProps, 'terminal'>) {
  return <CyberInput terminal {...props} />
}
