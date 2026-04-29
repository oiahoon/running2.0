# Code Map

Use this to choose files without scanning the whole repository.

## Monorepo Roots

- `apps/web/`: main Next.js app.
- `scripts/`: sync, migration, map generation, deployment helpers.
- `.github/workflows/`: CI and scheduled sync.
- `homepage/`: old/static homepage; not active app surface.
- `docs/agentic/`: agent-facing source of truth.
- `docs/archive/`: historical context only.

## App Entrypoints

- `apps/web/src/app/layout.tsx`: root HTML, fonts, providers, active app shell.
- `apps/web/src/app/providers.tsx`: React Query and theme provider.
- `apps/web/src/app/page.tsx`: redirects/entry behavior.
- `apps/web/src/app/globals.css`: Tailwind layers, design tokens, shared utility classes.

## Pages

- Dashboard: `apps/web/src/app/dashboard/page.tsx`, `apps/web/src/app/dashboard/CyberDashboard.tsx`
- Activities: `apps/web/src/app/activities/page.tsx`
- Statistics: `apps/web/src/app/stats/page.tsx`
- Map: `apps/web/src/app/map/page.tsx`
- Sync: `apps/web/src/app/sync/page.tsx`
- Sync status: `apps/web/src/app/sync-status/page.tsx`
- Data sources: `apps/web/src/app/data-sources/page.tsx`
- Debug: `apps/web/src/app/debug/page.tsx`

## APIs

- Activities: `apps/web/src/app/api/activities/route.ts`
- Stats: `apps/web/src/app/api/stats/route.ts`
- Data sources: `apps/web/src/app/api/data-sources/route.ts`
- Sync dispatch: `apps/web/src/app/api/sync/route.ts`
- Strava sync: `apps/web/src/app/api/sync/strava/route.ts`
- Sync history: `apps/web/src/app/api/sync/history/route.ts`
- Strava auth: `apps/web/src/app/api/auth/strava/route.ts`, `apps/web/src/app/api/auth/strava/callback/route.ts`
- Maps: `apps/web/src/app/api/maps/[activityId]/route.ts`, `apps/web/src/app/api/check-maps/route.ts`, `apps/web/src/app/api/cache/stats/route.ts`
- Runtime debug: `apps/web/src/app/api/debug/route.ts`

## Shared Frontend

- Active shell: `apps/web/src/components/AppLayout.tsx`
- Mobile nav legacy/support: `apps/web/src/components/MobileNavigation.tsx`
- Charts: `apps/web/src/components/charts/`
- Maps: `apps/web/src/components/maps/`
- Personal records: `apps/web/src/components/PersonalRecords.tsx`
- Catalyst primitives: `apps/web/src/components/catalyst/`
- Legacy docs/template components: `Docs*`, `Navigation`, `TableOfContents`, `Hero`, `Prose`, `Fence`.
- Legacy cyber primitives: `apps/web/src/components/ui/`, `CyberAppLayout.tsx`, `CyberActivities.tsx`.

## Data Layer

- DB connection: `apps/web/src/lib/database/connection.ts`
- Schema: `apps/web/src/lib/database/schema.sql`
- Activity repository: `apps/web/src/lib/database/repositories/ActivityRepository.ts`
- Activity model/formatters: `apps/web/src/lib/database/models/Activity.ts`
- Hooks: `apps/web/src/lib/hooks/useActivities.ts`
- Activity config: `apps/web/src/lib/config/activities.ts`, `apps/web/src/lib/config/activityTypes.ts`

## Integrations

- Base integration interface/persistence: `apps/web/src/lib/integrations/base.ts`
- Strava integration helper: `apps/web/src/lib/integrations/strava.ts`
- Nike integration helper: `apps/web/src/lib/integrations/nike.ts`

## Scripts

- Sync: `scripts/sync_strava.py`
- Migration: `scripts/migrate-strava-json.js`, `scripts/migrate-data.js`
- Maps: `scripts/generate-static-maps.py`, `scripts/generate-maps-manual.js`
- Deployment prep: `scripts/prepare-vercel-db.js`
- Diagnostics: `scripts/test-mapbox-token.py`, `scripts/test-strava-connection.py`, `scripts/check-strava-permissions.py`

