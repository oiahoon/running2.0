# Strava Context Pointer

Active Strava and sync context for agents lives in:

- [../agentic/sync-ops.md](../agentic/sync-ops.md)
- [../agentic/data-api.md](../agentic/data-api.md)

Current source of truth:
- OAuth endpoints: `apps/web/src/app/api/auth/strava/`
- Runtime sync executor: `apps/web/src/app/api/sync/strava/route.ts`
- Scheduled sync pipeline: `.github/workflows/sync-data.yml`
- Data migration scripts: `scripts/sync_strava.py`, `scripts/migrate-strava-json.js`

