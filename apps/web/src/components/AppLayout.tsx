'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowPathIcon,
  Bars3Icon,
  ChartBarIcon,
  CircleStackIcon,
  HomeIcon,
  ListBulletIcon,
  MapIcon,
  MoonIcon,
  SparklesIcon,
  SunIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useTheme } from 'next-themes'

const navGroups = [
  {
    label: 'Atlas',
    items: [
      { name: 'Route Wall', href: '/dashboard', icon: HomeIcon },
      { name: 'Route Gallery', href: '/routes', icon: MapIcon },
      { name: 'Posters', href: '/posters', icon: SparklesIcon },
      { name: 'Stats Lab', href: '/stats', icon: ChartBarIcon },
    ],
  },
  {
    label: 'Training',
    items: [
      { name: 'Runs', href: '/activities', icon: ListBulletIcon },
      { name: 'Route Map', href: '/map', icon: MapIcon },
    ],
  },
  {
    label: 'Sync',
    items: [
      { name: 'Sync', href: '/sync', icon: ArrowPathIcon },
      { name: 'Sync Sources', href: '/data-sources', icon: CircleStackIcon },
    ],
  },
]

const pageCopy: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Route Wall', subtitle: 'A route-first atlas of shapes, effort, pace, and progress.' },
  '/routes': { title: 'Route Gallery', subtitle: 'Browse GPS route shapes by effort, year, and recency.' },
  '/posters': { title: 'Posters', subtitle: 'Weekly and monthly route artifacts generated from GPS shape data.' },
  '/activities': { title: 'Runs', subtitle: 'Chronological training archive for search, scan, and comparison.' },
  '/stats': { title: 'Stats Lab', subtitle: 'Designed fields, rhythms, records, and route-derived training insight.' },
  '/map': { title: 'Route Map', subtitle: 'Spatial exploration, trajectory context, and route review.' },
  '/sync': { title: 'Sync', subtitle: 'Connection health, manual sync, and operation history.' },
  '/data-sources': { title: 'Sync Sources', subtitle: 'Integration lifecycle and source configuration.' },
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="action-ghost"
      aria-label="Toggle theme"
    >
      <SunIcon className="h-5 w-5 dark:hidden" />
      <MoonIcon className="hidden h-5 w-5 dark:block" />
    </button>
  )
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-6">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] text-sm font-black text-[var(--route-green)]">R2</span>
          <div>
            <div className="text-lg font-semibold tracking-tight text-[var(--text-strong)]">RUN2 Atlas</div>
            <div className="text-xs text-[var(--text-muted)]">Every run leaves a shape</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{group.label}</div>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onNavigate}
                    className={classNames(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
                      isActive
                        ? 'bg-[var(--route-green)]/10 text-[var(--text-strong)] ring-1 ring-inset ring-[var(--route-green)]/35'
                        : 'text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--text-strong)] dark:hover:bg-white/5'
                    )}
                  >
                    <item.icon className={classNames('h-5 w-5', isActive ? 'text-[var(--route-green)]' : 'text-slate-400 group-hover:text-slate-600 dark:text-gray-500 dark:group-hover:text-gray-300')} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-5 py-4 dark:border-white/10">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>System</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-emerald-300 ring-1 ring-emerald-400/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Online
          </span>
        </div>
      </div>
    </div>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const pageMeta = useMemo(() => {
    return pageCopy[pathname] || { title: 'Running Page 2.0', subtitle: 'Training intelligence workspace.' }
  }, [pathname])

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />
          <aside className="relative h-full w-[86%] max-w-[320px] border-r border-slate-200 bg-[var(--sidebar-bg)] shadow-2xl dark:border-white/10">
            <div className="absolute right-3 top-3">
              <button onClick={() => setSidebarOpen(false)} className="action-ghost" aria-label="Close sidebar">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <aside className="hidden border-r border-slate-200 bg-[var(--sidebar-bg)] dark:border-white/10 lg:block lg:w-[290px]">
        <SidebarContent pathname={pathname} />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-[var(--header-bg)]/95 backdrop-blur dark:border-white/10">
          <div className="mx-auto flex h-[84px] w-full max-w-[1360px] items-center gap-4 px-4 sm:px-6 lg:px-10">
            <button
              onClick={() => setSidebarOpen(true)}
              className="action-ghost lg:hidden"
              aria-label="Open sidebar"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="truncate text-[28px] font-semibold leading-none tracking-tight text-[var(--text-strong)]">{pageMeta.title}</div>
              <div className="mt-1 truncate text-sm text-[var(--text-muted)]">{pageMeta.subtitle}</div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/sync" className="action-secondary">Sync</Link>
              <Link href="/map" className="action-primary">Route Map</Link>
            </div>

            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1360px] px-4 pb-8 pt-6 sm:px-6 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
