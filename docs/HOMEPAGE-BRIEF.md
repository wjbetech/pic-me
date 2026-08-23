# PicMe Homepage Redesign — Design Brief

## Design Read
Dual-audience landing page (kids play / parents approve) for a free, no-signup browser
animal-naming game — sticker-book playful language, real wildlife photography as the
visual identity, built on daisyUI 5 tokens so light/dark themes both work.

## Dials
DESIGN_VARIANCE 6–7 · MOTION_INTENSITY 6 · VISUAL_DENSITY 3

## Decisions made (owner, 2026-08-22)
1. **Audience:** Dual-track equal weight — hero speaks to kids; parent section gets equal design weight below the fold.
2. **Signature:** Photo showcase — big animal photography + scrolling collage/marquee (our unique asset vs mascot competitors).
3. **Inventory:** Five sections (below).
4. **Art direction:** Sticker-book playful — Fredoka or Baloo 2 display + Nunito body (self-hosted @fontsource), ONE saturated accent, thick-border sticker buttons matching in-game daisyUI buttons, flat surfaces, no gradients/glass.
5. **Motion:** Moderate 6/10 — orchestrated hero entrance, marquee (pauses on hover, static under reduced-motion), gentle card lifts, springy CTA. Everything collapses under prefers-reduced-motion.
6. **Copy:** Benefit-led (Duolingo ABC cadence) — parent-persuasion framing. Honest claims only: free, no sign-up, no ads, three game modes, spelling/vocabulary practice. No fake stats/awards. Single CTA label page-wide ("Start Playing").

## Section inventory
1. **Hero** — full-bleed animal photo, benefit-led headline (≤2 lines) + ≤20-word subtext + Start Playing
2. **Photo marquee** — scrolling animal-photo strip (the signature texture; the page's one perpetual motion)
3. **Three ways to play** — Multiple Choice / Open Answer / Hangman tiles (bridges kids→parents)
4. **For grown-ups** — honest-fact tiles: Free · No sign-up · No ads · Learning through play
5. **Footer** — quiet links

## Hard constraints (from design skills + kids' products override)
- WCAG AA minimum contrast (AAA target hero), both themes tested
- Big touch targets; reduced-motion collapses ALL animation
- Marquee max-one-per-page; eyebrow restraint (≤1 total); no duplicate CTA intent
- Real photos only — no fake screenshots, no hand-rolled mascots
- Fonts self-hosted (@fontsource), never Google Fonts <link>
