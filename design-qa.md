# Design QA — Split Training Ledger

## Comparison target

- Source visual truth: `/Users/huangyuyao/OwnWork/running2.0/output/product-design-2026-07-13/selected-option-3.png`
- Implementation URL: `http://localhost:3000/dashboard`
- Implementation screenshot: `/tmp/run2-round5-final/01-dashboard-en-dark-1440.png`
- Full-view comparison: `/tmp/run2-round5-final/reference-vs-final.png`
- Focused header comparison: `/tmp/run2-header-comparison.png`
- Focused workbench comparison: `/tmp/run2-body-comparison.png`
- Viewport: 1440 × 1024 desktop, dark theme, first route selected
- Responsive evidence: `/tmp/run2-round5-final/02-dashboard-zh-dark-320-viewport.png` at 320 × 844, `/tmp/run2-round5-final/03-dashboard-ja-light-768.png` at 768 × 1024, and `/tmp/run2-round5-final/04-map-ja-light-390.png` at 390 × 844
- Map fallback evidence: `/tmp/run2-round5-final/05-map-fallback-ja-light-390.png` at 390 × 844 on the current `master` data state
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
- States and interactions: row selection updates the left inspector and route canvas; the featured trajectory uses a 9.6-second linear draw, complete-route hold, fade, and restart loop with a faint full-route guide visible at reset; `New Routes` changes the result total to 8; year selection remains a native select; mobile navigation opens with all eight product destinations; selected, hover, focus-visible, loading, and empty states are implemented. A zero-result filter no longer leaks a route from another year or effort, and `Clear filters` returns to the latest available year and `All`.
- Accessibility and viewport resilience: semantic headings, navigation labels, a localized skip link, current-page markers, pressed-state filters/rows/view controls, labeled year select, focus rings, route image labels, and explicit reduced-motion fallback remain. The mobile drawer traps Tab in both directions, responds to Escape, locks background scrolling, marks the app surface inert/hidden, and restores focus to the menu button. The activity selector exposes its expanded/listbox relationship, focuses search when opened, closes on Escape from inside the popup, and restores trigger focus. English, Chinese, and Japanese layouts pass at 1440px, 768px, 390px, and 320px without document overflow; mobile controls are at least 44px tall and wide tables scroll within their panel instead of collapsing CJK labels vertically.
- Runtime efficiency: route geometry is memoized and dashboard thumbnails are point-capped; the route wall initially renders 18 memoized tiles and reveals additional batches on demand instead of constructing every visible route at once; gallery cards defer off-screen rendering with intrinsic-size reservation and use an intersection sentinel instead of a page-wide scroll listener; activity filtering defers high-frequency search updates; static route images are used when present and a real GPS route glyph preserves trajectory context when neither an image nor Mapbox is available; hidden runner art is no longer eagerly loaded on mobile/tablet. The default map gallery requests a 650-byte summary plus 20 visible records instead of loading the 1.25MB, 500-record map payload before the user enters full-map mode. Full-map and waterfall renderers are split into separate client chunks and load only for the selected view; poster, list, and statistics thumbnails remain static to avoid competing motion and repeated animation work.

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

### Pass 6 — passed after multilingual theme and layout review

- [P1] Japanese group labels wrapped vertically in the 1440px desktop navigation. The Japanese mid-desktop treatment now removes redundant group captions while preserving dividers, every destination, active state, and utility action.
- [P1] Japanese activity-table headers and values collapsed into vertical glyph stacks at 390px. The table now preserves readable rows with an internal horizontal scroller and no document overflow.
- [P2] Light-theme route canvases were muddied by a fixed dark SVG overlay. Canvas, grid, ghost, and empty-state colors now come from theme tokens, producing a clean paper-map surface in light mode without changing the ink-black dark treatment.
- [P2] Chinese and Japanese display headlines inherited Latin weight and tracking, creating overly dense three- to four-line mobile blocks. CJK-specific weight, tracking, leading, and mobile sizing restore hierarchy and whitespace; the Japanese dashboard headline now occupies two lines.
- [P2] Fully localized Chinese and Japanese dates and long effort labels truncated in the desktop ledger. Year-redundant CJK ledger dates are compacted to month/day and the effort column has sufficient width.
- Evidence: `/tmp/run2-round3-after-round1/01-dashboard-light-ja-mobile.jpg`, `/tmp/run2-round3-after-round1/02-activities-light-ja-mobile.jpg`, `/tmp/run2-round3-after-round1/03-dashboard-light-ja-desktop.jpg`, and `/tmp/run2-round3-after-round1/04-dashboard-dark-en-desktop.jpg`.

