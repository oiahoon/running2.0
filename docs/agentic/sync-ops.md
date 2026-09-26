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

Manual sync was verified end-to-end on 2026-04-30 after refreshing the GitHub dispatch token:
- `POST https://run2.miaowu.org/api/sync` returned `202` and queued `sync-data.yml`.
- GitHub Actions run `25165016166` completed successfully from `workflow_dispatch`.
- The workflow committed data update `9c086bfbdb153cac2b2f49aad0d5a7408a1b7a86`.
- Production `/api/sync/history` reflected the new sync log at `2026-04-30T12:21:33.379Z`.

Manual sync was reverified on 2026-07-14 after rotating the expired GitHub dispatch token:
- `POST https://run2.miaowu.org/api/sync` returned `202` with structured `queued` state.
- GitHub Actions run `29344918816` completed successfully from `workflow_dispatch`.
- The dispatcher now maps GitHub authorization and workflow configuration failures to stable error codes, without returning raw upstream response bodies to the browser.

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

The scheduled sync must exit nonzero when Strava rejects a request, returns malformed data, or returns zero activities while historical activities exist. GitHub Actions then stops before migration, map generation, and data commits. It must never replace the activity JSON with an empty list after an API failure. The workflow runs `scripts/test_sync_strava.py` before syncing.

For an activities endpoint 403, inspect the safe error fields in the failed workflow log. Check that the authorized Strava token includes `activity:read` or `activity:read_all` (the latter includes private activities), and reauthorize the app if the grant lacks the required scope. A successful token refresh alone does not prove that the token can read activities. After reauthorization, update the `STRAVA_REFRESH_TOKEN` GitHub Actions secret and dispatch `sync-data.yml` again. Do not put tokens in logs or commits.

On 2026-09-26, a manual run after rotating GitHub Actions credentials refreshed the access token, then the activities endpoint failed with `HTTP 403: Forbidden: Application/Status/Inactive`. This is an application status rejection. Check the Strava API settings dashboard for app status and developer tier before repeating OAuth. [Strava's June 2026 Developer Program update](https://communityhub.strava.com/insider-journal-9/an-update-to-our-developer-program-13428) requires a subscription for Standard Tier API access; the application owner may need to restore eligibility or contact Strava developer support. Once the app is active, reauthorize with `activity:read_all` and update the refresh token. The workflow must remain failed until the API returns real activity data.

For reauthorization, run `python scripts/generate-auth-url.py`, approve the requested `activity:read_all` scope, and copy the full redirect URL. Then run `python scripts/get-new-token.py` locally. It checks the granted scope and activity endpoint before displaying the new refresh token for entry in the GitHub Actions secret. The helper defaults to `http://localhost/`, which Strava allows for local OAuth; the browser may show a connection error, but its address bar still contains the redirect URL. Set `STRAVA_REDIRECT_URI` for both commands if using another redirect. Update `STRAVA_CLIENT_SECRET` in GitHub Actions too when the app secret is rotated. The website callback saves tokens only to Vercel's ephemeral database, so it does not update the GitHub Actions secret.

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

If manual sync returns a GitHub dispatch error, first verify the Vercel value of `GITHUB_ACTIONS_TRIGGER_TOKEN`. Local `gh auth status` is not authoritative for the production manual-sync path.

## Generated Assets

- Do not scan all of `apps/web/public/maps/` unless map asset integrity is the task.
- DB binaries under `apps/web/public/` and `apps/web/data/` are generated/deployment data.
- Use forced git add only when intentionally committing generated sync outputs.
