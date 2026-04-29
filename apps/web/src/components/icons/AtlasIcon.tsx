import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export type AtlasIconName =
  | 'run'
  | 'walk'
  | 'hike'
  | 'ride'
  | 'swim'
  | 'strength'
  | 'yoga'
  | 'workout'
  | 'rowing'
  | 'other'
  | 'map'
  | 'pin'
  | 'calendar'
  | 'warning'
  | 'finish'
  | 'records'
  | 'chart'
  | 'trend'
  | 'heatmap'
  | 'pace'
  | 'sync'
  | 'source'
  | 'route'
  | 'poster'
  | 'distance'
  | 'time'
  | 'elevation'
  | 'search'
  | 'satellite'
  | 'sun'
  | 'moon'
  | 'export'
  | 'center'

type IconProps = ComponentPropsWithoutRef<'svg'> & {
  name: AtlasIconName | string
  title?: string
}

function glyph(name: string): ReactNode {
  switch (name) {
    case 'run':
      return (
        <>
          <path d="M13.2 4.4a1.6 1.6 0 1 0 0 .1" />
          <path d="M10.8 8.2l3.4 1.6 2.2 3.1" />
          <path d="M12.4 9.1l-2.1 3.1 3.9 1.8-1.4 4.4" />
          <path d="M10.1 12.3l-3.5.8" />
          <path d="M8.8 18.3l3.2-3.8" />
        </>
      )
    case 'walk':
      return (
        <>
          <path d="M12.5 4.4a1.5 1.5 0 1 0 0 .1" />
          <path d="M11.7 7.8l-1.4 4.4 2.8 2.6" />
          <path d="M10.3 12.2l-1.9 5.4" />
          <path d="M12.2 8.1l3 2.1 1.5 2.4" />
          <path d="M13.1 14.8l3.4 3.1" />
        </>
      )
    case 'hike':
      return (
        <>
          <path d="M3.5 17.8l5.2-8.1 3.4 4.8 2.3-3.2 6.1 6.5" />
          <path d="M8.7 9.7l1.3 3.7" />
          <path d="M14.4 11.3l.7 3.2" />
          <path d="M5.4 17.8h13.2" />
        </>
      )
    case 'ride':
      return (
        <>
          <circle cx="7" cy="16.2" r="3.2" />
          <circle cx="17" cy="16.2" r="3.2" />
          <path d="M8.6 16.2l3-6.4 3.3 6.4" />
          <path d="M11.6 9.8h3.2" />
          <path d="M10.2 13.1h5.5" />
          <path d="M15.9 7.7h2.6" />
        </>
      )
    case 'swim':
      return (
        <>
          <path d="M4 14.5c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0" />
          <path d="M4 18.2c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0" />
          <path d="M9.2 10.6l3.4-4.1 3.2 3.4" />
          <path d="M12.6 6.5l3.7-1" />
        </>
      )
    case 'strength':
      return (
        <>
          <path d="M5 9.2v5.6" />
          <path d="M8 7.6v8.8" />
          <path d="M16 7.6v8.8" />
          <path d="M19 9.2v5.6" />
          <path d="M5 12h14" />
        </>
      )
    case 'yoga':
      return (
        <>
          <path d="M12 5.2a1.5 1.5 0 1 0 0 .1" />
          <path d="M8.5 10.1c2.1 1.4 4.9 1.4 7 0" />
          <path d="M12 8.5v5.1" />
          <path d="M6.5 18c2.2-3.1 4-4.5 5.5-4.5s3.3 1.4 5.5 4.5" />
          <path d="M8.2 17.9h7.6" />
        </>
      )
    case 'workout':
      return (
        <>
          <path d="M3.8 13h4l1.8-5 4.1 9 2.1-4h4.4" />
          <path d="M5.3 6.8h4" />
          <path d="M14.7 6.8h4" />
        </>
      )
    case 'rowing':
      return (
        <>
          <path d="M5 15.4c3.8 1.9 10.2 1.9 14 0" />
          <path d="M7.3 13.5l3.4-3.7 3 3.6" />
          <path d="M13.8 9l5.1-3.8" />
          <path d="M18.3 5.7l2 2.3" />
          <path d="M6 18.2h12" />
        </>
      )
    case 'map':
      return (
        <>
          <path d="M4.2 6.2l4.9-1.8 5.8 1.8 4.9-1.8v13.4l-4.9 1.8-5.8-1.8-4.9 1.8z" />
          <path d="M9.1 4.4v13.4" />
          <path d="M14.9 6.2v13.4" />
        </>
      )
    case 'pin':
      return (
        <>
          <path d="M12 21s6-5.3 6-11a6 6 0 0 0-12 0c0 5.7 6 11 6 11z" />
          <circle cx="12" cy="10" r="2" />
        </>
      )
    case 'calendar':
      return (
        <>
          <path d="M5 5.8h14v13.4H5z" />
          <path d="M8 3.8v4" />
          <path d="M16 3.8v4" />
          <path d="M5 9.2h14" />
          <path d="M8.2 13h.1M12 13h.1M15.8 13h.1M8.2 16.2h.1M12 16.2h.1" />
        </>
      )
    case 'warning':
      return (
        <>
          <path d="M12 4.2l8.2 14.2H3.8z" />
          <path d="M12 9v4.2" />
          <path d="M12 16.5h.1" />
        </>
      )
    case 'finish':
      return (
        <>
          <path d="M6 20V4.2" />
          <path d="M7 5h10l-2.1 3.2L17 11.5H7" />
          <path d="M10 7.2h2.2M13.8 9.3H16M9.8 11.5H12" />
        </>
      )
    case 'records':
      return (
        <>
          <path d="M8 5h8v3.5a4 4 0 0 1-8 0z" />
          <path d="M8 6.8H5.5c0 3 1.2 4.7 3.6 5" />
          <path d="M16 6.8h2.5c0 3-1.2 4.7-3.6 5" />
          <path d="M12 12.6v3.2" />
          <path d="M8.5 19h7" />
          <path d="M10 15.8h4" />
        </>
      )
    case 'chart':
      return (
        <>
          <path d="M5 19V5" />
          <path d="M5 19h14" />
          <path d="M8.2 15.8v-4.2" />
          <path d="M12 15.8V8.2" />
          <path d="M15.8 15.8v-6" />
        </>
      )
    case 'trend':
      return (
        <>
          <path d="M4.5 16.5l4.4-4.3 3.4 2.5 6.7-7.2" />
          <path d="M15.1 7.5H19v3.9" />
        </>
      )
    case 'heatmap':
      return (
        <>
          <path d="M5 5h3.2v3.2H5zM10.4 5h3.2v3.2h-3.2zM15.8 5H19v3.2h-3.2zM5 10.4h3.2v3.2H5zM10.4 10.4h3.2v3.2h-3.2zM15.8 10.4H19v3.2h-3.2zM5 15.8h3.2V19H5zM10.4 15.8h3.2V19h-3.2zM15.8 15.8H19V19h-3.2z" />
        </>
      )
    case 'pace':
      return (
        <>
          <path d="M5 14a7 7 0 1 1 14 0" />
          <path d="M12 14l4-4" />
          <path d="M7.5 19h9" />
        </>
      )
    case 'sync':
      return (
        <>
          <path d="M7.2 8.4a6.2 6.2 0 0 1 9.8-1.1l1.2 1.2" />
          <path d="M18.2 4.8v3.7h-3.7" />
          <path d="M16.8 15.6A6.2 6.2 0 0 1 7 16.7l-1.2-1.2" />
          <path d="M5.8 19.2v-3.7h3.7" />
        </>
      )
    case 'source':
      return (
        <>
          <ellipse cx="12" cy="6.5" rx="5.8" ry="2.6" />
          <path d="M6.2 6.5v5.2c0 1.4 2.6 2.6 5.8 2.6s5.8-1.2 5.8-2.6V6.5" />
          <path d="M6.2 11.7v5.2c0 1.4 2.6 2.6 5.8 2.6s5.8-1.2 5.8-2.6v-5.2" />
        </>
      )
    case 'poster':
      return (
        <>
          <path d="M6.2 4.5h11.6v15H6.2z" />
          <path d="M8.8 8.2h6.4" />
          <path d="M8.8 15.8h6.4" />
          <path d="M9 12c1.3-2.1 2.6 2 3.9 0s2.3-.5 3.1.5" />
        </>
      )
    case 'distance':
      return (
        <>
          <path d="M4.5 15.5c2.5-5.2 5.8 3.2 8.2-1.8s4.8-4.2 6.8-1" />
          <circle cx="4.5" cy="15.5" r="1.4" />
          <circle cx="19.5" cy="12.7" r="1.4" />
        </>
      )
    case 'time':
      return (
        <>
          <circle cx="12" cy="12" r="7.2" />
          <path d="M12 7.6v4.7l3.2 2" />
        </>
      )
    case 'elevation':
      return (
        <>
          <path d="M4 18.2l5.1-8 3.1 4.3 2.4-3.3 5.4 7" />
          <path d="M4 18.2h16" />
          <path d="M9.1 10.2l.8 2.9" />
        </>
      )
    case 'search':
      return (
        <>
          <circle cx="10.5" cy="10.5" r="5.8" />
          <path d="M15.1 15.1l4.1 4.1" />
        </>
      )
    case 'satellite':
      return (
        <>
          <path d="M8 8l8 8" />
          <path d="M6.2 9.8l3.6-3.6 8 8-3.6 3.6z" />
          <path d="M5 5l3 3" />
          <path d="M16 19l3 3" />
          <path d="M15.5 5.5c2 0 3 1 3 3" />
          <path d="M15.5 2.8c3.8 0 5.7 1.9 5.7 5.7" />
        </>
      )
    case 'sun':
      return (
        <>
          <circle cx="12" cy="12" r="3.3" />
          <path d="M12 3.8v2M12 18.2v2M3.8 12h2M18.2 12h2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M17.8 6.2l-1.4 1.4M7.6 16.4l-1.4 1.4" />
        </>
      )
    case 'moon':
      return <path d="M18.4 15.8A7.1 7.1 0 0 1 8.2 5.6a7.1 7.1 0 1 0 10.2 10.2z" />
    case 'export':
      return (
        <>
          <path d="M12 4.5v9.2" />
          <path d="M8.5 8l3.5-3.5L15.5 8" />
          <path d="M5.2 13.5v5.2h13.6v-5.2" />
        </>
      )
    case 'center':
      return (
        <>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3.8v3M12 17.2v3M3.8 12h3M17.2 12h3" />
        </>
      )
    case 'route':
    default:
      return (
        <>
          <path d="M5 16.5c3.1-7.6 7.4 4.6 10.1-2.7 1.1-3 2.6-4.7 4.4-5.1" />
          <circle cx="5" cy="16.5" r="1.4" />
          <circle cx="19.5" cy="8.7" r="1.4" />
        </>
      )
  }
}

export function AtlasIcon({ name, title, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      className={className}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {glyph(name)}
    </svg>
  )
}

export function ActivityIcon({ type, className, title }: { type?: string; className?: string; title?: string }) {
  const normalized = String(type || 'other').toLowerCase()
  const name =
    normalized === 'run' || normalized === 'trailrun' || normalized === 'treadmill'
      ? 'run'
      : normalized === 'walk'
        ? 'walk'
        : normalized === 'hike'
          ? 'hike'
          : normalized === 'ride' || normalized === 'cycling'
            ? 'ride'
            : normalized === 'swim'
              ? 'swim'
              : normalized === 'weighttraining' || normalized === 'strength'
                ? 'strength'
                : normalized === 'yoga'
                  ? 'yoga'
                  : normalized === 'workout' || normalized === 'crosstraining' || normalized === 'elliptical'
                    ? 'workout'
                    : normalized === 'rowing'
                      ? 'rowing'
                      : 'other'

  return <AtlasIcon name={name} title={title} className={className} />
}
