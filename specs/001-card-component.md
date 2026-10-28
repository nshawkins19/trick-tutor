# 001 — Card component

**Status:** done (deck license still to be chosen, see `public/cards/LICENSE.md`)

## Goal

Replace the text buttons (`A♠`) in `App.tsx` with a reusable `<Card>` component that looks like a real card, so the hand, the current trick, and the trick log all look like a card table. It has to look good before the image assets are picked, and switching to a different deck later should only mean changing files in `public/cards/`.

## Out of scope

- The table layout (seats, bots' face-down hands) is in [003](003-table-layout.md).
- Animations (dealing, playing a card into the trick).
- Drag-and-drop. Clicking is enough for now.
- Choosing a theme or deck at runtime.
- A two-step "select, then confirm" play. Revisit when the tutorial needs it.

## Design

### Files

```
public/cards/
  spades-2.svg … spades-14.svg     # 52 faces, named by Card.id
  hearts-2.svg … clubs-14.svg
  back.svg                         # shared card back
  dark/                            # same 53 names, used under prefers-color-scheme: dark
  LICENSE.md                       # where the deck came from + its license
src/ui/components/Card/
  Card.tsx                         # <Card> and <CardBack>
  card.css                         # sizing, CSS-drawn faces, visual states
  cardAssets.ts                    # pure helpers, no React
  cardAssets.test.ts
```

Image files are named exactly `${card.id}.svg`, so looking up an image needs no mapping table. If the deck we download uses other names (`AS.svg`, `ace_of_spades.svg`), we rename the files once with a script instead of mapping names in code.

### Pure helpers (`cardAssets.ts`)

Kept apart from React so they can be tested in vitest's default node environment, without adding jsdom or testing-library:

```ts
CARD_IMAGES_AVAILABLE: boolean      // false until public/cards/ is filled in
cardImagePath(card: Card): string   // '/cards/spades-14.svg'
cardBackPath(): string              // '/cards/back.svg'
cardLabel(card: Card): string       // 'Ace of Spades', for alt text / aria-label
cardShortLabel(card: Card): string  // 'A♠' (moves formatCard out of App.tsx)
rankLabel(card: Card): string       // 'A', 'K', '10'
suitSymbol(suit: Suit): string      // '♠'
isRedSuit(suit: Suit): boolean
```

`CARD_IMAGES_AVAILABLE` is a single switch. While it's `false`, cards are drawn in CSS and no image requests are made, so the console doesn't fill with 53 404 errors. Turning it on is the only code change needed once an asset deck lands.

### Component props

```ts
interface CardProps {
  card: Card;
  size?: 'sm' | 'md';               // default 'md'
  disabled?: boolean;               // visible but not playable (illegal right now)
  onPlay?: (card: Card) => void;    // present → clickable <button>; absent → display-only <div>
}

interface CardBackProps {
  size?: 'sm' | 'md';
}
```

Face-down cards get their own `<CardBack>` component instead of a `faceDown` flag on `<Card>`. That way a face-down card never receives a `Card` at all, so a bot's hand can't leak rank or suit into the DOM through an `aria-label` or a `key`.

### Rendering

- The root element is a `<button>` when `onPlay` is given and a plain `<div>` otherwise, so a card in the trick log can't be focused with Tab.
- When images are available it shows an `<img>` using `cardImagePath`; if the image fails to load (`onError`), it falls back to the CSS face. Otherwise it renders the CSS face directly: a rank and suit in two opposite corners plus a large suit symbol in the middle.
- Size comes from one CSS variable, `--card-width`, with height set by `aspect-ratio: 5 / 7`. `size` picks it, and a parent can resize cards by setting `--card-md` / `--card-sm`.
- A playable card lifts slightly on hover and on keyboard focus.

## Acceptance criteria

**Helpers** (unit tests in `cardAssets.test.ts`)

- **AC-1** `cardImagePath` returns `/cards/${card.id}.svg` for all 52 cards in `buildDeck()`.
- **AC-2** `cardLabel` gives a correct English name for face and number cards: rank 14 is `Ace of Spades`, rank 11 is `Jack of Hearts`, rank 10 is `10 of Clubs`.
- **AC-3** `cardShortLabel` gives the same output the old `formatCard` did for every card (no change in behavior when it moves).
- **AC-4** All 52 `cardLabel` values are unique.

**Component** (checked by hand in `npm run dev`; automated later if we add testing-library)

- **AC-5** `<CardBack>` shows only the back, and its accessible name is just "Face-down card".
- **AC-6** A disabled card is visibly dimmed, can't be clicked, and is skipped by Tab.
- **AC-7** A playable card is reachable with Tab and can be played with Enter or Space.
- **AC-8** With `CARD_IMAGES_AVAILABLE = false`, every card renders its CSS face, and hearts and diamonds are red.
- **AC-9** The UI uses `<Card>` for the hand, the current trick, and the trick log, and `formatCard` is gone from `App.tsx`.

**Assets** (once a deck is chosen)

- **AC-10** `public/cards/` and `public/cards/dark/` each have 53 images (52 faces + `back.svg`). A test checks that every `cardImagePath` from `buildDeck()` exists in both; it's skipped while `CARD_IMAGES_AVAILABLE` is `false`.
- **AC-11** The deck's license (CC0 or public domain preferred) is recorded in `public/cards/LICENSE.md` with a link to the source.

## Resolved questions

1. **Props shape:** `onPlay` present or absent decides whether a card is clickable, `disabled` marks an illegal play, and face-down cards use `<CardBack>`.
2. **Hover:** playable cards lift on hover and focus. A two-step "select, then confirm" play is deferred to the tutorial work.
3. **Fallback:** a CSS-drawn card (corner indexes plus a large suit symbol), not plain text.
