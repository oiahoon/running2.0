'use client'

import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useUserInfo } from '@/lib/hooks/useUserInfo'
import MobileNavigation from './MobileNavigation'
import {
  SidebarLayout,
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
  Avatar,
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  Button,
} from './catalyst'

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

function ChartBarIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M1.75 12.5a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H1.75ZM4 9a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v2.25H4V9ZM6.75 6.5a.75.75 0 0 0-.75.75v4h2V7.25a.75.75 0 0 0-.75-.75h-.5ZM9 8.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v3H9v-3ZM11.75 3.5a.75.75 0 0 0-.75.75v7h2V4.25a.75.75 0 0 0-.75-.75h-.5Z" />
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

function SearchField() {
  return (
    <div className="relative">
      <input
        type="search"
        placeholder="Search..."
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      plain
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </Button>
  )
}

export function CatalystAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const userInfo = useUserInfo()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Custom Mobile Navigation */}
      <MobileNavigation />
      
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <SidebarLayout
          navbar={
            <Navbar>
              <NavbarSection>
                <div className="max-w-md">
                  <SearchField />
                </div>
              </NavbarSection>
              <NavbarSpacer />
              <NavbarSection>
                <ThemeToggle />
                <Dropdown>
                  <DropdownButton as={NavbarItem}>
                    <Avatar src={userInfo.avatar} initials={userInfo.name.charAt(0)} className="size-8" />
                  </DropdownButton>
                  <DropdownMenu className="min-w-64" anchor="bottom end">
                    <DropdownItem href="/dashboard">
                      <Avatar src={userInfo.avatar} initials={userInfo.name.charAt(0)} className="size-6" />
                      <DropdownLabel>Dashboard</DropdownLabel>
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem href="/sync">
                      <DropdownLabel>Sync Data</DropdownLabel>
                    </DropdownItem>
                    <DropdownItem href="https://github.com/oiahoon/running2.0" target="_blank">
                      <DropdownLabel>🔗 GitHub Repository</DropdownLabel>
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem href="/logout">
                      <DropdownLabel>Sign out</DropdownLabel>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavbarSection>
            </Navbar>
          }
          sidebar={
            <Sidebar>
              <SidebarHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500 text-white">
                    🏃‍♂️
                  </div>
                  <SidebarLabel>Running Page 2.0</SidebarLabel>
                </div>
              </SidebarHeader>

              <SidebarBody>
                <SidebarSection>
                  <SidebarItem href="/dashboard" current={pathname === '/dashboard'}>
                    <HomeIcon className="w-5 h-5" />
                    <SidebarLabel>Dashboard</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/map" current={pathname === '/map'}>
                    <MapIcon className="w-5 h-5" />
                    <SidebarLabel>Map</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/activities" current={pathname === '/activities'}>
                    <ListBulletIcon className="w-5 h-5" />
                    <SidebarLabel>Activities</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/stats" current={pathname === '/stats'}>
                    <ChartBarIcon className="w-5 h-5" />
                    <SidebarLabel>Statistics</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/sync" current={pathname === '/sync'}>
                    <ArrowPathIcon className="w-5 h-5" />
                    <SidebarLabel>Sync</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>
              </SidebarBody>

              <SidebarFooter>
                {/* GitHub Link - Desktop Only */}
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href="https://github.com/oiahoon/running2.0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                  >
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        Running Page 2.0
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        View on GitHub
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                </div>
                
                {/* User Dropdown */}
                <Dropdown>
                  <DropdownButton as={SidebarItem}>
                    <span className="flex min-w-0 items-center gap-3">
                      <Avatar src={userInfo.avatar} initials={userInfo.name.charAt(0)} className="size-8" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                          {userInfo.name}
                        </span>
                        <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                          {userInfo.email}
                        </span>
                      </span>
                    </span>
                  </DropdownButton>
                  <DropdownMenu className="min-w-64" anchor="top start">
                    <DropdownItem href="/dashboard">
                      <DropdownLabel>Dashboard</DropdownLabel>
                    </DropdownItem>
                    <DropdownItem href="/sync">
                      <DropdownLabel>Sync Data</DropdownLabel>
                    </DropdownItem>
                    <DropdownItem href="https://github.com/oiahoon/running2.0" target="_blank">
                      <DropdownLabel>🔗 GitHub Repository</DropdownLabel>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </SidebarFooter>
            </Sidebar>
          }
        >
          <div className="mx-auto max-w-6xl">{children}</div>
        </SidebarLayout>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden">
        <main className="px-4 py-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default CatalystAppLayout
