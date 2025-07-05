'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useUserInfo } from '@/lib/hooks/useUserInfo'
import { Avatar } from './catalyst'

// Icons
function HomeIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h1.5a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5H11a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function MapIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M8.914 6.025a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0ZM7.04 2.282c2.123 0 3.844 1.721 3.844 3.844 0 2.123-1.721 3.844-3.844 3.844S3.196 8.249 3.196 6.126c0-2.123 1.721-3.844 3.844-3.844ZM1.25 14.5a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1-.75-.75Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ListBulletIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M2 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm3.75-1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5ZM2 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm3.75-1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5ZM2 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm3.75-1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ChartBarIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M1.75 12.5a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H1.75ZM4 9a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v2.25H4V9ZM6.75 6.5a.75.75 0 0 0-.75.75v4h2V7.25a.75.75 0 0 0-.75-.75h-.5ZM9 8.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v3H9v-3ZM11.75 3.5a.75.75 0 0 0-.75.75v7h2V4.25a.75.75 0 0 0-.75-.75h-.5Z" />
    </svg>
  )
}

function ArrowPathIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function MenuIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function XIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

interface MobileNavigationProps {
  className?: string
}

export default function MobileNavigation({ className = '' }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const userInfo = useUserInfo()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Map', href: '/map', icon: MapIcon },
    { name: 'Activities', href: '/activities', icon: ListBulletIcon },
    { name: 'Statistics', href: '/stats', icon: ChartBarIcon },
    { name: 'Sync', href: '/sync', icon: ArrowPathIcon },
  ]

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Mobile Navigation Header - Only visible on mobile */}
      <div className={`lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500 text-white">
              🏃‍♂️
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Running Page 2.0
            </h1>
          </div>

          {/* Menu Button */}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={closeMenu}>
          <div 
            className="fixed inset-y-0 left-0 w-80 max-w-full bg-white dark:bg-gray-900 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500 text-white">
                  🏃‍♂️
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Running Page 2.0
                </h2>
              </div>
              <button
                onClick={closeMenu}
                className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close navigation menu"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* User Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-4">
                <Avatar src={userInfo.avatar} initials={userInfo.name.charAt(0)} className="size-10" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {userInfo.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {userInfo.email}
                  </p>
                </div>
              </div>

              {/* User Actions */}
              <div className="space-y-2">
                <Link
                  href="/sync"
                  onClick={closeMenu}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>Sync Data</span>
                </Link>
                <a
                  href="https://github.com/oiahoon/running2.0"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>GitHub Repository</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
