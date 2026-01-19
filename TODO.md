## To-do List

1. Refactor larger components or pages into their own components or sub-components
   - [x] Identify largest components by LOC and props
   - [x] Create branch `feat/refactor-components`
   - [x] Create a `components/` subfolder for extracted pieces
   - [x] Create a `components/` subfolder for extracted pieces
   - [x] Move JSX + styles into new component files
   - [ ] Update imports and run the build to verify
   - [ ] Add unit or smoke tests for refactored pieces

   Branch suggestion: `feat/refactor-components`

2. Fix the Choose a game mode screen into three headers that spawn their own dropdowns
   - [ ] Sketch header + dropdown UX layout (mobile/desktop)
   - [ ] Implement header components with accessible buttons
   - [ ] Implement dropdown components (keyboard + focus management)
   - [ ] Integrate with `GameOptions` state and persist selection
   - [ ] QA interactions and visual styling across themes

   Branch suggestion: `feat/game-options-headers`

3. Fix the home page to be more relevant to the actual app
   - [ ] Audit content to identify outdated copy and links
   - [ ] Update hero section with concise app description and CTA
   - [ ] Add screenshots or animated GIFs of gameplay
   - [ ] Ensure responsive layout and accessibility (aria labels)
   - [ ] Run visual tests in both light and dark themes

   Branch suggestion: `feat/homepage-update`

4. Fix styling errors between light and dark
   - [ ] Create a theme checklist (colors, borders, shadows, contrast)
   - [ ] Inspect components in both themes and list mismatches
   - [ ] Update Tailwind/DaisyUI theme overrides as needed
   - [ ] Add CSS variables for problematic tokens if required
   - [ ] Verify contrast ratios and fix failing elements

   Branch suggestion: `fix/theme-styling`
