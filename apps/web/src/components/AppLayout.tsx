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
  LanguageIcon,
  ListBulletIcon,
  MapIcon,
  MoonIcon,
  SparklesIcon,
  SunIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useTheme } from 'next-themes'
import { Run2Logo } from '@/components/icons/Run2Logo'
import { useI18n } from '@/lib/i18n'

const navGroups = [
  {
    labelKey: 'nav.group.atlas',
    items: [
      { nameKey: 'nav.routeWall', href: '/dashboard', icon: HomeIcon },
      { nameKey: 'nav.routeGallery', href: '/routes', icon: MapIcon },
      { nameKey: 'nav.posters', href: '/posters', icon: SparklesIcon },
      { nameKey: 'nav.statsLab', href: '/stats', icon: ChartBarIcon },
    ],
  },
  {
    labelKey: 'nav.group.training',
    items: [
      { nameKey: 'nav.runs', href: '/activities', icon: ListBulletIcon },
      { nameKey: 'nav.routeMap', href: '/map', icon: MapIcon },
    ],
  },
  {
    labelKey: 'nav.group.sync',
    items: [
      { nameKey: 'nav.sync', href: '/sync', icon: ArrowPathIcon },
      { nameKey: 'nav.syncSources', href: '/data-sources', icon: CircleStackIcon },
    ],
  },
]

const pageCopy: Record<string, { titleKey: string; subtitleKey: string }> = {
  '/dashboard': { titleKey: 'page.dashboard.title', subtitleKey: 'page.dashboard.subtitle' },
  '/routes': { titleKey: 'page.routes.title', subtitleKey: 'page.routes.subtitle' },
  '/posters': { titleKey: 'page.posters.title', subtitleKey: 'page.posters.subtitle' },
  '/activities': { titleKey: 'page.activities.title', subtitleKey: 'page.activities.subtitle' },
  '/stats': { titleKey: 'page.stats.title', subtitleKey: 'page.stats.subtitle' },
  '/map': { titleKey: 'page.map.title', subtitleKey: 'page.map.subtitle' },
  '/sync': { titleKey: 'page.sync.title', subtitleKey: 'page.sync.subtitle' },
  '/data-sources': { titleKey: 'page.sources.title', subtitleKey: 'page.sources.subtitle' },
  '/sync-status': { titleKey: 'page.syncStatus.title', subtitleKey: 'page.syncStatus.subtitle' },
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useI18n()

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="action-ghost"
      aria-label={t('theme.toggle')}
    >
      <SunIcon className="h-5 w-5 dark:hidden" />
      <MoonIcon className="hidden h-5 w-5 dark:block" />
    </button>
  )
}

function LanguageToggle() {
  const { cycleLocale, localeLabel, locale, t } = useI18n()

  return (
    <button
      onClick={cycleLocale}
      className="action-ghost min-w-[3.25rem] gap-1.5"
      aria-label={t('language.toggle')}
      title={t('language.current', { language: localeLabel })}
    >
      <LanguageIcon className="h-5 w-5" />
      <span className="text-xs font-semibold uppercase">{locale}</span>
    </button>
  )
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { t } = useI18n()

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-6">
        <Run2Logo onClick={onNavigate} />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {navGroups.map((group) => (
          <div key={group.labelKey}>
            <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{t(group.labelKey)}</div>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.nameKey}
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
                    {t(item.nameKey)}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-5 py-4 dark:border-white/10">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>{t('shell.system')}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-emerald-300 ring-1 ring-emerald-400/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            {t('shell.online')}
          </span>
        </div>
      </div>
    </div>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useI18n()

  const pageMeta = useMemo(() => {
    const copy = pageCopy[pathname] || { titleKey: 'page.default.title', subtitleKey: 'page.default.subtitle' }
    return { title: t(copy.titleKey), subtitle: t(copy.subtitleKey) }
  }, [pathname, t])

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} aria-label={t('shell.closeSidebar')} />
          <aside className="relative h-full w-[86%] max-w-[320px] border-r border-slate-200 bg-[var(--sidebar-bg)] shadow-2xl dark:border-white/10">
            <div className="absolute right-3 top-3">
              <button onClick={() => setSidebarOpen(false)} className="action-ghost" aria-label={t('shell.closeSidebar')}>
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
              aria-label={t('shell.openSidebar')}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="truncate text-[28px] font-semibold leading-none tracking-tight text-[var(--text-strong)]">{pageMeta.title}</div>
              <div className="mt-1 truncate text-sm text-[var(--text-muted)]">{pageMeta.subtitle}</div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/sync" className="action-secondary">{t('shell.quickSync')}</Link>
              <Link href="/map" className="action-primary">{t('shell.quickMap')}</Link>
            </div>

            <LanguageToggle />
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
