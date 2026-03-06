# UIUX Re-Architecture Plan (Grande Minimal)

## 1. Vision

Build a calmer but more premium product surface: fewer visual distractions, stronger hierarchy, clearer workflows, and faster task completion.

Design direction:
- Minimal and restrained, but not plain
- Large, confident typography and spacing rhythm
- Data-first composition with clear primary actions
- Keep all existing capabilities (map, routes, activities, sync, analytics)

## 2. Product IA (Information Architecture)

Primary navigation groups:
- Overview: Dashboard, Statistics
- Training: Activities, Map
- Operations: Sync, Data Sources

Page purpose:
- Dashboard: daily command center and quick actions
- Activities: searchable activity ledger + filtering workflow
- Statistics: yearly analysis and trends
- Map: route exploration and trajectory workflow
- Sync: connection health and sync operations
- Data Sources: integration lifecycle and source configuration

## 3. User Workflow Redesign

Core user workflows:
1. Morning check-in:
- Open Dashboard
- See key metrics and this-week progress
- Jump to Map or Activities from contextual actions

2. Training review:
- Open Activities
- Filter by type/date/search
- Drill into map/route context when needed

3. Operational maintenance:
- Open Sync
- Run manual sync
- Verify latest sync log and source health

4. Insight analysis:
- Open Statistics
- Switch year
- Compare distribution, trend, and personal records

## 4. Visual System

Foundations:
- Deep neutral base with subtle gradient depth
- Card surfaces with clean border hierarchy
- Accent reserved for primary actions and status

Tokens to standardize:
- Page spacing and section rhythm
- Card/Panel styles
- Action button tiers (primary, secondary, ghost)
- Unified table density and status chip styles

## 5. Execution Phases

Phase A: Plan and baseline
- Create this plan and execution checklist

Phase B: Shell and layout system
- Rebuild global app shell (sidebar, top bar, content frame)
- Introduce new tokens and shared utility classes in `globals.css`
- Preserve all routes and functionality

Phase C: Workflow page batch 1
- Dashboard and Sync major layout refactor
- Keep all data/API behavior intact

Phase D: Workflow page batch 2
- Activities and Statistics layout refinement

Phase E: Workflow page batch 3
- Map and Data Sources refinement
- Mobile ergonomics and edge-state polish

Phase F: QA and consistency closure
- Build verification and regression check
- Update documentation and cleanup notes

## 6. Acceptance Criteria

- No route/functionality removed
- Navigation clarity improves (fewer clicks, clearer action hierarchy)
- Mobile and desktop both usable and visually coherent
- Existing build pipeline passes
- Documentation reflects final IA and workflows

## 7. Progress Tracker

- [x] Phase A
- [x] Phase B
- [x] Phase C
- [x] Phase D
- [x] Phase E
- [x] Phase F
