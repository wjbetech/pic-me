## To-do List

3. Fix the home page to be more relevant to the actual app
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

4. Fix styling errors between light and dark
   - [ ] Create a theme checklist (colors, borders, shadows, contrast)
      - [ ] Consider a /src/styles directory for handling app-wide styling
        - [ ] --color-surface, --color-on-surface, --color-accent
      - [ ] Update ```tailwind.config.js``` to reflect those changes
   - [ ] Inspect components in both themes and list mismatches
   - [ ] Update Tailwind/DaisyUI theme overrides as needed
   - [ ] Add CSS variables for problematic tokens if required
   - [ ] Verify contrast ratios and fix failing elements
   - [ ] QA interactions and visual styling across themes

   Branch suggestion: `fix/theme-styling`