### Pass 7 — passed after motion and performance review

- [P1] The 900ms one-shot trajectory could finish before the user focused on it. Featured dashboard and activity-detail routes now draw over a 7.6-second loop with a long readable draw phase, a complete-route hold, a soft fade, and a short reset pause.
- [P2] The glow path initially revealed a faint full-route silhouette during drawing. Giving it the same normalized path length synchronizes glow and stroke, so the undisclosed route remains invisible until the animated head reaches it.
- [P2] Multiple statistics glyphs animated together and the map page bundled both major renderers up front. Statistics samples are now static; map and waterfall renderers are dynamically loaded only for the active view.
- Reduced-motion users receive the complete route immediately with no loop or fade. Featured motion uses only stroke offset and opacity, while thumbnails remain static.
- Evidence: drawing `/tmp/run2-round3-after-round1/08-loop-drawing-v2-dark-en-desktop.jpg`, completed hold `/tmp/run2-round3-after-round1/06-loop-hold-dark-en-desktop.jpg`, fade `/tmp/run2-round3-after-round1/07-loop-fade-dark-en-desktop.jpg`, and map-view verification `/tmp/run2-round3-after-round1/09-map-dark-en-desktop.jpg`.

### Pass 8 — passed after multilingual hierarchy and adaptive-layout review

- [P1] At 768px the Japanese header crowded navigation utilities while the dashboard hero stacked earlier than necessary. Header quick actions now wait for the full desktop breakpoint and the route-first dashboard keeps a balanced side-by-side inspector/canvas composition from tablet widths upward.
- [P1] Poster route previews collapsed into a shallow strip in Japanese because a fixed article aspect ratio competed with flexible content. The fixed poster proportion now applies only at the large desktop grid, while the route preview keeps a stable 16:10 drawing surface on smaller screens.
- [P1] Sync-history labels split into vertical CJK glyph stacks on mobile. The history panel now stacks its heading/actions and exposes a focusable, labeled internal table scroller with a readable minimum width and no wrapped headers.
- [P2] Route gallery metadata mixed English effort, shape, archive, and score labels into Chinese and Japanese views. These labels and the five route-shape names are now localized consistently in all three languages.
- [P2] Route tiles used more elevation and motion than the restrained data-first direction needed. Shadows and hover travel are reduced, dark mode removes the shadow, reduced-motion prevents translation, and gallery thumbnails remain static.
- Evidence: `/tmp/run2-round4-round1/01-routes-light-ja-mobile.jpg`, `/tmp/run2-round4-round1/02-dashboard-light-ja-tablet.jpg`, `/tmp/run2-round4-round1/03-posters-light-ja-mobile.jpg`, and `/tmp/run2-round4-round1/05-sync-table-light-ja-mobile.jpg`.

### Pass 9 — passed after motion, rendering, and final interaction review

- [P1] A 320px viewport overflowed because the full wordmark, language selector, and two 44px controls exceeded the compact header. Below 360px the supplied brand mark replaces the full lockup; all controls remain at least 44px and the document now reports `scrollWidth === clientWidth`.
- [P2] The featured route disappeared completely at the loop reset, which made the next draw harder to anticipate. A faint complete-route guide now remains visible beneath the animated glow and primary stroke, while the draw, hold, fade, and restart phases stay synchronized and smooth.
- [P2] Rendering all route-wall cards up front spent work on off-screen content, and activity search performed full filtering for every keystroke. Route tiles now use `content-visibility` with intrinsic-size reservation, while activity search uses a deferred query without delaying the input itself.
- Final interaction QA passed at 320px and 390px: the drawer traps focus, closes on Escape, and restores focus; Chinese dark-theme dashboard copy and controls fit; Japanese light-theme gallery/poster/sync surfaces fit; selecting a ledger row updates the inspector; activity search returns only matching rows; map/gallery switching works; and the no-token map view renders real GPS glyph fallbacks.
- Comparison evidence: `/tmp/run2-round4-final/03-dashboard-dark-en-desktop-mid.jpg`, loop reset `/tmp/run2-round4-final/04-dashboard-dark-en-desktop-loop-reset.jpg`, and combined source/implementation review `/tmp/run2-round4-final/05-reference-vs-final.png`.

