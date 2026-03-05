# Running Page 2.0

Running Page 2.0 is a Next.js-based running data dashboard focused on:
- Strava data sync
- SQLite-based activity storage
- Chart-based statistics
- Route and static map visualization

## Current Reality (as of 2026-03-05)

What is working now:
- Activity list page (`/activities`) reads real data from `GET /api/activities`
- Statistics page (`/stats`) reads real data from `GET /api/stats`
- Map page (`/map`) reads real data and supports static map fallback
- Strava OAuth + sync endpoints exist (`/api/auth/strava*`, `/api/sync/strava`)
- GitHub Actions workflow exists for scheduled data sync and static map generation

What is partially implemented:
- Multi-source integration architecture exists, but only Strava is production-usable
- `data-sources` and `sync` areas include placeholders/mock behavior

## Repository Structure

- `apps/web`: main Next.js app
- `scripts`: sync, migration, map-generation and deploy helper scripts
- `docs`: active project docs
- `docs/archive/2025-07`: archived planning/completion docs from the previous phase
- `homepage`: static marketing homepage

## Quick Start

```bash
git clone https://github.com/oiahoon/running2.0.git
cd running2.0
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Environment Variables

Common variables used by current code:

```env
DATABASE_PATH=./data/running_page_2.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
```

For GitHub Actions scheduled sync, configure repository secrets:
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_REFRESH_TOKEN`
- `MAPBOX_TOKEN`

## Active Documentation

- `docs/current-status.md`: code/doc consistency and current progress
- `docs/optimization-plan.md`: phased optimization roadmap and implementation tracking
- `docs/deployment/*`: deployment and troubleshooting guides

## Notes

Large parts of old planning/completion docs were contradictory (for example “15% complete” and “100% complete” both existed). They are archived under `docs/archive/2025-07` and no longer serve as source-of-truth.
