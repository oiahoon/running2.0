import Link from 'next/link'

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function Run2Mark({ className, title = 'RUN2 Atlas' }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label={title} className={classNames('block', className)}>
      <rect width="48" height="48" rx="12" fill="var(--surface-raised)" />
      <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="11.25" fill="none" stroke="var(--line)" strokeWidth="1.5" />
      <path
        d="M11 31.5c5.2-12.8 12.5 7.6 17.3-4.8 2.2-5.8 4.8-8.9 8.7-9.9"
        fill="none"
        stroke="var(--route-green)"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="31.5" r="3" fill="var(--route-cyan)" />
      <circle cx="37" cy="16.8" r="3" fill="var(--route-green)" />
      <path d="M15 14h9.8c3.2 0 5.1 1.7 5.1 4.2 0 2.8-2.1 4.3-5.4 4.3H19v8.6" fill="none" stroke="var(--text-strong)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.72" />
    </svg>
  )
}

export function Run2Logo({ compact = false, className, onClick }: { compact?: boolean; className?: string; onClick?: () => void }) {
  return (
    <Link href="/dashboard" onClick={onClick} className={classNames('flex items-center gap-2', className)}>
      <Run2Mark className="h-8 w-8" />
      {compact ? null : (
        <div>
          <div className="text-lg font-semibold tracking-tight text-[var(--text-strong)]">RUN2 Atlas</div>
          <div className="text-xs text-[var(--text-muted)]">Every run leaves a shape</div>
        </div>
      )}
    </Link>
  )
}
