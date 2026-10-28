# 005 — Side-panel layout, no-scroll desktop, phone landscape

**Status:** done

## Goal

Use the whole screen. Desktop fits on one screen with no scrolling, the empty margins and empty felt are put to use, phones get a real landscape layout, and the bidding panel can be tucked away.

## Design

Option B of three (A: the felt fills the whole window; B: table plus a side panel; C: a tighter version of the old layout). B was picked because it fills the empty side margins and leaves room for the coaching layer.

- **Layout:** `.game` is a fixed-height grid (`100svh`) with the main area (felt plus your hand) on the left and a 300px side panel (`.game__rail`) on the right. `#root` is now full width; it used to be a fixed 1126px column.
- **Side panel:**
  - `ScoreBoard`: team points, bags, and during a round each team's combined bid and tricks won, plus Settings and New game.
  - `RoundInfo`: trick number and whether spades are broken.
  - "Last trick" (moved off the felt).
- **Felt:** only the four seats and the current trick remain on it. Trick cards scale with the window (`clamp(52px, min(9.5svh, 9vw), 104px)`). The trick area is padded by a third of a card above and below, so the top and bottom cards (which stick out past their rows) can never land on a seat.
- **Won-trick piles:** each seat shows one slot per trick it bid: filled gold when won, dashed while still needed, orange for bags.
- **Bidding:** the panel floats over the middle of the felt (`Table` takes an `overlay`), since the trick area is empty during bidding. "Hide" shrinks it to a "Your bid · suggested N" pill, and clicking the pill brings it back.
- **Hand:** sized from the main area's width (container query units) and the screen height: `min(132px, (100cqi − 24px) / 7, 16svh)`.
- **Phone landscape** (`orientation: landscape` and height ≤ 520px): a 210px side panel without the title row and with smaller score text. The side seats run the full height of the felt, your seat moves to the bottom-left, bots' card fans are hidden, and the hand is capped at 15svh.
- **Portrait phones and tablets** (≤ 900px wide): the side panel stacks above the table as a compact header (scores, then round info next to "Last trick"), with the felt and hand below.

## Acceptance criteria

(checked in the browser at each size)

- **AC-1** 1440×900 and 1280×720: the page is exactly as tall as the screen (no scrolling) during bidding, during play, and on the round summary. No empty side margins.
- **AC-2** 844×390 (phone landscape): no page scrolling; the felt, hand, scores, and last trick are all visible, and the bidding panel fits on the felt.
- **AC-3** 390×844 (phone portrait): fits the screen height with no horizontal scrolling.
- **AC-4** Each seat's won pile shows its bid, with won tricks filled and bags colored differently.
- **AC-5** "Hide" collapses the bidding panel to a pill that doesn't cover your seat, and the pill brings it back.
