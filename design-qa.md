# Design QA — Split Training Ledger

## Comparison target

- Source visual truth: `/Users/huangyuyao/OwnWork/running2.0/output/product-design-2026-07-13/selected-option-3.png`
- Implementation URL: `http://localhost:3000/dashboard`
- Implementation screenshot: `/tmp/run2-round2-after-09-master-dashboard-desktop.jpg`
- Full-view comparison: `/tmp/run2-round2-master-reference-vs-final.jpg`
- Focused header comparison: `/tmp/run2-header-comparison.png`
- Focused workbench comparison: `/tmp/run2-body-comparison.png`
- Viewport: 1440 × 1024 desktop, dark theme, first route selected
- Responsive evidence: `/tmp/run2-round2-after-04-dashboard-mobile.jpg` and `/tmp/run2-round2-after-07-activities-mobile.jpg` at 390 × 844; `/tmp/run2-round2-after-05-dashboard-tablet-transition.jpg` at 1024 × 834
- Map fallback evidence: `/tmp/run2-round2-after-08-master-map-gallery.jpg` at 390 × 844 on the merged `master` data state
- Empty-state evidence: `/tmp/run2-review-empty-filter.jpg` at 390 × 844
- Browser: Codex in-app browser

## Findings

No actionable P0, P1, or P2 findings remain.

- [P3] Route imagery reflects live data rather than the concept's illustrative Chengdu sample.
  - Location: selected route canvas and ledger rows.
  - Evidence: the source shows a June 29 Chengdu run and illustrative contour detail; the implementation shows the latest activity and its real GPS shape from the local database.
  - Classification: expected product-data variance. The route renderer, effort color, selected state, and visual hierarchy match the source while preserving real application behavior.
- [P3] A `View activity` action is present in the selected-route inspector.
  - Location: lower portion of the left metrics rail.
  - Evidence: this action is not visible in the source concept.
  - Classification: intentional functional extension required to preserve the existing activity-detail path. It uses the shared secondary-action styling and does not change the main composition.
- [P3] The implementation uses the existing grid treatment without the concept's decorative topographic contour texture.
  - Location: selected route canvas.
  - Evidence: both surfaces use a dark plotted field, but only the source contains decorative contour lines.
  - Classification: acceptable follow-up polish. No placeholder or handcrafted decorative substitute was introduced.

## Required fidelity surfaces

- Fonts and typography: Manrope and the existing CJK fallbacks preserve the concept's geometric sans character. The final headline is two lines at desktop, ledger typography is compact, numeric values are tabular, and no desktop or mobile text collision remains.
- Spacing and layout rhythm: the final split is approximately 62/38, the primary divider, top bar, route workbench, row ledger, and bottom totals align closely with the source. The route workbench begins at the same visual depth and uses restrained 1px dividers with minimal radii and no generic card shadows.
- Colors and tokens: ink-black background, off-white text, muted gray labels, emerald primary actions, cyan selection, and effort-specific green/red/orange/purple colors map to the source. Light-mode tokens remain supported.
- Image quality and asset fidelity: the existing production runner asset is reused at full quality and positioned to match the concept. Brand art and route shapes use the project's supplied components and real GPS data; no placeholder imagery, CSS art, or replacement illustration was added.
- Copy and content: headline, supporting copy, grouped navigation, ledger title/copy, filters, column labels, and the data note match the selected concept. Counts, dates, city/activity names, metrics, and route geometry intentionally come from the real local dataset.
- Icons: existing Heroicons and the project's route/brand icon components remain consistent in weight and alignment. No emoji or text-glyph icon replacements are present.
- States and interactions: row selection updates the left inspector and route canvas; `New Routes` changes the result total to 8; year selection remains a native select; mobile navigation opens with all eight product destinations; selected, hover, focus-visible, loading, and empty states are implemented. A zero-result filter no longer leaks a route from another year or effort, and `Clear filters` returns to the latest available year and `All`.
- Accessibility and viewport resilience: semantic headings, navigation labels, current-page markers, pressed-state filters/rows, labeled year select, focus rings, reduced-motion handling, and route image labels remain. The mobile drawer traps Tab in both directions, responds to Escape, locks background scrolling, marks the app surface inert/hidden, and restores focus to the menu button. Desktop, 1294px, and 390px widths have no horizontal overflow; mobile controls are at least 44px tall.
- Runtime efficiency: route geometry is memoized and dashboard thumbnails are point-capped; route gallery cards use deferred rendering and an intersection sentinel instead of a page-wide scroll listener; static route images are used when present and a real GPS route glyph preserves trajectory context when neither an image nor Mapbox is available; hidden runner art is no longer eagerly loaded on mobile/tablet. The default map gallery now requests a 650-byte summary plus 20 visible records instead of loading the 1.25MB, 500-record map payload before the user enters full-map mode.

