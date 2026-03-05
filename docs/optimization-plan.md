# Optimization Plan

## 1. Strengths

- Clear monorepo structure with web app + scripts + workflows
- Working Strava sync pipeline with scheduled automation
- Rich visualization foundation (`/stats`, charts, map components)
- Static map strategy reduces runtime API dependency
- Database schema is extensible and indexed for activity queries

## 2. Weaknesses

- Some UI pages are still in mixed transition between old cyber-style components and new minimalist patterns
- “Multi-source integration” is mostly architectural, not fully implemented
- Documentation had drift and conflicting claims
- Some scripts and APIs overlap in responsibility and need consolidation
- No strong automated quality gate visible in root workflow (lint/type/build/test)

## 3. Current Iteration Roadmap

### Phase 0: Documentation Baseline (Done in this round)

- Archive outdated docs
- Create accurate status and optimization docs
- Re-establish single source-of-truth

### Phase 1: Dashboard Real-Data Convergence

- Remove dashboard mock stats and recent activity mock list
- Read from `/api/stats` and `/api/activities`
- Add loading/empty/error states

### Phase 2: Sync Page Real-Data Convergence

- Replace mock sync records and mock source card data
- Use `/api/sync` status data
- Add manual sync trigger via `/api/sync/strava` or `/api/sync`

### Phase 3: Build-Warning Cleanup

- Remove non-exported `Tab*` component usage from `data-sources` page
- Keep build output clean from avoidable UI import warnings

### Phase 4: UIUX Minimal Redesign

- Shift from cyberpunk/neon style to minimalist and restrained visual language
- Keep map and route capabilities intact
- Remove decorative visual noise (scan lines, glow-heavy cards, command-line themed UI)
- Refactor core pages first: `dashboard`, `activities`, `sync`
- Unify layout and typography to clean, low-contrast, readable defaults
- Batch 2 scope: `stats`, `map`, `sync-status`

### Phase 5: UI Consistency Documentation

- Define minimal UI language and checklist
- Make it the baseline for future page/component updates

### Phase 6: Mobile and Empty-State Polish

- Simplify global top navigation for mobile-first clarity
- Remove non-functional placeholder UI from shared layout
- Keep empty/loading states concise and consistent

### Phase 7: Integration Persistence and CI Gate

- Replace `integrations/base.ts` placeholder DB methods with real SQLite operations
- Refactor `/api/data-sources` to use `data_source_settings` persistence (instead of in-memory registry)
- Add baseline CI quality gate workflow for type-check + lint + build

### Phase 8: Sync Runtime Consolidation

- Remove `/api/sync` dependency on in-memory `DataSourceRegistry`
- Use `data_source_settings` as source-of-truth for sync status and enabled source dispatch
- Reuse a shared Strava sync executor to keep `/api/sync` and `/api/sync/strava` behavior consistent

### Phase 9: API Smoke Guardrail

- Add CI smoke checks for core APIs after build/start (`/api/debug`, `/api/stats`, `/api/sync/history`, `/api/data-sources`)
- Ensure quality workflow catches runtime API regressions beyond static build success

### Phase 10: NPM Dependency Debt Reduction

- Upgrade root/workspace dependencies to latest compatible non-major versions
- Prioritize direct security-sensitive packages (`next@14.2.35`, `axios@1.13.6`, `js-yaml@4.1.1`)
- Refresh lockfile and re-run `npm outdated` + `npm audit` to classify remaining debt

### Phase 11: Framework Major Upgrade (Latest Stable)

- Upgrade core framework stack to `next@16.1.6` + `react@19.2.x` + matching type packages
- Align lint stack to Next 16 requirements (`eslint@9`, `eslint-config-next@16`)
- Migrate `next.config` to Next 16 keys (`serverExternalPackages`, `images.remotePatterns`)
- Pin build/dev to webpack mode for workspace stability while Turbopack monorepo resolution remains unstable

### Phase 12: Runtime Baseline and Security Closure

- Remove unused `sqlite3`/`@types/sqlite3` dependency path and keep `better-sqlite3` only
- Run `npm audit fix` to close remaining transitive advisories (0 vulnerabilities)
- Define runtime baseline for native module stability (`.nvmrc` with Node 22 LTS, engines constrained to supported range)

### Phase 13: UIUX Re-Architecture (Grande Minimal)

- Redesign IA and workflows while preserving all existing capabilities
- Rebuild global shell for stronger hierarchy and clearer navigation context
- Refactor pages in batches (Dashboard/Sync first, then Activities/Stats, then Map/Data Sources)
- Keep map and trajectory workflows intact, improve information architecture and task flow
- Batch A complete:
  - New IA/workflow plan document (`docs/uiux-rearchitecture-plan.md`)
  - New global shell (sidebar grouping, command header, contextual actions)
  - Dashboard and Sync workflow-first layout refactor

## 4. Next Iteration Backlog

- Add integration tests for data source CRUD and sync logging paths
- Gradually fix legacy TypeScript/Lint debt to turn CI type/lint checks from non-blocking to hard gate
- UIUX re-architecture remaining batches after initial shell + core workflow rollout

## 5. Execution Log

- [x] Phase 0 documentation cleanup and alignment
- [x] Phase 1 dashboard real-data convergence
- [x] Phase 2 sync page real-data convergence
- [x] Phase 3 build-warning cleanup
- [x] Phase 4 UIUX minimal redesign (layout + dashboard + activities first batch)
- [x] Phase 4 UIUX minimal redesign batch 2 (`stats` + `map` + `sync-status`)
- [x] Phase 4 UIUX minimal redesign batch 3 (`sync` page table + controls simplification)
- [x] Phase 4 UIUX minimal redesign batch 4 (`data-sources`)
- [x] Phase 5 UI consistency documentation (`docs/ui-minimal-guidelines.md`)
- [x] Phase 6 mobile and empty-state polish (shared layout cleanup)
- [x] Phase 7 integration persistence and CI gate
- [x] Phase 8 sync runtime consolidation
- [x] Phase 9 API smoke guardrail
- [x] Phase 10 npm dependency debt reduction (non-major pass)
- [x] Phase 11 framework major upgrade (Next 16 + React 19)
- [x] Phase 12 runtime baseline and security closure
- [ ] Phase 13 UIUX re-architecture batch B/C pending (`activities` + `stats` + `map` + `data-sources`)
