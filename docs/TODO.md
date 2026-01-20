## To-do List

2. Fix the Choose a game mode screen into three headers that spawn their own dropdowns
   - [X] Sketch header + dropdown UX layout (mobile/desktop)
   - [X] Implement header components with accessible buttons
   - [X] Implement dropdown components (keyboard + focus management)
   - [X] Integrate with `GameOptions` state and persist selection
   - [ ] Ensure refreshing the Choose a game mode screen does not reset selected options (persist state)
   - [ ] Restyle the title 'Choose a game mode' to match updated design across breakpoints
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
