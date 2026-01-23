## To-do List

- [x] Restore `MultiChoice.tsx` and fix errors
  - Restore the full implementation to `src/components/MultiChoice/MultiChoice.tsx` (replacing the temporary stub) and ensure imports/state hooks compile without errors. Verify `BackButton` usage remains intact.

- [x] Sync local branches with remotes
  - Fetch all remotes and fast-forward local branches where possible.

- [ ] Implement homepage collage (deferred)
  - Create a responsive image collage on the main page using remote thumbnails or a hosted image service. Deferred until core gameplay features are prioritized.

- [ ] Implement Open Answer game mode
  - Add the Open Answer mode: present a random animal, accept typed input, validate answers ignoring case/punctuation, do not show letter placeholders or hints, handle scoring and rounds, and persist progress.

- [ ] Fix MultiChoice scrolling on new-load
  - Investigate and resolve odd scrolling behavior in `MultiChoice` when loading a new animal (unexpected scroll jumps or focus issues). Add smooth scroll/placeholder sizing or cancel in-flight layout shifts.

### Existing homepage & theme TODOs (legacy items)

1. Fix the home page to be more relevant to the actual app
   - [x] Audit content to identify outdated copy and links
   - [ ] Update hero section with concise app description and CTA
     - [x] Small tweaks but unfinished
   - [ ] Add a scrolling(?) animal collage SVG/PNG with object-cover and mix-blend-mode for visual depth.
   - [ ] Add a hero gradient + stronger headline copy (implement)
   - [ ] Add Framer Motion entry animation and card hover polish
   - [ ] Add screenshots or animated GIFs of gameplay
   - [ ] Ensure responsive layout and accessibility (aria labels)
   - [ ] Run visual tests in both light and dark themes

   Branch suggestion: `feat/homepage-update`

2. Fix styling errors between light and dark
   - [ ] Create a theme checklist (colors, borders, shadows, contrast)
     - [ ] Consider a /src/styles directory for handling app-wide styling
       - [ ] --color-surface, --color-on-surface, --color-accent
     - [ ] Update `tailwind.config.js` to reflect those changes
   - [ ] Inspect components in both themes and list mismatches
   - [ ] Update Tailwind/DaisyUI theme overrides as needed
   - [ ] Add CSS variables for problematic tokens if required
   - [ ] Verify contrast ratios and fix failing elements
   - [ ] QA interactions and visual styling across themes

   Branch suggestion: `fix/theme-styling`
