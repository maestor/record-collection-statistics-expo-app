# Accessibility

## Visual Design
- Use the FFHL-inspired blue as the primary action color with dark navy text and white or pale blue surfaces.
- Keep controls high contrast and do not communicate state by color alone.
- Keep touch targets at least 44x44 points.
- Use tabular numbers for counters and metrics.

## Screen Behavior
- Important API data and error text should be selectable.
- Buttons, links, and filter chips must expose roles and selected/disabled/busy states.
- Error states should use alert semantics and include a retry path where useful.
- Lists should remain readable with larger system font sizes.

## Motion
Avoid required motion in v1. If animations are added later, respect reduced motion settings.

