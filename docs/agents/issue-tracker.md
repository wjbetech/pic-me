# Issue tracker: Local Markdown

Issues and specs for this repo live as markdown files in `.scratch/`.

Capture raw notices (bugs, UX friction, “this doesn’t feel right”) in [`.scratch/inbox.md`](../../.scratch/inbox.md) while you work. The inbox is not remaining work until an **end-of-day refurbish** (below) places a line.

## End-of-day inbox

**When:** around **23:00 KST** (window 22:00–23:59 Asia/Seoul). Dump into the inbox at any hour. Do **not** promote Open lines into [`roadmap.md`](../development/roadmap.md) during a development slice or at other hours.

If the user says **`refurbish the inbox`** or **`end of day`** outside that window, do not sort yet. Confirm it is not 23:00 KST and wait, unless they explicitly say **`refurbish now`**.

When the ritual runs (in-window, or `refurbish now`):

1. Read `.scratch/inbox.md` Open lines. Do not wait for them to be well-written.
2. Sort each line. Show the sort, then apply it:
   - **Roadmap checkbox** — sequenced remaining product work that fits an open phase (or Known Issues if it is debt / a bug that is not a phase goal).
   - **Already covered** — drop the line; do not duplicate.
   - **Needs a decision** — vision / non-goal / ADR conflict, or unclear intent. Leave the line in the inbox with one clarifying question. Do **not** add it to the roadmap.
   - **`.scratch/` ticket** — only if the work is specified enough to implement and is not just a one-line checkbox.
3. Use glossary terms from `CONTEXT.md` on anything you write into the roadmap.
4. Clear promoted lines from Open. Leave only unresolved / needs-decision items.
5. Do not implement during a refurbish unless the user also asked to build.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` — never a single combined tickets file
- Triage state is recorded as a `Status:` line near the top of each issue file (see Triage labels below)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## Triage labels

Canonical `Status:` values:

| Label             | Meaning                                  |
| ----------------- | ---------------------------------------- |
| `needs-triage`    | Maintainer needs to evaluate this issue  |
| `needs-info`      | Waiting on reporter for more information |
| `ready-for-agent` | Fully specified, ready for an AFK agent  |
| `ready-for-human` | Requires human implementation            |
| `wontfix`         | Will not be actioned                     |

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## Wayfinding operations

Used by `/wayfinder`. The map is a file with one child file per ticket.

- Map: `.scratch/<effort>/map.md` — the Notes / Decisions-so-far / Fog body.
- Child ticket: `.scratch/<effort>/issues/NN-<slug>.md`, numbered from `01`, with the question in the body. A `Type:` line records the ticket type (`research`/`prototype`/`grilling`/`task`); a `Status:` line records `claimed`/`resolved`.
- Blocking: a `Blocked by: NN, NN` line near the top. A ticket is unblocked when every file it lists is `resolved`.
- Frontier: scan `.scratch/<effort>/issues/` for files that are open, unblocked, and unclaimed; first by number wins.
- Claim: set `Status: claimed` and save before any work.
- Resolve: append the answer under an `## Answer` heading, set `Status: resolved`, then append a context pointer (gist + link) to the map's Decisions-so-far in `map.md`.
