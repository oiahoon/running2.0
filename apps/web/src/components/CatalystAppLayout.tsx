'use client'

import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useUserInfo } from '@/lib/hooks/useUserInfo'
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
        d="M15 7.5c0 4.142-3.358 7.5-7.5 7.5S0 11.642 0 7.5 3.358 0 7.5 0 15 3.358 15 7.5ZM7.5 1.5C4.186 1.5 1.5 4.186 1.5 7.5S4.186 13.5 7.5 13.5 13.5 10.814 13.5 7.5 10.814 1.5 7.5 1.5Z"
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
        d="M2 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm3.75-1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5ZM2 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm3.75-1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5ZM2 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm3.75-1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z"
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
        d="M13.854 2.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L12.293 3H8.5A4.5 4.5 0 0 0 4 7.5a.5.5 0 0 1-1 0A5.5 5.5 0 0 1 8.5 2h3.793l-2.147-2.146a.5.5 0 0 1 .708-.708l3 3ZM2.146 13.854a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708.708L3.707 13H7.5A4.5 4.5 0 0 0 12 8.5a.5.5 0 0 1 1 0A5.5 5.5 0 0 1 7.5 14H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function SunIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M8 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 1ZM10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM12.01 4.01a.75.75 0 0 1 0 1.06L10.95 6.12a.75.75 0 1 1-1.06-1.06l1.06-1.05a.75.75 0 0 1 1.06 0ZM12.01 11.99a.75.75 0 0 1-1.06 0L9.88 10.93a.75.75 0 1 1 1.06-1.06l1.07 1.06a.75.75 0 0 1 0 1.06ZM4.01 12.01a.75.75 0 0 1 0-1.06L5.07 9.88a.75.75 0 0 1 1.06 1.06L5.07 11.99a.75.75 0 0 1-1.06 0ZM1 8a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 1 8ZM4.01 4.01a.75.75 0 0 1 1.06 0L6.12 5.07a.75.75 0 1 1-1.06 1.06L4.01 5.07a.75.75 0 0 1 0-1.06ZM15 8a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 15 8ZM8 14a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 14Z" />
    </svg>
  )
}

function MoonIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M14.438 10.148c.19-.425-.321-.787-.748-.601A5.5 5.5 0 0 1 6.453 2.31c.186-.427-.176-.938-.6-.748a6.501 6.501 0 1 0 8.585 8.586Z" />
    </svg>
  )
}

function MagnifyingGlassIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
        clipRule="evenodd"
      />
    </svg>
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
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </Button>
  )
}

function SearchField() {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 size-4 text-zinc-500" />
      <input
        type="search"
        placeholder="Search activities..."
        className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
      />
    </div>
  )
}

export function CatalystAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const userInfo = useUserInfo()

  return (
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
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 max-lg:hidden">
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
            
            {/* User Dropdown - Always Visible */}
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar src={userInfo.avatar} initials={userInfo.name.charAt(0)} className="size-8" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                      {userInfo.name}
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                      @{userInfo.username}
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
      {children}
    </SidebarLayout>
  )
}
