# Next Animal glow clipped by Back to Menu chunk

Status: ready-for-agent
Type: bug

## Question

Why is the `ring-glow` (RGB box-shadow) on the `Next Animal` button cut off by the chunk containing the `Back to Menu` button below it?

Fix the overflow/clipping without breaking the vertical rhythm on mobile. The glow is a box-shadow on `src/components/Hangman/GameMessages.tsx` and `src/components/MultiChoice/MultiChoice.tsx:578` — the parent's `overflow-hidden` or tight `gap` is the suspect.
