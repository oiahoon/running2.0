import Link from 'next/link'
import { RouteData, RouteEffort, calculateRouteFingerprint, getEffortColor } from '@/lib/routes'
import { useI18n } from '@/lib/i18n'
import { RouteGlyph } from './RouteGlyph'

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export interface RouteTileProps {
  activityId?: number | string
  href?: string
  title: string
  distanceLabel: string
  effort?: RouteEffort | string
  dateLabel?: string
  paceLabel?: string
  route?: RouteData | null
  className?: string
}

function RouteTileContent({
  title,
  distanceLabel,
  effort = 'unknown',
  dateLabel,
  paceLabel,
  route,
}: Omit<RouteTileProps, 'activityId' | 'href' | 'className'>) {
  const { t } = useI18n()
  const effortColor = getEffortColor(effort)
  const effortKey = `dashboard.effort.${String(effort || 'unknown').toLowerCase()}`
  const translatedEffort = t(effortKey)
  const effortLabel = translatedEffort === effortKey ? t('dashboard.effort.unknown') : translatedEffort
  const fingerprint = calculateRouteFingerprint(route)
  const shapeKey = fingerprint ? `route.shape.${fingerprint.shapeLabel}` : 'dashboard.routeShape'
  const translatedShape = t(shapeKey)
  const shapeLabel = translatedShape === shapeKey ? t('dashboard.routeShape') : translatedShape

  return (
    <>
      <div className="aspect-[4/3] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg)]">
        <RouteGlyph
          route={route}
          effort={effort}
          maxPoints={120}
          padding={20}
          strokeWidth={4}
          animate={false}
          label={`${title} ${t('dashboard.routeShape')}`}
          emptyLabel={t('route.noShape')}
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-[var(--text-strong)]">{title}</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{dateLabel || paceLabel || t('routes.archive')}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-lg font-semibold tabular-nums text-[var(--text-strong)]">{distanceLabel}</div>
          <div className="mt-1 inline-flex rounded-full border border-[var(--line)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: effortColor }}>
            {effortLabel}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
        <span>{paceLabel && dateLabel ? paceLabel : shapeLabel}</span>
        {fingerprint ? (
          <span className="shrink-0 tabular-nums">
            {t('routes.shapeScore', { score: (fingerprint.complexity * 100).toFixed(0) })}
          </span>
        ) : null}
      </div>
    </>
  )
}

export function RouteTile({
  activityId,
  href,
  title,
  distanceLabel,
  effort = 'unknown',
  dateLabel,
  paceLabel,
  route,
  className,
}: RouteTileProps) {
  const destination = href ?? (activityId ? `/activities/${activityId}` : undefined)
  const tileClassName = classNames(
    'route-tile block h-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-left shadow-[0_8px_24px_rgba(15,23,42,0.08)] outline-none transition-[transform,border-color,background-color,box-shadow] dark:shadow-none',
    'hover:-translate-y-0.5 hover:border-[var(--route-green)] hover:bg-[var(--surface-raised)] focus-visible:ring-2 focus-visible:ring-[var(--route-green)] motion-reduce:hover:translate-y-0',
    className
  )

  if (destination) {
    return (
      <Link href={destination} className={tileClassName}>
        <RouteTileContent
          title={title}
          distanceLabel={distanceLabel}
          effort={effort}
          dateLabel={dateLabel}
          paceLabel={paceLabel}
          route={route}
        />
      </Link>
    )
  }

  return (
    <div className={tileClassName}>
      <RouteTileContent
        title={title}
        distanceLabel={distanceLabel}
        effort={effort}
        dateLabel={dateLabel}
        paceLabel={paceLabel}
        route={route}
      />
    </div>
  )
}
