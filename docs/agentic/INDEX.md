# Agentic Context Index

Read this file first. It is the routing layer, not the full context.

## Repository Snapshot

- App: Next.js 16 + React 19 monorepo.
- Main workspace: `apps/web`.
- Runtime baseline: Node 22 LTS preferred; root engines allow Node `>=20 <25`.
- Persistence: SQLite via `better-sqlite3`.
- Primary data source: Strava.
- Deployment: Vercel project `run2`, root directory `apps/web`, production branch `master`.
- Build is intentionally webpack-backed: `apps/web/vercel.json` uses `npm run build`, and `apps/web/package.json` runs `next build --webpack`.

## Context Packs

Use the smallest set that matches the task:

- Product/UI work: [product-ui.md](product-ui.md)
- Iconography and brand symbols: [iconography.md](iconography.md)
- API, database, hooks, models: [data-api.md](data-api.md)
- Sync scripts, maps, Strava, GitHub Actions: [sync-ops.md](sync-ops.md)
- Deployment, Vercel, CI, runtime: [deployment-ci.md](deployment-ci.md)
- File ownership and code map: [code-map.md](code-map.md)
- Current progress, debt, known traps: [status-and-debt.md](status-and-debt.md)

## Task Router

- Page layout, light/dark mode, visual polish: read `product-ui.md` + relevant page/component files.
- Activity list, stats, filters, query behavior: read `data-api.md` + `code-map.md`.
- Strava OAuth/sync, static maps, GitHub scheduled data commits: read `sync-ops.md` + `deployment-ci.md`.
- Vercel build/deploy failures: read `deployment-ci.md` first.
- Dependency/runtime upgrades: read `deployment-ci.md` + `status-and-debt.md`.
- Documentation/context maintenance: edit this index and only the affected packs.

## Verification

Preferred local checks:

```bash
npm run build
npm run type-check
npm run lint
```

Notes:
- Type check, lint, and build should all be treated as active local gates after the 2026-04-30 cleanup.
- For runtime API smoke tests, start the app with an explicit Next-compatible port command, then check `/api/debug`, `/api/stats`, `/api/sync/history`, and `/api/data-sources`.

## Do Not Load By Default

- `docs/archive/`
- `apps/web/public/maps/`
- SQLite database binaries in `apps/web/data/` or `apps/web/public/`
