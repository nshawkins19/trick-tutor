# 002 — Spades broken + human bidding

**Status:** done

## Goal

Close the two biggest gaps between the game and real Spades. First, you can't lead a spade until spades are "broken." Second, you choose your own bid instead of having one estimated for you. The game also starts explaining *why* a card can't be played, which is the first bit of tutoring.

## Out of scope

- Nil and blind-nil bids (a bid of 0 here just counts toward the team total). Planned for v3.
- Bots that react to other players' bids. Bots still bid with `estimateBid` on their own hand.
- Animated or delayed bot turns.

## Design

### Spades broken

- Spades become **broken** the first time any spade is played on any trick, whether it's led or played as trump on another suit.
- `getLegalPlays(hand, leadSuit, spadesBroken)` gains a required third argument. When leading (`leadSuit === null`) with spades not broken, the legal plays are every non-spade card, **unless the hand is all spades**, in which case any card is legal. The follow-suit rule doesn't change, and playing a spade when you're out of the lead suit is always legal.
- `chooseCardToPlay`'s context object gains `spadesBroken`. Its type is renamed from `BidContext` to `PlayContext`, since it's no longer only about the bid.
- `InteractiveRoundState.spadesBroken: boolean` starts `false`, and `applyCardPlay` sets it once a spade is played.

### Bidding phase

- `InteractiveRoundState` gains `phase: 'bidding' | 'playing'`, and `bids` becomes `Partial<Record<PlayerId, number>>` (filled in during bidding).
- `startInteractiveRound` returns `phase: 'bidding'` with `currentPlayer` to the dealer's left and no bids yet.
- `placeBid(state, bid)` records `bid` for `currentPlayer` and moves on to the next bidder. After the fourth bid it switches to `phase: 'playing'`, with `currentPlayer` back to the dealer's left. It throws if the phase is wrong or the bid isn't a whole number from 0 to 13.
- `advanceBots` now handles both phases. A bot's bidding turn uses `estimateBid`, and a bot's playing turn uses `chooseCardToPlay`. It stops whenever it's the human's turn in either phase, or when the round ends.
- `completedBids(state)` returns a full `Record<PlayerId, number>` for scoring, and throws if any bid is missing.
- The store gains `placeBid(bid)`, which does nothing unless it's the bidding phase, it's the human's turn, and the bid is valid. `playCard` does nothing during the bidding phase.

### Explaining legal plays

`explainLegalPlays(hand, leadSuit, spadesBroken): string` in `src/games/spades/hints.ts` returns one sentence for the human's turn:

| Situation                                   | Message (roughly)                                                   |
| ------------------------------------------- | ------------------------------------------------------------------- |
| Leading, spades not broken, has non-spades  | Spades aren't broken yet, so lead any other suit.                   |
| Leading, spades not broken, only spades     | You only have spades left, so you may lead one.                     |
| Leading, spades broken                      | You're leading — play any card.                                     |
| Following, has the lead suit                | You must follow suit: play a ♥.                                     |
| Following, out of the lead suit             | You're out of ♥ — play anything, or trump with a spade.             |

## Acceptance criteria

**Rules** (`logic.test.ts`)

- **AC-1** Leading with spades not broken and a mixed hand: no spades are legal.
- **AC-2** Leading with spades not broken and an all-spade hand: every card is legal.
- **AC-3** Leading with spades broken: every card is legal.
- **AC-4** Out of the lead suit with spades not broken: spades are legal (you can trump before spades are broken).
- **AC-5** A bot never leads a spade before spades are broken unless it holds only spades.

**Round** (`interactiveRound.test.ts`)

- **AC-6** `spadesBroken` starts `false` and becomes `true` on the first spade played.
- **AC-7** A new round starts in `bidding` with no bids, and the dealer's left bids first.
- **AC-8** `advanceBots` fills in bots' bids up to the human's turn and stops there.
- **AC-9** After four `placeBid`s, the phase is `playing` and the dealer's left leads.
- **AC-10** `placeBid` throws for -1, 14, 2.5, and when called during the playing phase.
- **AC-11** A full round played through bidding and 13 tricks never contains an illegal lead.

**Store** (`gameStore.test.ts`)

- **AC-12** `dealRound` stops on the human's bid, with the bots before them already bid.
- **AC-13** `playCard` does nothing during bidding, and `placeBid` does nothing during playing.

**Hints** (`hints.test.ts`)

- **AC-14** Each row of the table above has a test.
