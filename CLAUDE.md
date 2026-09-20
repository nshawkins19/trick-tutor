# Trick Tutor

A trick-taking card game tutor web app: Vite + React 19 + TypeScript + Zustand, oxlint for linting, vitest for tests, deployed via Netlify. The folder structure (`src/games/{spades,euchre,bidwhist,ers}`, `src/ai/spades`, `src/tutorial/lessons`) shows this is planned to support multiple trick-taking games with a tutorial/coaching layer, not just Spades — Spades is the first one being built out.

## Architecture

Built engine-first: pure game logic lives in `src/engine/`, framework-agnostic (no React/Zustand imports) and written to generalize across games where reasonable, since other trick-taking games (Euchre, Bid Whist) are planned. UI comes later.

- `src/engine/types.ts` — core domain types: `Card`, `Suit`, `Rank`, `Player`, `Trick`, `Round`, `GamePhase`
- `src/engine/deck.ts` — `buildDeck()`, `shuffle()` (both done, with real test assertions)
- `src/engine/deal.ts` — `dealHands()` (in progress, see below)
- `src/games/*`, `src/ai/spades`, `src/tutorial/lessons`, `src/ui/*` — scaffolded, not yet implemented

## Conventions

- Ranks are numeric 2-14 (11=J, 12=Q, 13=K, 14=A) so comparisons are just `rank > rank`
- `Card.id` is `${suit}-${rank}`, stable across shuffles, used as the React key
- `npm test` runs vitest, `npm run lint` runs oxlint, `npm run dev` starts the dev server

## Working style

The user is implementing core engine functions (starting with the Fisher-Yates shuffle) themselves as a hands-on learning exercise. When reviewing this code, explain what's wrong and why rather than rewriting it directly — let them apply the fix.

## Current status (as of 2026-09-20)

`buildDeck()` and `shuffle()` in `deck.ts` are done and well-tested (`deck.test.ts`). Now building `dealHands()` in `deal.ts` — deals a shuffled deck round-robin into 4 hands.
