'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

function isCurrentRoute(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`))
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { t } = useI18n()

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-6">
        <Run2Logo onClick={onNavigate} />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6" aria-label={t('shell.primaryNavigation')}>
        {navGroups.map((group) => (
          <div key={group.labelKey}>
            <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{t(group.labelKey)}</div>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const isActive = isCurrentRoute(pathname, item.href)
                return (
                  <Link
                    key={item.nameKey}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? 'page' : undefined}
                    className={classNames(
                      'group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--route-green)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar-bg)]',
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

function DesktopNavigation({ pathname }: { pathname: string }) {
  const { t } = useI18n()

  return (
    <nav className="desktop-navigation hidden min-w-0 flex-1 items-stretch min-[1380px]:flex" aria-label={t('shell.primaryNavigation')}>
      {navGroups.map((group) => (
        <div key={group.labelKey} className="desktop-nav-group flex items-center gap-1 border-l border-[var(--line)] px-4 first:border-l-0">
          <span className="desktop-nav-group-label mr-2 shrink-0 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {t(group.labelKey)}
          </span>
          {group.items.map((item) => {
            const isActive = isCurrentRoute(pathname, item.href)
            return (
              <Link
                key={item.nameKey}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={classNames(
                  'desktop-nav-link relative inline-flex h-11 items-center whitespace-nowrap px-2.5 text-[13px] font-medium transition-colors after:absolute after:inset-x-2 after:bottom-0 after:h-px after:scale-x-0 after:bg-[var(--route-green)] after:transition-transform focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--route-green)]',
                  isActive
                    ? 'text-[var(--text-strong)] after:scale-x-100'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
                )}
              >
                {t(item.nameKey)}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarDialogRef = useRef<HTMLDivElement>(null)
  const closeSidebarButtonRef = useRef<HTMLButtonElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const pathname = usePathname()
  const { t } = useI18n()

  const pageMeta = useMemo(() => {
    const copy = pageCopy[pathname] || { titleKey: 'page.default.title', subtitleKey: 'page.default.subtitle' }
    return { title: t(copy.titleKey), subtitle: t(copy.subtitleKey) }
  }, [pathname, t])

  useEffect(() => {
    if (!sidebarOpen) return

    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusFrame = window.requestAnimationFrame(() => closeSidebarButtonRef.current?.focus())

    function handleDialogKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setSidebarOpen(false)
        return
      }

      if (event.key !== 'Tab') return
      const focusableElements = Array.from(
        sidebarDialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]):not([tabindex="-1"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) || []
      )
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleDialogKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleDialogKeyDown)
      document.body.style.overflow = previousOverflow
      restoreFocusRef.current?.focus()
      restoreFocusRef.current = null
    }
  }, [sidebarOpen])

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div
          ref={sidebarDialogRef}
          className="fixed inset-0 z-50 min-[1380px]:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t('shell.primaryNavigation')}
        >
          <button className="absolute inset-0 bg-black/50" tabIndex={-1} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
          <aside className="relative h-full w-[86%] max-w-[320px] border-r border-slate-200 bg-[var(--sidebar-bg)] shadow-2xl dark:border-white/10">
            <div className="absolute right-3 top-3">
              <button ref={closeSidebarButtonRef} onClick={() => setSidebarOpen(false)} className="action-ghost" aria-label={t('shell.closeSidebar')}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div
        className="flex min-h-screen min-w-0 flex-1 flex-col"
        inert={sidebarOpen ? true : undefined}
        aria-hidden={sidebarOpen ? true : undefined}
      >
        <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--header-bg)]/95 backdrop-blur-xl">
          <div className="flex h-16 w-full items-center gap-3 px-4 sm:h-[72px] sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="action-ghost min-[1380px]:hidden"
              aria-label={t('shell.openSidebar')}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <Run2Logo compact showTagline={false} className="shrink-0 min-[360px]:hidden" />
            <Run2Logo showTagline={false} className="hidden shrink-0 pr-2 min-[360px]:flex" />

            <DesktopNavigation pathname={pathname} />

            <div className="min-w-0 flex-1 min-[1380px]:hidden">
              <div className="hidden truncate text-sm font-semibold tracking-tight text-[var(--text-strong)] md:block">{pageMeta.title}</div>
              <div className="mt-0.5 hidden truncate text-xs text-[var(--text-muted)] md:block">{pageMeta.subtitle}</div>
            </div>

            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <Link href="/sync" className="action-secondary h-10">{t('shell.quickSync')}</Link>
              <Link href="/map" className="action-primary h-10">{t('shell.quickMap')}</Link>
            </div>

            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1600px] px-4 pb-8 pt-5 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
