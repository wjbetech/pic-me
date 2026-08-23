# Transparent navbar — visibility guarantee

Status: resolved
Type: grilling

## Answer

Scrim strip + white-with-shadow. Navbar is `bg-transparent` at scroll 0 over a `h-16 bg-gradient-to-b from-black/35 to-transparent` strip behind it; wordmark and toggle are `text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]`. Hero's own dark scrim is strongest at the bottom, so the dedicated top strip is what guarantees AA over light fur/sky photos in both themes.

## Question

How do we make the default (top-of-page, over the hero photo) navbar transparent while guaranteeing its elements (PicMe wordmark, ThemeToggle) stay visible over *any* animal/environment photo — and *not* reintroduce an opaque `bg-base-100` that we just removed?

Context: `src/components/Navbar/Navbar.tsx:3` currently `bg-base-100 shadow-md`. Hero is full-bleed animal photography with a dark scrim (`src/components/home/Hero.tsx:48`). Making the navbar `bg-transparent` over that scrim risks invisible `text-warning`/`text-base-content` elements on light animal fur vs dark forest backgrounds.

Options on the table from inbox:
- Default transparent, restyled to be more stylish/modern (current line)
- Turns to glass effect on scroll (backdrop-blur), or stays top-fixed while page content pushes user back to CTAs

We must choose one and define the scrim/border rule that works in both `light --cymk` and `dark --dracula` themes.

## Blocked by:

## Answer

<!-- grilling agent appends resolution here, then set Status: resolved and link gist to map.md Decisions so far -->
