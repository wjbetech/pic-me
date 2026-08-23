# Inbox

Dump anything you notice while using or building pic-me: bugs, UX friction, copy that feels wrong, follow-ups.

Write in any shape. Dated bullets are enough. Do not tidy this file yourself.

**End of day (~23:00 KST):** tell the agent `refurbish the inbox` (or `end of day`). It sorts Open lines into the [TODO](../docs/TODO.md), Known Issues, or a `.scratch/` ticket — then clears what it placed. Do not ask for a refurbish at other hours unless you mean `refurbish now`. See [issue-tracker](../docs/agents/issue-tracker.md) → End-of-day inbox. It will then clean up the `inbox.md` document as well so that it's ready to take on new items discovered during development and testing the next day.

## Open

### 23/08/2026

#### Home Page

- Navbar should be redesigned and ideally made transparent.
  - We need to find a way to ensure that elements inside the navbar continue to be visible regardless of what animal and environment is currently rendered on the home page.
    - The default navbar could be re-styled to be significantly more stylish and modern.
    - It could turn to a glass effect with scrolling so, or we can leave it at the top of the page and add actions to the content of the page to push user back towards the main CTAs.
- The app doesn't need to tell the user that it is 'free, no sign up, no ads', remove this chunk.
- Let's make the 'Learning animal names is hard. We made it a game' text bigger, and perhaps use a more unique font.
- The 'Start Playing' button should use a new font as well, something approachable and educational but less flat and underwhelming.
  - Also remove the dark shadow underneath it.
- Hide the scrollbar on the animal image carousel.

#### 'Pick a game mode!' screen

- Redesign this page to thematically match the home page more. The content should flow very organically.
- Ensure very strong contrast in design for both light and dark themes.
- Use design skills (either in the codebase, on my machine, or find online) along with Matt Pocock grill-me and wayfinder skills in order to decide on how best to implement this screen.
- The options/current functionality are great, just redesign the page to match the app.

#### Game page

- Run a full and extremely thorough check on how this page stands up on mobile versions, and come up with any improvements we can make in order to improve the user experience.
- There are some clipping graphics, for example the 'Next Animal' button that pops up when you win a round has its glow effect cut off below it, by the chunk with the 'Back to Menu' button
- The modal for leaving the current game works just fine but it also needs further redesign to look like the rest of the app and feel a lot more professional and modern.

#### Bugs

- It seems like the images are not loading properly in the multiple choice game mode.
- The game settings screen always defaults to the previous toggled game mode regardless of which of the three game mode cards you pick in the home page.

#### Further

- I would like to draft more settings for each of the game modes, and then consider the actual user flow for each of those if they are implemented.
  - Number of rounds.
  - Animal difficulty.
  - etc.
