# Trick Tutor

A trick-taking card game tutor web app: Vite + React 19 + TypeScript + Zustand, oxlint for linting, vitest for tests, deployed via Netlify. The folder structure (`src/games/{spades,euchre,bidwhist,ers}`, `src/ai/spades`, `src/tutorial/lessons`) shows this is planned to support multiple trick-taking games with a tutorial/coaching layer, not just Spades — Spades is the first one being built out.

## Architecture

Built engine-first: pure game logic lives in `src/engine/`, framework-agnostic (no React/Zustand imports) and written to generalize across games where reasonable, since other trick-taking games (Euchre, Bid Whist) are planned. UI comes later.

- `src/engine/types.ts` — core domain types: `Card`, `Suit`, `Rank`, `Player`, `Trick`, `Round`, `GamePhase`
- `src/engine/deck.ts` — `buildDeck()`, `shuffle()` (both done, with real test assertions)
- `src/engine/deal.ts` — `dealHands()`, `initializeRound()`
- `src/games/spades/` — rules (`logic.ts`), bidding, scoring, hints, and `interactiveRound.ts` (pure round state machine: bidding → playing)
- `src/state/gameStore.ts` — Zustand store: deal, bid, play, cumulative scoring to 500
- `src/ui/` — `components/{Card,Hand,Table,BiddingPanel,ScoreBoard}`, `screens/GameScreen.tsx`, `game.css`
- `src/ai/spades`, `src/tutorial/lessons`, `src/games/{euchre,bidwhist,ers}` — scaffolded, not yet implemented
- `specs/` — one spec per milestone; acceptance criteria IDs (`AC-n`) appear in test names

## Conventions

- Ranks are numeric 2-14 (11=J, 12=Q, 13=K, 14=A) so comparisons are just `rank > rank`
- `Card.id` is `${suit}-${rank}`, stable across shuffles, used as the React key
- `npm test` runs vitest, `npm run lint` runs oxlint, `npm run dev` starts the dev server

## Working style

The user originally implemented core engine functions themselves as a hands-on learning exercise. As of 2026-10-27 hands-on "Learn by Doing" hand-offs are **off until the user asks for them again** — build features directly. When they do turn it back on: explain what's wrong and why rather than rewriting directly, and let them apply the fix.

## Current status (as of 2026-10-27)

v2 is built (specs 001–003): Card component with CSS-drawn faces, spades-broken rule, human bidding with a suggested bid, legal-play hints, and a felt table layout. Card art is the user's own blue-and-gold "aggie" deck in `public/cards/` (light) and `public/cards/dark/`, named `${card.id}.svg`; its license is still TODO in `public/cards/LICENSE.md`. v3 candidates are listed in `specs/README.md`.
