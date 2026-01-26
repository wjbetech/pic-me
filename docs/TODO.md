## To-do List

- [x] Restore `MultiChoice.tsx` and fix errors
  - Restore the full implementation to `src/components/MultiChoice/MultiChoice.tsx` (replacing the temporary stub) and ensure imports/state hooks compile without errors. Verify `BackButton` usage remains intact.

- [x] Sync local branches with remotes
  - Fetch all remotes and fast-forward local branches where possible.

- [ ] Implement homepage collage (deferred)
  - Create a responsive image collage on the main page using remote thumbnails or a hosted image service. Deferred until core gameplay features are prioritized.

- [x] Implement Open Answer game mode
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

### Mobile responsiveness TODOs

- [x] Reduce mobile button sizes in Multiple Choice
  - Adjust Next/Back button sizes, spacing, and layout in `src/components/MultiChoice/MultiChoice.tsx` for small screens. Reduce font-size and padding for mobile, stack buttons compactly, and scale down `Multiple Choice` title and `Score` text at small breakpoints.

- [x] Auto-focus Open Answer input on load
  - When `OpenAnswer` mounts, focus the input (use `useRef` + `autoFocus` fallback) so users can start typing immediately. Ensure this works across iOS and Android browsers.

- [x] Ensure mobile keyboard doesn't impede UI in Open Answer
  - When keyboard opens on mobile, ensure layout keeps the input visible: use viewport-safe-height container, avoid fixed-position elements overlapping input, and consider `scrollIntoView({behavior:'smooth'})` when input receives focus.

- [ ] Make mode picker horizontally scrollable
  - Make the Pick-a-mode mini-menu horizontally scrollable on narrow screens (use `overflow-x-auto` with `-mx-4` paddings and `whitespace-nowrap` on the item container). Add touch-friendly `scroll-snap` optional enhancement.

- [ ] Scale Hangman keyboard for small screens
  - Reduce per-letter button size on small screens: update keyboard CSS (responsive `w-` classes and `btn-sm`) and ensure layout wraps without clipping when vertical space is limited. Test portrait mobile in common heights.

- [ ] [Mobile] Hangman containment + padding
  - Scale down Hangman UI slightly on small viewports, increase letter-button padding for fat-finger safety, ensure the Menu/Back button remains visible after the first animal loads, and reduce/eliminate vertical scroll on common phone sizes. Edit `src/components/Hangman/Hangman.tsx` responsive classes and keyDims calculation.

- [ ] Add Try/Go button to Open Answer
  - Add a visible `Try` (or `Go`) button adjacent to the Open Answer input in `src/components/OpenAnswer/OpenAnswer.tsx` so mobile users can submit answers without relying on the keyboard action key.

- [ ] Scale down 'Pick a game mode!' title for mobile
  - Reduce mode-picker title size and add bottom margin so the mode picker fits without vertical scrolling on phones. Update `src/components/Main/Main.tsx` styling to compact spacing and scale text on small breakpoints.

- [ ] Show all four MultiChoice options on mobile
  - Fix `src/components/MultiChoice/*` responsive CSS so all four answer options display on small screens. Reduce option font-size/padding, adjust grid/wrap behavior, and avoid clipping or overflow so users always see four choices.

- [ ] Responsive QA & verification
  - Run manual QA on common breakpoints (360x800, 375x812, 412x915, 768x1024, 1366x768, 1920x1080). Verify keyboard visibility, scrolling, and spacing; update styles as needed and commit fixes.
