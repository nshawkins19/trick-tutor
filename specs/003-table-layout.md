# 003 — Table layout

**Status:** done

## Goal

Turn the stacked text screen into a card table: your hand fanned along the bottom, the three bots seated around a green felt, the current trick in the middle, and a scoreboard on top. Following the game should be possible without reading a log.

## Out of scope

- Animations, timed delays, sounds.
- A settings screen or player names you can change.
- Tutorial overlays (`TutorialOverlay`, `CoachTip`) beyond the one-line hint from [002](002-spades-rules-and-bidding.md).

## Design

### Seats

Play goes clockwise, so seen from your chair:

| Player | Seat   | Name    | Team |
| ------ | ------ | ------- | ---- |
| 0      | bottom | You     | A    |
| 1      | left   | West    | B    |
| 2      | top    | Partner | A    |
| 3      | right  | East    | B    |

Seat info lives in one `SEATS` table in `src/ui/components/Table/seats.ts`, so no component hard-codes a name or position.

### Components

```
src/ui/components/
  Card/          <Card>, <CardBack> (spec 001)
  Hand/          <Hand cards legal? onPlay?>   fanned, sorted ♠ ♥ ♣ ♦, low → high
  Table/         <Table round>                 seats + center trick + last trick
  BiddingPanel/  <BiddingPanel round onBid>    0–13 buttons, suggested bid highlighted
  ScoreBoard/    <ScoreBoard teams dealerId>, <RoundSummary entry>
src/ui/screens/
  GameScreen.tsx                               puts it all together; App.tsx just renders it
```

- **Seat badge:** name, team, "Bid n · Won m" (or "Bidding…" or "—" before they've bid), a small stack of `<CardBack>`s with a count, and a highlight when it's that seat's turn. Shows a "Dealer" chip.
- **Center trick:** each play sits on the side of the table it came from.
- **Last trick:** bots play instantly, so a trick can finish and the next one start before you've seen it. A small "Last trick" panel always shows the most recently completed trick and who won it.
- **Status line** above your hand: during bidding, "Your bid"; during play, the `explainLegalPlays` sentence.
- **Bidding panel:** shows the bids made so far, buttons 0–13, and highlights `estimateBid(yourHand)` as "Suggested" with a one-line reason.
- **Between rounds:** `<RoundSummary>` (bids vs. tricks, points, and the trick log using small `<Card>`s) plus a "Deal next round" button.
- **Game over:** a winner banner and "New game."

### Layout

- A CSS grid with three columns and three rows: top seat in the middle of the top row, left and right seats on the sides, trick in the center.
- On narrow screens (≤ 640px) the side seats shrink to badges with no card stacks, and the hand overlaps more so 13 cards fit in 375px with no horizontal scroll.
- The felt and card faces look the same in light and dark mode; the page around them follows the theme variables in `index.css`.

## Acceptance criteria

(checked by hand in `npm run dev` at desktop width and at 375px)

- **AC-1** You're at the bottom; West, Partner, and East are left, top, and right, with team labels.
- **AC-2** Bots' hands show only card backs, and the counts drop as they play.
- **AC-3** The current trick shows each card on its player's side.
- **AC-4** After a trick finishes, "Last trick" shows its four cards and the winner, even if the bots have already started the next trick.
- **AC-5** The seat whose turn it is is highlighted.
- **AC-6** During bidding, the panel shows the bids made so far and a suggested bid, and clicking a number starts play.
- **AC-7** Illegal cards in your hand are dimmed and the status line explains why.
- **AC-8** After the 13th trick, the round summary appears with updated team scores.
- **AC-9** At 375px wide, all 13 cards are visible with no horizontal page scroll.
- **AC-10** `npm test`, `npm run lint`, and `npm run build` all pass.
