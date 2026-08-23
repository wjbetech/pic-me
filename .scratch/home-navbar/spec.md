# Spec — Home Navbar Redesign

Tracks the inbox line: "Navbar should be redesigned and ideally made transparent. ... default navbar could be re-styled to be significantly more stylish and modern."

## Current

`src/components/Navbar/Navbar.tsx` — `navbar bg-base-100 shadow-md`, PicMe `btn-ghost text-warning`, ThemeToggle on right. Sits above hero which now has its own dark scrim.

## Desired

Transparent or glass navbar that harmonizes with the new photo-showcase hero, stays legible in both themes, and doesn't compete with the hero's focal photo.

See child issues `issues/01-*` and `02-*` for the two decisions that block implementation.

## Acceptance (from wayfinder map)

- [ ] No `bg-base-100` opaque bar at page top when scrolled to 0
- [ ] Wordmark + toggle remain ≥ 4.5:1 contrast over hero photo in both themes
- [ ] Scroll behavior is deterministic (either sticky glass or top-fixed with documented CTA push — per ticket 02 decision)
