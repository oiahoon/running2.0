# Sync/Ops Context

Read this for Strava sync, static maps, data import scripts, and scheduled data commits.

## Primary Data Flow

1. GitHub Actions workflow runs scheduled/manual sync.
2. `scripts/sync_strava.py` fetches Strava data into JSON.
3. `scripts/migrate-strava-json.js` migrates JSON into SQLite.
4. `scripts/generate-static-maps.py` generates static route map PNGs.
5. `scripts/prepare-vercel-db.js` copies DB into `apps/web/public/`.
6. Workflow commits data/map/public changes back to `master`.
7. Vercel deploys `run2` from `master`.

Manual sync from the app should dispatch `.github/workflows/sync-data.yml`; it should not run Strava import inside a Vercel function. Vercel only has a `/tmp` copy of the SQLite database, so runtime writes are not durable and will not update the committed data file.

## Runtime Sync

- Direct Strava executor: `apps/web/src/app/api/sync/strava/route.ts`
- Generic dispatcher: `apps/web/src/app/api/sync/route.ts`
- Sync history: `apps/web/src/app/api/sync/history/route.ts`

Runtime sync reads Strava tokens from `data_source_settings`. It refreshes tokens when near expiration and logs to `sync_logs`.

## Scripts

- `scripts/sync_strava.py`: Strava API sync into JSON data files.
- `scripts/migrate-strava-json.js`: JSON to SQLite migration.
- `scripts/generate-static-maps.py`: Mapbox static map generation.
- `scripts/prepare-vercel-db.js`: deployment DB/public asset preparation.
- `scripts/test-mapbox-token.py`: Mapbox token check.
- `scripts/check-strava-permissions.py`: Strava token/scope check.
- `scripts/generate-auth-url.py`, `scripts/get-new-token.py`: Strava OAuth helpers.

## GitHub Actions

- `.github/workflows/sync-data.yml`: scheduled/manual Strava data sync.
- `.github/workflows/quality-gate.yml`: build and API smoke gate.
- `.github/workflows/test-mapbox.yml`: manual Mapbox diagnostics.
- `.github/workflows/test-strava-permissions.yml`: manual Strava permission diagnostics.
- `.github/workflows/test-secrets.yml`: manual secret presence diagnostics.

Important drift to check when editing:
- Node versions in workflows should align with the runtime baseline.
- `sync-data.yml` comment historically said "every 6 hours" while cron was once daily.
- `quality-gate.yml` must start Next with a valid port argument for the current package script.

## Secrets

GitHub Actions:
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_REFRESH_TOKEN`
- `MAPBOX_TOKEN`

Vercel/runtime:
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_REFRESH_TOKEN` if required by route/script context
- `GITHUB_ACTIONS_TRIGGER_TOKEN` for `/api/sync` manual workflow dispatch
- `GITHUB_SYNC_REPOSITORY` optional, defaults to `oiahoon/running2.0`
- `GITHUB_SYNC_WORKFLOW_ID` optional, defaults to `sync-data.yml`
- `GITHUB_SYNC_REF` optional, defaults to `master`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `DATABASE_PATH`
- `NEXT_PUBLIC_APP_URL`

`GITHUB_ACTIONS_TRIGGER_TOKEN` should be a narrowly scoped GitHub fine-grained token that can dispatch Actions for this repository. Do not store Strava access or refresh tokens in the committed SQLite database.

## Generated Assets

- Do not scan all of `apps/web/public/maps/` unless map asset integrity is the task.
- DB binaries under `apps/web/public/` and `apps/web/data/` are generated/deployment data.
- Use forced git add only when intentionally committing generated sync outputs.