### Pass 10 — passed after shell accessibility and compact-header review

- [P1] The mobile header previously created a one-pixel document overflow on the map route and did not expose a direct path to the main content. The app shell now clips accidental horizontal paint, keeps all layout containers shrinkable, provides a localized skip link, and uses the compact brand mark until the full lockup has enough room.
- All visible header controls retain a 44px interaction height. The Chinese dark 320px dashboard reports `scrollWidth === clientWidth` and preserves the intended title, metric, and route-first hierarchy.
- Evidence: `/tmp/run2-round5-final/02-dashboard-zh-dark-320-viewport.png`.

### Pass 11 — passed after multilingual typography and status review

- [P1] Sync status values and several map/poster/stat labels leaked English into Chinese and Japanese layouts. Connection, history, effort, poster, route-count, map-fallback, and selected-type strings now use the shared translation catalog.
- [P2] The Japanese poster duration wrapped at 390px. Responsive numeric sizing, tabular figures, tighter metric gaps, and no-wrap values keep all three poster measures aligned without document overflow.
- Evidence: `/tmp/run2-round5-audit/08-sync-zh-dark-round2.png` and `/tmp/run2-round5-audit/09-posters-ja-light-round2.png`.

### Pass 12 — passed after map/gallery density and no-token review

- [P1] Map controls lacked programmatic pressed state and the mobile activity filters were too dense. View buttons now expose `aria-pressed`; activity types use a two-column, 44px control grid; reset occupies a clear full-width row on mobile; and map/gallery padding scales by breakpoint.
- [P2] Gallery and map fallback surfaces used one-off gray values and inconsistent gaps. Shared theme tokens now keep both light and dark treatments coherent, while a 416px mobile map frame preserves a legible real-GPS route when Mapbox is unavailable.
- Evidence: `/tmp/run2-round5-audit/10-map-gallery-ja-light-round3.png` and `/tmp/run2-round5-audit/12-map-fallback-ja-light-round3.png`.

### Pass 13 — passed after route-wall performance and regression review

- [P1] The route wall constructed every filtered card at once. Geometry and effort are now prepared once, the initial render is capped at 18 memoized tiles, `Show more` advances in 18-card batches, and filter changes reset the visible batch.
- A current-pass regression briefly dropped the memoized polyline prop and produced blank glyphs. It was caught by rendered browser QA, fixed before completion, and reverified with 18 cards, 18 SVGs, and a real first-route path; the stale failing screenshot is not final evidence.
- Filter buttons expose pressed state, `Show more` reaches 36 cards, and the Tempo filter resets to its two matching cards without horizontal overflow.
- Evidence: `/tmp/run2-round5-audit/14-routes-ja-light-round4-fixed.png`.

### Pass 14 — passed after trajectory rhythm and final interaction review

- [P1] The 7.6-second featured loop was still fast enough to obscure the route's full progression. It now runs for 9.6 seconds with linear stroke movement, a longer complete-route hold, synchronized glow, and a stable faint guide beneath the reset.
- [P2] Poster and share-card trajectories animated alongside the featured route. Those supporting glyphs are static so attention and main-thread animation work remain focused on the active route; reduced-motion still reveals the complete route immediately and clears `will-change`.
- Computed browser styles confirm `9.6s`, `linear`, `infinite`, and `stroke-dashoffset, opacity`; sampled phases move from `0.94` through `0.10` before returning to `0.99`, confirming a complete smooth cycle.
- [P1] Escape inside the activity selector initially left the popup open and the result count displayed `31 / 0`. The popup now closes from its search field, restores focus to the trigger, exposes correct expanded/listbox state, and displays the API pagination total.
- Final English dark desktop comparison, Chinese dark compact layout, Japanese light tablet layout, Japanese light no-token map, mobile drawer focus restoration, activity-selector focus restoration, and zero document overflow all pass.
- Evidence: `/tmp/run2-round5-final/01-dashboard-en-dark-1440.png`, `/tmp/run2-round5-final/reference-vs-final.png`, `/tmp/run2-round5-final/03-dashboard-ja-light-768.png`, and `/tmp/run2-round5-final/05-map-fallback-ja-light-390.png`.

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
