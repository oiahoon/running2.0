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

## 4. Next Iteration Backlog

- Add minimal API route smoke tests
- Unify `/api/sync` runtime behavior with persisted source lifecycle (remove empty in-memory registry dependency)
- Add integration tests for data source CRUD and sync logging paths
- Gradually fix legacy TypeScript/Lint debt to turn CI type/lint checks from non-blocking to hard gate

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
