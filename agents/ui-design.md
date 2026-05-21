# UI And Design Rules

Purpose: keep admin surfaces efficient, readable, and responsive.

## Admin UX

- Admin UI should be dense but calm.
- Prefer clear hierarchy, filters, summaries, and tables over decorative cards.
- Keep primary actions obvious and destructive actions restrained.
- Use empty states that explain operational next steps.

## Dashboard Rules

- Charts must have labels, units, loading states, and empty states.
- Operational metrics should not block the entire dashboard if one widget fails.
- Heavy visuals may be dynamically loaded when they slow initial render.

## Tables And Filters

- Large datasets need pagination.
- Filters should be visible and easy to reset.
- Search should debounce or rely on explicit submit when it hits backend endpoints.
- Tables should reflow or horizontally scroll on mobile instead of breaking layout.

## Responsive Rules

- Support mobile, tablet, laptop, and desktop.
- No page-level horizontal scrolling.
- Shell navigation must remain usable below tablet widths.
- Forms must stack on narrow screens.

## Feedback Rules

- Use consistent success/error feedback.
- Show skeleton or structured loading for dashboard and table data.
- Do not leave privileged submit buttons enabled during mutation.
