# 004 — Play animation, paced bots, settings

**Status:** done (bot pacing values are open to tuning, see `botDelayMs`)

## Goal

Every card played can be seen. Cards slide from the hand or seat that played them into the center, bots act one move at a time, and a finished trick stays on the table for a moment before moving to "Last trick". A setting turns the old instant play back on. Your own hand is bigger and always on screen.

## Design

- **Engine:** `advanceOneBot(state)` takes exactly one bot action (a bid or a card), and `advanceBots` is now a loop over it. `isBotTurn(state)` reports whether it's a bot's move.
- **Store:** `dealRound`, `placeBid`, and `playCard` no longer run the bots themselves. New actions: `advanceBot()` (one move), `runBots()` (every move up to the human's turn), and `finishRound()` (scores the round once it's over).
- **Pacing:** `useRoundPacing` in `GameScreen.tsx` drives the round. While a trick is held it waits `TRICK_HOLD_MS`; when the round is over it scores it; on a bot's turn it waits `botDelayMs(round)` and makes one move, or runs all bot moves at once when skipping.
- **Animation:** `withViewTransition(update)` wraps state changes in `document.startViewTransition` + `flushSync`. Face-up cards with `animate` get `view-transition-name: card-<id>`, so the same card glides between the hand, the trick, and "Last trick". A card with no previous position (a bot's card, a new deal) slides in from its seat (`from-left`, `from-top`, `from-right`, `from-deck`). With reduced motion turned on, or where the API is missing, the update just happens instantly.
- **Settings:** `useSettingsStore` (Zustand `persist`, saved in localStorage as `trick-tutor-settings`) with `skipBotTurns`. It's switched from a Settings menu in the scoreboard.
- **Menu pauses the game:** while Settings is open (`useSettingsStore.menuOpen`, not persisted), `useRoundPacing` schedules nothing: no bot moves, no trick pause, no scoring. The status line reads "Paused…". Tapping outside the menu or pressing Escape closes it. The panel has its own `view-transition-name` so card animations can never draw over it. (Fixes cards drawing on top of the open menu mid-trick.)
- **Hand:** pinned to the bottom of the screen with `position: sticky`. The card width scales so 13 overlapping cards fit (up to 132px on desktop, about 63px on a 375px phone).

## Acceptance criteria

- **AC-1** `advanceOneBot` makes exactly one move and does nothing on the human's turn (unit test).
- **AC-2** The store's `dealRound` doesn't run the bots; `advanceBot` makes one move; `runBots` stops at the human; `finishRound` does nothing mid-round (unit tests).
- **AC-3** With skipping off, bots bid one at a time and play one card at a time, each card sliding in from that bot's side.
- **AC-4** Your played card glides from your hand to the center.
- **AC-5** A finished trick stays in the center with the winning card highlighted and a "X won the trick" status, then moves to "Last trick".
- **AC-6** With "Skip bot turns" on, bots answer instantly, and the setting is still on after a reload.
- **AC-7** Your hand stays visible at the bottom of the screen and fits 13 cards with no horizontal scroll at 375px.
