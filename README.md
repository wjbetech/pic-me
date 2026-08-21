# PicMe

A client-only web game for learning animal names: see a photo, name the animal. Three modes — **Multiple Choice**, **Hangman**, and **Open Answer** — over a static dataset of 122 animals (A–Z). Built for equal use on desktop and mobile browsers.

## Tech stack

React 19 · TypeScript (strict) · Vite 7 · Tailwind CSS v4 + daisyUI 5 · zustand · framer-motion

No backend: all data is static JSON (`src/data/`), all persistence is browser storage.

## Getting started

```bash
npm install
npm run dev       # dev server with HMR
npm run build     # type-check (tsc -b) + production build
npm run preview   # serve the production build
npm run lint
```

> Windows/PowerShell note: if `npm` is blocked by execution policy, use `npm.cmd`.

## Documentation

| Document | Purpose |
|---|---|
| [`docs/HANDOFF.md`](docs/HANDOFF.md) | **Authoritative engineering brief**: current architecture, persistence model, known debt, phased roadmap, acceptance criteria |
| [`docs/TODO.md`](docs/TODO.md) | Active work checklist (mapped to roadmap phases) |
| [`docs/MILESTONES.md`](docs/MILESTONES.md) | Append-only log of completed milestones |
| [`src/data/appendix.md`](src/data/appendix.md) | Animal images flagged for quality improvement |

## Deployment

Hosted on [Vercel](https://vercel.com) with zero-config Vite detection.
