# Configure Dropbox as the default activity source

The website keeps its existing Strava activities. New HealthFit FIT exports from Dropbox are merged into the same database, with matching workouts deduplicated. The website's **Sync Now** action and `POST /api/sync` use Dropbox / HealthFit by default; Strava remains selectable for manual sync. API callers can pass `{"sources":["strava"]}` to select Strava explicitly.

## 1. Export FIT files from HealthFit

In HealthFit, enable automatic FIT export to the Dropbox account you want to use. This repository expects the files in `/Apps/HealthFitExporter`. Check that a recent `.fit` file appears there before continuing. Signing in to Dropbox with Google does not change these steps.

## 2. Create a read-only Dropbox API app

Open the [Dropbox App Console](https://www.dropbox.com/developers/apps) and create an app with **Scoped Access** and **Full Dropbox** content access. Give it a name you recognize. In its **Permissions** tab, select `files.metadata.read` and `files.content.read`, then save. The app needs Full Dropbox access because HealthFit's export folder belongs to a different Dropbox app; an App Folder app cannot read it. The OAuth grant below requests only those two read scopes, but Full Dropbox allows reading other files in that account. A separate Dropbox account can limit that access.

Do not commit the Dropbox app key, app secret, authorization code, or refresh token to this repository.

## 3. Authorize the app and save GitHub Actions secrets

From the repository root, run:

```bash
gh auth login -h github.com
python3 scripts/authorize_healthfit_dropbox.py
```

Enter the App key and App secret from your Dropbox app's **Settings** tab. Open the URL printed by the helper while signed in to the same Dropbox account that receives HealthFit exports. Approve access, then paste the authorization code into the terminal. When prompted, choose `y` to save the credentials directly to this repository's GitHub Actions secrets. The helper uses an offline OAuth grant so scheduled runs can refresh access automatically.

If you do not use `gh`, add these three values manually in **Repository → Settings → Secrets and variables → Actions → Repository secrets**:

| Secret | Value |
| --- | --- |
| `DROPBOX_APP_KEY` | App key from Dropbox Settings |
| `DROPBOX_APP_SECRET` | App secret from Dropbox Settings |
| `DROPBOX_REFRESH_TOKEN` | Refresh token produced by the helper |

The existing `MAPBOX_TOKEN` secret is also used to generate static route images. Dropbox credentials belong in GitHub Actions secrets, not in `apps/web/.env.local` or Vercel: the website only queues the GitHub workflow.

## 4. Verify and enable automatic sync

Open [Sync HealthFit Data in GitHub Actions](https://github.com/oiahoon/running2.0/actions/workflows/sync-healthfit.yml) and choose **Run workflow** on `master`. Confirm that the run succeeds, activity counts are sensible, and the website shows the new activity after deployment. The workflow never commits the raw FIT files; it commits the derived SQLite database and route maps.

After the first successful run, add repository Actions variable `HEALTHFIT_SYNC_ENABLED=true` under **Settings → Secrets and variables → Actions → Variables**. This enables the daily schedule. `HEALTHFIT_DROPBOX_FOLDER` is an optional repository variable when the export path differs from `/Apps/HealthFitExporter`.

## Strava remains available

The existing Strava history and `.github/workflows/sync-data.yml` are retained. Choose **Strava** in the website's sync-source selector or manually run its GitHub workflow if your Strava API app becomes active again. Its automatic schedule is disabled because the current app returns `Application/Status/Inactive` on the free tier.

For implementation details and local validation, see [Sync/Ops Context](agentic/sync-ops.md).
