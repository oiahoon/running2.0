# Deployment/CI Context

Read this for Vercel, CI, runtime, dependency upgrades, and deployment failures.

## Runtime Baseline

- Preferred local/runtime Node: 22 LTS.
- Root `package.json` engines: Node `>=20 <25`, npm `>=10`.
- `better-sqlite3` is the native SQLite dependency. Rebuild it after Node version changes.
- `.nvmrc` is expected to point at Node 22.

## Build Commands

Root:

```bash
npm run build
npm run dev
npm run start
npm run type-check
npm run lint
```

Workspace:

```bash
npm run build --workspace=apps/web
```

Important:
- `apps/web/package.json` uses `next build --webpack`.
- `apps/web/vercel.json` forces Vercel to run `npm run build`.
- Keep this explicit until Turbopack has been revalidated with the current Tailwind/Next stack.

## Vercel

- Project: `run2`
- Root directory: `apps/web`
- Production branch: `master`
- Production aliases include:
  - `https://run2.miaowu.org`
  - `https://run2-joey-huangs-projects.vercel.app`
- Node version on project should stay aligned to Node 22.x.

Known deploy trap:
- If Vercel uses `next build` directly, it may invoke a different bundler path than local verification.
- Keep project-level or repo-level build command as `npm run build`.

## Quality Gate

- Workflow: `.github/workflows/quality-gate.yml`
- Should run install, type-check, lint, build, and API smoke checks.
- Type-check and lint should be treated as current quality gates after the 2026-04-30 legacy cleanup.
- API smoke checks should hit:
  - `/api/debug`
  - `/api/stats`
  - `/api/sync/history`
  - `/api/data-sources`

## Dependency Upgrade Notes

- Next/React stack is already major-upgraded to Next 16 and React 19.
- Keep `eslint` aligned with Next 16.
- Avoid reintroducing `sqlite3`; use `better-sqlite3`.
- After npm changes run:

```bash
npm install
npm run build
npm audit
```

## Troubleshooting Order

1. Check latest deploy logs first.
2. Confirm Vercel project is `run2`, not another similarly named project.
3. Confirm root directory is `apps/web`.
4. Confirm build command is `npm run build`.
5. Reproduce locally with `npm run build`.
6. For native module errors, confirm Node version and rebuild `better-sqlite3`.

Native module note:
- If logs mention `NODE_MODULE_VERSION` or `better_sqlite3.node`, first run under `.nvmrc` (`nvm use 22`) and rebuild only if the mismatch persists.
