# Optimization Plan

## 1. Strengths

- Clear monorepo structure with web app + scripts + workflows
- Working Strava sync pipeline with scheduled automation
- Rich visualization foundation (`/stats`, charts, map components)
- Static map strategy reduces runtime API dependency
- Database schema is extensible and indexed for activity queries

## 2. Weaknesses

- Mock data remains in key user-facing pages (`/dashboard`, `/sync`)
- “Multi-source integration” is mostly architectural, not fully implemented
- Documentation had drift and conflicting claims
- Some scripts and APIs overlap in responsibility and need consolidation
- No strong automated quality gate visible in root workflow (lint/type/build/test)

## 3. Phased Improvement Roadmap

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

### Phase 3: Integration Layer Hardening

- Replace `integrations/base.ts` placeholder DB methods with repository-backed implementation
- Clarify source lifecycle and persistence behavior for `/api/data-sources`

### Phase 4: Quality Gate + Regression Safety

- Add CI workflow for lint + type-check + build
- Add minimal API route smoke tests

## 4. Execution Log

- [x] Phase 0 documentation cleanup and alignment
- [x] Phase 1 dashboard real-data convergence
- [x] Phase 2 sync page real-data convergence
- [ ] Phase 3 integration hardening
- [ ] Phase 4 quality gate and tests
