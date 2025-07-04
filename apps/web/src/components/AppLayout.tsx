'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  ChartBarIcon, 
  MapIcon, 
  ListBulletIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'
import { useTheme } from 'next-themes'
import { PageContainer } from './PageContainer'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Activities', href: '/activities', icon: ListBulletIcon },
  { name: 'Statistics', href: '/stats', icon: ChartBarIcon },
  { name: 'Map', href: '/map', icon: MapIcon },
  { name: 'Sync', href: '/sync', icon: ArrowPathIcon },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-md p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
    >
      <span className="sr-only">Toggle theme</span>
      <SunIcon className="h-5 w-5 dark:hidden" />
      <MoonIcon className="h-5 w-5 hidden dark:block" />
    </button>
  )
}

function MobileNavigation({ 
  sidebarOpen, 
  setSidebarOpen 
}: { 
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void 
}) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-900">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    🏃‍♂️ Running Page
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={classNames(
                      isActive
                        ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white',
                      'group flex items-center px-3 py-2 text-sm font-medium border-l-4 rounded-r-md'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        isActive
                          ? 'text-blue-500 dark:text-blue-200'
                          : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300',
                        'mr-3 h-5 w-5'
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

function DesktopNavigation() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={classNames(
              isActive
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white',
              'group flex items-center px-3 py-2 text-sm font-medium border-l-4 rounded-r-md'
            )}
          >
            <item.icon
              className={classNames(
                isActive
                  ? 'text-blue-500 dark:text-blue-200'
                  : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300',
                'mr-3 h-5 w-5'
              )}
            />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Navigation */}
      <MobileNavigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 pt-5 pb-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              🏃‍♂️ Running Page 2.0
            </span>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <div className="flex-grow px-3">
              <DesktopNavigation />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Navigation */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-900 shadow border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </div>
                  <input
                    id="search-field"
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent bg-transparent"
                    placeholder="Search activities..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <ThemeToggle />
              
              {/* Profile dropdown placeholder */}
              <div className="ml-3 relative">
                <div className="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <svg className="h-full w-full text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          <div className="py-6">
            <PageContainer maxWidth="full">
              {children}
            </PageContainer>
          </div>
        </main>
      </div>
    </div>
  )
}
