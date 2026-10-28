# Specs

One markdown file per milestone, numbered in the order we build them. A spec is written and agreed on **before** code, and its acceptance criteria become the test cases.

## Format

Each spec has these sections:

- **Status** — `draft` → `agreed` → `in progress` → `done`
- **Goal** — one or two sentences: what changes for the player
- **Out of scope** — things we're deliberately not doing yet
- **Design** — interfaces, file locations, data flow
- **Acceptance criteria** — numbered, each one checkable (`AC-1`, `AC-2`, …). Tests reference these IDs in their names, e.g. `it('AC-3: face-down card hides rank and suit', …)`
- **Open questions** — resolve these before moving the spec to `agreed`

## Index

v2 = 001 + 002 + 003.

| #   | Spec                                                       | Status      |
| --- | ---------------------------------------------------------- | ----------- |
| 001 | [Card component](001-card-component.md)                    | done |
| 002 | [Spades broken + human bidding](002-spades-rules-and-bidding.md) | done |
| 003 | [Table layout](003-table-layout.md)                        | done |
| 004 | [Play animation, paced bots, settings](004-play-animation-and-settings.md) | done |
| 005 | [Side-panel layout, no-scroll desktop, phone landscape](005-layout-side-panel.md) | done |

Planned for v3: nil / blind-nil bids, bots that read their partner's bid, first tutorial lesson and coach tips.
