# Status And Debt

Use this for current progress, known traps, and backlog. Keep it terse.

## Last Context Refresh

- Date: 2026-04-30
- Branch checked: `master`
- `git pull --ff-only`: already up to date at refresh time.

## Recent Work Signal

Recent commits show the project is past the old cyberpunk/mock-data phase:

- Light mode contrast fixes.
- Theme toggle restored with real light/dark tokens.
- Vercel deploy fixed by forcing `npm run build`.
- UIUX re-architecture completed across shell, dashboard, sync, activities, stats, map, and data sources.
- Next 16 + React 19 upgrade completed.
- Node/runtime baseline documented around Node 22.
- Sync/runtime consolidation and API smoke gate work completed.
- Legacy static homepage, docs-template UI, Catalyst primitives, Cyber UI primitives, unused Recharts wrappers, and stale pointer docs were removed.
- English/Chinese/Japanese UI localization added with a global language toggle and localized route-atlas slogan.
- Favorite runner low-poly cutouts added as transparent PNG accents for dashboard and poster surfaces.

## Current Product Reality

Working:
- Dashboard reads real stats/recent activities.
- Dashboard hero slogan and core UI copy support English, Simplified Chinese, and Japanese.
- Dashboard and posters can place generated transparent runner character accents without using real athlete photos.
- Activities page reads real data with search/filter/pagination.
- Stats page reads real yearly analytics.
- Map page preserves map and static route gallery workflows.
- Sync page reads persisted status/history and can trigger sync.
- Data Sources page reads persisted data source settings.
- Strava is the production-ready source.
- Vercel deployment for `run2` works with repo-level `apps/web/vercel.json`.

Partial:
- Multi-source architecture exists, but non-Strava sources are incomplete.
- Nike configuration path exists but should be treated as experimental.
- TypeScript/lint should be treated as active quality gates after the 2026-04-30 legacy cleanup; if they fail, investigate as current debt.

## Known Traps

- Do not assume `docs/archive/` reflects current implementation.
- Do not let Vercel use raw `next build`; keep `npm run build`.
- Do not use raw `theme` for binary theme toggles; use `resolvedTheme`.
- Be careful with light mode: many older components hard-coded dark text colors.
- Avoid scanning all static maps or DB binaries during general tasks.
- `quality-gate.yml` may need periodic alignment with Node 22 and the current start command.
- `sync-data.yml` may need periodic alignment with current runtime/dependency baseline.
- Historical plans and removed UI experiments now live only under `docs/archive/`.

## Backlog

- Consolidate repeated SQL into repository/helpers where it reduces real duplication.
- Add integration tests for data-source lifecycle and sync logging.
- Harden multi-source support only after Strava path remains stable.
- Review GitHub Actions Node versions and smoke command syntax after runtime upgrades.
