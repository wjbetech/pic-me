# Wayfinder Map — Home Navbar Redesign

## Destination

A navbar that feels stylish and modern, stays legible over any animal photo/environment on the homepage, and guides the user back to the main CTAs — without reintroducing the pre-redesign opacity bugs.

## Notes

- Domain: `CONTEXT.md` glossary — Navbar, Hero, Theme. Consult `docs/agents/domain.md` consumer rules.
- Skills: `grill-me` + `frontend-design` + `design-taste-frontend` for art direction; `tdd` when implementing (no new deps).
- Standing preference: pnpm canonical; daisyUI tokens must work light/dark (see TODO Phase 5 strong-contrast requirement).

## Decisions so far

- [01-transparent-visibility](../home-navbar/issues/01-transparent-visibility.md) — transparent at top with dedicated 64px scrim strip + white-with-shadow text; `bg-base-100` bar never returns at scroll 0
- [02-glass-vs-fixed](../home-navbar/issues/02-glass-vs-fixed.md) — sticky glass on scroll (`bg-base-100/80 backdrop-blur-md` after hero, ≈80vh), no pushed CTA row needed
- Implementation note — exact values tuned as "not yet specified" anticipated: scrim `h-16 bg-gradient-to-b from-black/35 to-transparent`, glass `bg-base-100/80 backdrop-blur-md shadow-sm border-b border-base-content/10`, threshold `scrollTop > 0.8 × innerHeight`, rAF-throttled passive listener; overlay variant only on home route (options/play keep the solid bar)

## Not yet specified

- Exact blur/tint values (tune in implementation; `backdrop-filter` approximation labelled as such).

## Out of scope

- Changing `ThemeToggle` behavior beyond visibility (already correct per `themeStore`).
