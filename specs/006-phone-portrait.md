# 006 — Dedicated phone portrait layout

**Status:** done

## Goal

On a phone held upright the game fits one screen, with Safari's toolbars showing, and uses its space for the cards. Spec 005's portrait layout just stacked the desktop pieces: it scrolled, spent about 170px on a trick counter, and kept card fans that crowded the felt.

## Design

All of this applies only under `(orientation: portrait) and (max-width: 900px)`. Desktop and phone landscape are unchanged.

- **One screen:** `.game` is `100svh` tall, which is the height with the browser toolbars expanded, so nothing hides under them. Padding respects the safe-area insets.
- **Score bar:** one row, [your team] [their team] [☰]. The ☰ menu holds the "Skip bot turns" switch and **New game**; the standalone New game button and the title are hidden.
- **Felt corners:** `Table` takes a `corners` prop, which is the same `RoundInfo` the side panel uses. On phones the corners are shown (`display: contents`) and the side panel's copy is hidden, so the trick count and spades status sit top-left and "Last trick" (22px cards) top-right. Only one copy is ever displayed, so the animated last-trick cards never appear twice.
- **Seats:** no card fans and no team chips. West and East wrap "Bid 4" / "Won 1" onto two lines (the bid line is now two spans). Your seat is one slim row across the whole bottom of the felt.
- **Cards:** trick cards are `min(60px, 15vw, 9svh)` and hand cards `min(84px, (100cqi − 8px) / 5.56, 13svh)`.
- **Short phones** (height ≤ 640px, e.g. iPhone SE with toolbars): smaller trick cards, and "Last trick" in the corner drops its title and winner text (the gold outline marks the winner).

## Acceptance criteria

(checked in the browser; "collisions" means any two of seats, corner panels, and the trick area overlap)

- **AC-1** 430×740 (iPhone Pro Max with Safari toolbars): exactly one screen tall, no collisions, nothing overflowing the felt.
- **AC-2** 390×664 (iPhone with toolbars): same.
- **AC-3** 375×553 (iPhone SE with toolbars): same.
- **AC-4** The ☰ menu opens fully on screen and contains "Skip bot turns" and New game.
- **AC-5** Desktop (1280×720) and phone landscape (844×390) are unchanged: one screen tall, side panel showing round info, felt corners hidden.
