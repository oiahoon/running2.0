# Status And Debt

Use this for current progress, known traps, and backlog. Keep it terse.

## Last Context Refresh

- Date: 2026-04-29
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

## Current Product Reality

Working:
- Dashboard reads real stats/recent activities.
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
- TypeScript/lint debt is still present enough that CI may keep them non-blocking.
- Some legacy template/docs/cyber components remain in the tree.

## Known Traps

- Do not assume `docs/archive/` reflects current implementation.
- Do not let Vercel use raw `next build`; keep `npm run build`.
- Do not use raw `theme` for binary theme toggles; use `resolvedTheme`.
- Be careful with light mode: many older components hard-coded dark text colors.
- Avoid scanning all static maps or DB binaries during general tasks.
- `quality-gate.yml` may need periodic alignment with Node 22 and the current start command.
- `sync-data.yml` may need periodic alignment with current runtime/dependency baseline.

## Backlog

- Make type-check/lint hard-gate once legacy issues are fixed.
- Retire or remove unused cyber/template UI primitives.
- Consolidate repeated SQL into repository/helpers where it reduces real duplication.
- Add integration tests for data-source lifecycle and sync logging.
- Harden multi-source support only after Strava path remains stable.
- Review GitHub Actions Node versions and smoke command syntax after runtime upgrades.

