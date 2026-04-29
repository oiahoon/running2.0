# Running Atlas Sprint Plan

Source brief: `/Users/huangyuyao/Downloads/running_page_cool_route_data_concept_v2.zip`

## Sprint 0 Discovery

- Product direction: route-first personal running data atlas, not an admin dashboard.
- Main app: `apps/web`, Next.js 16 + React 19.
- Styling: Tailwind plus shared utilities in `apps/web/src/app/globals.css`.
- Shell/navigation: `apps/web/src/components/AppLayout.tsx`.
- Current route data source: `activities.summary_polyline`.
- Local data check: 803 activities, 453 with non-empty `summary_polyline`.
- Current data caveat: runtime SQLite DB does not include `detailed_polyline`, so first implementation must rely on `summary_polyline` and degrade gracefully.

## Sprint Backlog

### Sprint 1 - Visual Foundation and Route Components

- Add running-atlas tokens for route colors and dark surfaces.
- Add route utility functions for polyline decoding, SVG normalization, path generation, sampling, and effort mapping.
- Add reusable `RouteGlyph` and `RouteTile` components.
- Acceptance: real polyline routes render inside stable SVG bounds; empty routes show designed placeholders; reduced motion is respected.

### Sprint 2 - Route Wall Homepage

- Replace dashboard-first homepage content with a route-dominant atlas view.
- Show large route constellation, compact yearly stats, latest run ticker, and CTA into route browsing.
- Acceptance: first viewport is route-led and stats are secondary.

### Sprint 3 - Route Gallery and Activity Poster

- Add route gallery experience with filters for all/easy/tempo/long/new/year.
- Add activity poster/detail route that uses real activity data and hides missing optional fields.
- Acceptance: desktop can show 12+ route tiles when data exists; click-through opens poster-like run detail.

### Sprint 4 - Stats Lab

- Reshape stats page into designed modules: distance field, effort mix, consistency heatmap, route diversity, records, weekday rhythm.
- Acceptance: at least four data-rich visual modules with microcopy, without reverting to a KPI grid.

### Sprint 5 - Final Polish and Acceptance

- Verify responsive desktop/tablet/mobile layouts.
- Verify reduced motion, loading/empty/error states, route data truthfulness, and performance.
- Run build/type/lint where feasible and capture known debt separately from new regressions.

## Review Gates

- Visual identity: route shapes dominate the homepage and gallery.
- Data truthfulness: no fake demo route appears when real data is available.
- Runner appeal: routes and poster pages invite browsing.
- Performance: SVG rendering remains bounded and animations avoid layout shift.
