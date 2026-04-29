# Data/API Context

Read this for API routes, SQLite schema, data hooks, model formats, and query behavior.

## Database

- Connection: `apps/web/src/lib/database/connection.ts`
- Schema: `apps/web/src/lib/database/schema.sql`
- Repository: `apps/web/src/lib/database/repositories/ActivityRepository.ts`
- Activity helpers/types: `apps/web/src/lib/database/models/Activity.ts`

Database path behavior:
- Vercel: copies `public/running_page_2.db` to `/tmp/running_page_2.db`.
- Production non-Vercel: `DATABASE_PATH` or `data/running_page_2.db`.
- Development: resolved from `DATABASE_PATH` or `data/running_page_2.db`.

Core tables:
- `activities`
- `sync_logs`
- `data_source_settings`
- `users`
- extra future-facing tables: segments, data points, achievements, goals, routes.

## API Routes

- `GET /api/activities`: `apps/web/src/app/api/activities/route.ts`
  - Query filters: `page`, `limit`, `type`, `source`, `startDate`, `endDate`, `minDistance`, `maxDistance`, `search`.
  - Returns activities, pagination, summary, and normalized camelCase aliases.
- `GET /api/stats`: `apps/web/src/app/api/stats/route.ts`
  - Query filters: `year`, `month`, `type`.
  - Returns basic stats, type distribution, monthly/weekly/daily data, pace analysis, records, recent activities.
  - No year means all-time basics and empty time-series arrays.
- `GET /api/data-sources`: persisted source settings plus available source metadata.
- `POST/PUT/DELETE /api/data-sources`: source configuration lifecycle. Manual configuration is currently only supported for Nike.
- `GET/POST /api/sync`: persisted source sync status and dispatcher.
- `GET/POST /api/sync/strava`: direct Strava sync executor.
- `GET /api/sync/history`: sync log/status history for UI and smoke tests.
- `GET /api/maps/[activityId]`: static map lookup/fallback behavior.
- `GET /api/debug`: deployment/runtime DB diagnostics.

## Hooks

- `apps/web/src/lib/hooks/useActivities.ts`
  - Activity list, stats, recent activities hooks.
  - Uses React Query.
- `apps/web/src/lib/hooks/useUserInfo.ts`
  - User display metadata for shell/sidebar.

## Units And Field Conventions

- Activity distance in DB is meters.
- Some API/UI transforms convert distance to km for chart data.
- Moving/elapsed time is seconds.
- Speed is m/s.
- Strava source id is `strava`.
- Activity types follow source naming, e.g. `Run`, `Walk`, `Ride`, `Swim`, `Hike`, `WeightTraining`, `Rowing`.

## Known Edges

- Some APIs still use raw SQL inline instead of repository methods.
- TypeScript debt exists around `any` activity payloads.
- `data_source_settings` is effectively single-user (`user_id = 1`) today.
- Multi-source architecture exists, but production sync is Strava-first.

