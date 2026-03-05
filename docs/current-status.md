# Current Project Status (2026-03-05)

## 1. Scope and Baseline

The codebase is a monorepo centered on `apps/web` (Next.js 14 + TypeScript + SQLite).

Recent 20 commits (2025-07-19 to 2025-07-20) show focus on:
- Strava auto-sync and static map updates
- Cyberpunk UI transformation
- Activity page bug fixes
- Documentation churn and cleanup

## 2. Actual Implemented Features

### Implemented and usable

- Activity list API and page:
  - API: `GET /api/activities`
  - UI: `/activities` (supports filter/search/pagination)
- Statistics API and page:
  - API: `GET /api/stats`
  - UI: `/stats` (charts + personal records)
- Map page:
  - UI: `/map`
  - static map availability API: `GET /api/maps/[activityId]`
  - cache stats API: `GET /api/cache/stats`
- Strava OAuth + sync endpoints:
  - `/api/auth/strava`
  - `/api/auth/strava/callback`
  - `/api/sync/strava`
- Scheduled sync pipeline:
  - `.github/workflows/sync-data.yml`
  - `scripts/sync_strava.py`
  - `scripts/migrate-strava-json.js`
  - `scripts/generate-static-maps.py`

### Partially implemented / placeholder-heavy

- Dashboard page (`/dashboard`) currently uses mock stats and mock activities
- Sync page (`/sync`) currently uses mock sync records and mock source status
- Data source integration registry/API (`/api/data-sources`, `/api/sync`) defines multi-source architecture, but production-ready source is effectively Strava
- `apps/web/src/lib/integrations/base.ts` includes placeholder DB operations

## 3. Documentation vs Code Consistency

## Major inconsistencies found

- Contradictory project progress claims existed simultaneously:
  - `~15% complete`
  - `100% complete`
- Several docs claimed “15+ data sources integrated”, but code reality is “Strava production-ready, others partial/planned”
- Some deployment/docs files still reflected one-time or historical states
- Some component/docs references came from template scaffolding and were not aligned to current app behavior

## Resolution applied in this cleanup

- Historical docs moved to `docs/archive/2025-07`
- Root `README.md` and `docs/README.md` rewritten to reflect real implementation
- Optimization work is now tracked in `docs/optimization-plan.md`

## 4. Current Progress Assessment

Overall progress is best described as:
- Strong core data flow for Strava + SQLite + map assets
- Several user-facing pages complete
- Key product surfaces still need mock-to-real convergence

Practical status: **MVP usable for Strava data visualization, not fully production-complete as a multi-source platform.**
