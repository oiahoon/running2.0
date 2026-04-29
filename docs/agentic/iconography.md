# RUN2 Iconography

Use this context pack when adding or replacing visual symbols in the active product UI.

## Direction

RUN2 uses a restrained route-atlas visual language, not emoji, stickers, or glossy app-store badges.

- Icons are vector-first SVG glyphs.
- Default size is 20px in UI, drawn on a 24px viewBox.
- Stroke is rounded, usually 1.8px to 2px.
- Fill is avoided except for tiny data nodes and brand marks.
- Color is inherited with `currentColor`; use `--route-green` only as a small accent.
- Shapes should feel like route traces, instruments, and field notes.
- Avoid emoji, cartoon characters, 3D blobs, neon cyber motifs, and decorative mascots.

## System

Primary component:

- `apps/web/src/components/icons/AtlasIcon.tsx`

Brand component:

- `apps/web/src/components/icons/Run2Logo.tsx`

Static brand assets:

- `apps/web/public/brand/run2-mark.svg`
- `apps/web/public/brand/run2-logo.svg`
- `apps/web/public/brand/run2-social-card.svg`

## Activity Mapping

- `Run`: stride route
- `Walk`: paired footfall nodes
- `Hike`: ridge line
- `Ride`: two wheel rings
- `Swim`: wave lanes
- `WeightTraining`: barbell
- `Yoga`: balanced arcs
- `Workout` / `CrossTraining`: training pulse
- `Rowing`: hull and oar
- `Other`: small spark route node

## Usage Rules

- Prefer `ActivityIcon` for activity type UI.
- Prefer `AtlasIcon` for utility symbols: map, pin, chart, warning, calendar, sync, records, heatmap, finish.
- Buttons may include icons when the action benefits from fast scanning.
- Empty states should use one quiet icon plus text, not emoji-only illustrations.
- For social and favicon assets, use the route-loop mark, not a screenshot or generated bitmap.
