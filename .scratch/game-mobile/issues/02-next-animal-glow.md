# Next Animal glow clipped by Back to Menu chunk

Status: resolved
Type: bug

## Question

Why is the `ring-glow` (RGB box-shadow) on the `Next Animal` button cut off by the chunk containing the `Back to Menu` button below it?

Fix the overflow/clipping without breaking the vertical rhythm on mobile. The glow is a box-shadow on `src/components/Hangman/GameMessages.tsx` and `src/components/MultiChoice/MultiChoice.tsx:578` — the parent's `overflow-hidden` or tight `gap` is the suspect.


## Answer

**Two mechanisms, both fixed:**

1. **Hangman (paint clip):** the win-message wrapper (GameMessages.tsx:29) uses overflow-hidden + max-h-* for its collapse animation - the glow painted outside the wrapper's box was clipped at its bottom edge, right where the Back to Menu chunk sits. Fix: when won, add pb-16 bottom padding (glow spread ~48px now paints inside the box) and bump max-h-56 to max-h-64 so the extra padding fits the cap.
2. **MultiChoice + Hangman lost-state (paint order):** the glow is painted under the opaque BackButton (bg-warning) that follows it in DOM order - later siblings' backgrounds paint over earlier siblings' box-shadows. Fix: relative z-10 on all three ring-glow wrappers lifts the glow above following siblings.

No layout rhythm changed - padding is inside the existing animated wrapper; z-10 is paint-only.
