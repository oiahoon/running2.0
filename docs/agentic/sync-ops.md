# Sync/Ops Context

Read this for Strava and HealthFit sync, static maps, data import scripts, and scheduled data commits.

## HealthFit → Dropbox sync

HealthFit FIT exports in `/Apps/HealthFitExporter` are the replacement source for new Apple Watch / Apple Health workouts. `.github/workflows/sync-healthfit.yml` reads that folder daily or on manual dispatch, imports FIT data into the existing SQLite database, generates maps, copies the public DB, and commits derived data. The daily job runs only after the repository variable `HEALTHFIT_SYNC_ENABLED=true` is set; manual dispatch can be used first to verify the setup. The old Strava workflow is manual-only because the API app is inactive on the free tier.

The user-facing setup guide is [Configure Dropbox as the default activity source](../setup-healthfit-dropbox.md).

One-time Dropbox setup:

1. Keep HealthFit's automatic FIT export targeting `/Apps/HealthFitExporter`. Dropbox login through Google works; the API uses a separate Dropbox OAuth grant.
2. In [Dropbox App Console](https://www.dropbox.com/developers/apps), create a **Scoped Access** app with **Full Dropbox** access. App-folder access cannot read HealthFit's separate app folder. In the app's Permissions tab, enable only `files.metadata.read` and `files.content.read`. Full Dropbox still permits reading all files in that Dropbox account, so a dedicated free Dropbox Basic account is a reasonable way to restrict access.
3. Run `python scripts/authorize_healthfit_dropbox.py` locally. Enter the app key and secret, approve the generated URL while signed in to the Dropbox account that receives HealthFit exports, and enter the authorization code. The helper requests offline access, then offers to save `DROPBOX_APP_KEY`, `DROPBOX_APP_SECRET`, and `DROPBOX_REFRESH_TOKEN` as repository Actions secrets through `gh` without echoing their values. Do not paste these credentials into chat or commit them.
4. Dispatch `sync-healthfit.yml` manually and check that it imports the expected FIT files, commits a nonempty database, and deploys. Then set repository Actions variable `HEALTHFIT_SYNC_ENABLED` to `true`. The folder defaults to `/Apps/HealthFitExporter`; override it with `HEALTHFIT_DROPBOX_FOLDER` only if HealthFit exports elsewhere.

The importer keeps existing Strava records, deduplicates FIT sessions by start time, type, distance, and duration, and tracks Dropbox revisions for repeat runs. A 2019 Keep FIT sample matches an existing Strava row; a 2026 Apple Watch FIT sample has GPS and imports as a new row. FIT files, Dropbox paths, and raw filenames are not committed. Derived activity data and GPS routes in the SQLite database and maps are public through this site, as with existing Strava data. Indoor FIT files without GPS still import distance, time, and heart rate, without a route.

For local checks, run `python -m unittest discover -s scripts -p 'test_healthfit_sync.py'`. To test an export folder without Dropbox, use `python scripts/sync_healthfit.py --local-dir /path/to/FIT-folder --database /path/to/copy-of-running_page_2.db`; always use a DB copy for local validation.

## Primary Data Flow

1. GitHub Actions runs manual or enabled scheduled HealthFit sync.
2. `scripts/sync_healthfit.py` downloads changed FIT exports from Dropbox and merges them into SQLite, preserving Strava history.
3. `scripts/generate-static-maps.py` generates static route map PNGs from database routes.
4. `scripts/prepare-vercel-db.js` copies DB into `apps/web/public/`.
5. Workflow commits data/map/public changes back to `master`.
6. Vercel deploys `run2` from `master`.

Manual sync from the app and an unqualified `POST /api/sync` dispatch `sync-healthfit.yml` by default, including before the first successful import. The website offers Strava as an explicit manual choice. It should not import data inside a Vercel function. Vercel only has a `/tmp` copy of the SQLite database, so runtime writes are not durable and will not update the committed data file.

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
- `scripts/sync_healthfit.py`: Dropbox FIT sync into the existing SQLite database.
- `scripts/authorize_healthfit_dropbox.py`: local, read-only Dropbox OAuth setup helper.
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

- `.github/workflows/sync-data.yml`: manual-only Strava data sync.
- `.github/workflows/sync-healthfit.yml`: manual/guarded scheduled HealthFit data sync.
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
- `DROPBOX_APP_KEY`
- `DROPBOX_APP_SECRET`
- `DROPBOX_REFRESH_TOKEN`

Vercel/runtime:
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_REFRESH_TOKEN` if required by route/script context
- `GITHUB_ACTIONS_TRIGGER_TOKEN` for `/api/sync` manual workflow dispatch
- `GITHUB_SYNC_REPOSITORY` optional, defaults to `oiahoon/running2.0`
- `GITHUB_SYNC_WORKFLOW_ID` optional Strava workflow override, defaults to `sync-data.yml`; Dropbox uses `sync-healthfit.yml`
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
