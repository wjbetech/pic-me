# Game-mode screen visual language — how photo-showcase translates

Status: resolved
Type: grilling

## Answer

Card-forward sticker sheet. The screen reuses the homepage's **tokens** — Fredoka display, Nunito body, `border-4 border-base-content`, flat `bg-base-*` surfaces, one saturated accent — not its **photos**. The hero's full-bleed animal photography stays exclusive to the homepage; this screen earns its "same app" feel from shared typography and sticker-card language. Contrast for accent buttons is handled by paired `text-*-content` tokens + `font-semibold` + `border-base-content` edge, per your clarification that the requirement is button/text scoped.

## Question

How does the homepage's photo-showcase + sticker-book language (Fredoka display, thick-border sticker cards, one saturated accent, flat surfaces) translate to the "Pick a game mode!" screen — which today is `bg-base-100 rounded-lg border` with `ModeTabs` and three settings panels?

We need to decide: full-bleed photo background like Hero, or restrained card language that *echoes* the hero without competing; where the animal photography appears (header? Mode Card previews? subtle scrim?), and how `GameOptions/OptionHeader` copy typography scales to Fredoka.

Strong contrast in both themes is a hard constraint — today's `bg-base-100` card on `bg-base-300` page already passes, but the new direction must not regress it.
