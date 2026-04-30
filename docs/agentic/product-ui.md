# Product/UI Context

Read this for UI, UX, layout, theme, and page workflow tasks.

## Product Direction

- Quiet, minimal, data-first running dashboard.
- Keep map, static route gallery, activity ledger, statistics, sync, and data-source workflows.
- Avoid old cyber/neon direction for active product surfaces.
- UI should feel like an operational workspace, not a marketing page.

## Active Shell

- Root layout: `apps/web/src/app/layout.tsx`
- Providers: `apps/web/src/app/providers.tsx`
- Active app shell: `apps/web/src/components/AppLayout.tsx`
- Global styles/tokens: `apps/web/src/app/globals.css`

`AppLayout` owns:
- grouped sidebar navigation
- sticky contextual header
- mobile drawer
- theme toggle
- contextual quick actions

## Theme Rules

- Theme provider uses `next-themes` with class strategy.
- Use `resolvedTheme` for toggles, not raw `theme`, because `theme` can be `system`.
- Light/dark core tokens live in `globals.css`:
  - `--bg-0`, `--bg-1`, `--bg-2`
  - `--surface`, `--surface-2`
  - `--sidebar-bg`, `--header-bg`
  - `--border`
  - `--text-strong`, `--text-muted`
- Prefer `text-[var(--text-strong)]` and `text-[var(--text-muted)]` for app-shell pages.

## Shared UI Utilities

- `.panel`
- `.panel-header`
- `.panel-body`
- `.metric-label`
- `.metric-value`
- `.action-primary`
- `.action-secondary`
- `.action-ghost`
- `.section-title`
- `.section-subtitle`

Use these before adding new one-off card/button styles.

## Active Pages

- `/dashboard`: `apps/web/src/app/dashboard/page.tsx`, implementation in `dashboard/CyberDashboard.tsx` despite the legacy filename.
- `/activities`: `apps/web/src/app/activities/page.tsx`
- `/stats`: `apps/web/src/app/stats/page.tsx`
- `/map`: `apps/web/src/app/map/page.tsx`
- `/sync`: `apps/web/src/app/sync/page.tsx`
- `/data-sources`: `apps/web/src/app/data-sources/page.tsx`
- `/sync-status`: `apps/web/src/app/sync-status/page.tsx`

## Component Areas

- Charts: `apps/web/src/components/charts/`
- Map views: `apps/web/src/components/maps/`
- Catalyst primitives: `apps/web/src/components/catalyst/`
- Legacy cyber primitives: `apps/web/src/components/ui/` and some `Cyber*` files.

Legacy cyber primitives are not the active visual direction. Reuse them only when a task explicitly touches them.

## UI Guardrails

- Keep sections dense and scannable.
- Do not remove route/map functionality during visual changes.
- Avoid decorative glow, scanlines, and neon-heavy styling.
- Keep tables readable in light and dark mode.
- Avoid introducing new nested card layouts.
- For form controls, make light mode text explicit; do not rely on inherited dark text classes.
- Dashboard route constellations may animate real route polylines, but should stay route-atlas themed: dark map grid, subdued ghost traces, sequential colored route highlights, and `prefers-reduced-motion` compatibility.
- Stats consistency heatmaps should use a GitHub-style calendar: continuous week columns, weekday labels, month markers, fixed small cells, horizontal scrolling for the selected year, and a compact Less/More intensity legend.