## Comparison history

### Pass 1 — blocked

- [P1] The headline wrapped to four lines and the summary metrics formed two rows, pushing the route workbench far below the source.
- [P2] Multiple ghost routes created a tangled canvas unlike the selected single-route focus.
- [P2] The runner overlapped the metric rail and was clipped at the viewport edge.
- Fixes: reduced and rebalanced display type, restored the four-column metric rail, removed ghost routes, tightened the 62/38 split, and repositioned the runner below the route workbench.
- Post-fix evidence: `/tmp/run2-option3-desktop-pass2-loaded.png`.

### Pass 2 — blocked

- [P2] At an effective 1294px viewport the desktop navigation and utility actions collided.
- Fix: moved the full navigation threshold to 1380px and retained the complete drawer navigation below that width.
- Post-fix evidence: intermediate layout reports `scrollWidth === clientWidth`, full desktop navigation hidden, and `Open sidebar` available at 1294px.

### Pass 3 — passed

- The 1440 × 1024 composition matches the source's major regions, typography hierarchy, dividers, controls, data density, route canvas, runner asset, and bottom metric rail.
- The 390 × 844 mobile surface has no horizontal overflow, clipped primary action, or off-screen navigation requirement.
- Browser checks show the correct URL/title, meaningful rendered content, no framework overlay, no relevant console warnings/errors, and working interaction states.

### Pass 4 — passed after plugin review

- [P1] A zero-result filter previously fell back to the first unfiltered route, causing the inspector to contradict the empty ledger. Fixed by constraining the selected route to `filteredRoutes` and adding a recoverable two-panel empty state.
- [P1] The mobile drawer previously left focus on the background page. Fixed with initial focus, a bidirectional focus trap, Escape handling, background scroll lock/inert state, and focus restoration.
- [P2] The compact mobile header rendered a truncated duplicate page title. Fixed by retaining the flex spacer while hiding page metadata below the medium breakpoint.
- [P2] Several mobile controls measured 36–42px. Shared actions and ledger filters now measure at least 44px on mobile.
- [P2] Ledger route subtitles repeated the dedicated effort column. They now show the activity type or activity name beneath a city-first title, preserving effort only in its own column.
- Final browser evidence: 1430px content width with `scrollWidth === clientWidth`, 390px viewport with `scrollWidth === clientWidth`, no error-level console output, English/Chinese/Japanese empty-state copy rendered, and drawer focus returning to `Open sidebar` after Escape.

### Pass 5 — passed after responsive and performance review

- [P1] At 1024px the runner illustration overlapped the `Recent Routes` transition region. The cameo now appears only at the full desktop split and is lazy-loaded; the 1024px capture has a clear heading/filter boundary.
- [P1] Waterfall cards passed minutes into a pace formatter that expects metres per second, producing values such as `1:19/km`. Cards now pass `distance / duration`; verified values begin at `12:32/km`, `18:34/km`, and `16:47/km`.
- [P1] The route gallery requested 500 complete activities before the map was opened. Summary aggregation now comes from the API, while the heavy query is enabled only in full-map mode. The equivalent filtered response fell from 1,250,176 bytes to a 650-byte summary, with 20 records loaded for the visible gallery.
- [P2] Dashboard, activity archive, and map metric cards consumed excessive vertical space on narrow screens. They now use compact two- or three-column strips, the selected route is map-first on mobile, and all inspected form controls measure 44px.
- [P2] Route and statistics rendering repeated avoidable geometry/filter work. Route paths, ghost geometry, effort groups, date filters, and the year spiral path are now memoized or hoisted; long gallery sections use `content-visibility`.
- [P2] Missing Mapbox configuration produced repeated fallback messaging in gallery cards. Existing local/CDN static maps now render directly; when the latest upstream sync contains no static map assets, the same card renders its real GPS trajectory with the shared route glyph instead of degrading to repeated setup copy.
- Final evidence: 1440px desktop, 1024px transition, and 390px dashboard/activity/map surfaces have no horizontal overflow; the runner is hidden at 1024px; real trajectory previews and corrected paces render in the mobile gallery; route selection still updates the inspector.

## Implementation checklist

- [x] Compact grouped top navigation and responsive drawer
- [x] Real-data selected route inspector and GPS canvas
- [x] Interactive route ledger filters, year control, and row selection
- [x] Shared flat tokens applied to existing routes, stats, map, sync, source, activity, and poster surfaces
- [x] Desktop, intermediate, and mobile rendered validation
- [x] Type check, lint, production build, and core-route smoke checks

## Follow-up polish

- Add a production-supplied topographic texture only if the team wants the decorative contour detail from the concept; it is not needed for current usability or route fidelity.

final result: passed
