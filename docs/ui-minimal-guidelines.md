# Minimal UI Guidelines

## Goal

Provide a restrained, readable, data-first UI language for Running Page 2.0.

## Principles

- Prioritize information clarity over visual decoration.
- Use consistent spacing and hierarchy across all pages.
- Keep interactions obvious and low-friction.
- Minimize color usage; reserve accent color for actions and status.
- Preserve map/route capability while simplifying surrounding chrome.

## Visual Rules

### Typography

- Main heading: `text-3xl font-semibold tracking-tight`
- Section heading: `text-base font-semibold`
- Body text: `text-sm`
- Meta label: `metric-label` utility class

### Surfaces

- Primary container: `.panel`
- Section header: `.panel-header`
- Section body: `.panel-body`

### Color and States

- Default text: gray scale (`gray-900` / `gray-100`)
- Secondary text: `gray-600` / `gray-300`
- Borders: `gray-200` / `gray-700`
- Status chips:
  - success: green tone
  - warning/error: red tone
  - neutral: gray tone

### Components

- Tables for dense records (activities, sync logs)
- Simple chips for categories/tags
- Native form controls with minimal border and focus styles
- Avoid heavy animated motion and decorative iconography

## Responsive Baseline

- Use single-column stack on mobile.
- Avoid persistent horizontal overflow except explicit tables/charts.
- Keep controls grouped by task, not by visual decoration.

## Page-level Checklist

For each page:

1. Header has title + one-line purpose.
2. Primary action is singular and obvious.
3. Filters appear before content.
4. Empty state uses plain language.
5. Error state is concise with direct next action.

## Migration Status

- Completed: layout, dashboard, activities, stats, map, sync, sync-status, data-sources
- Pending: component-level cleanup to retire unused cyber-style UI primitives
