import type { Card, Suit } from '../../../engine/types';

// Alternate colors so neighbouring suits are easy to tell apart.
const SUIT_ORDER: Record<Suit, number> = { spades: 0, hearts: 1, clubs: 2, diamonds: 3 };

/** Sort a hand by suit (♠ ♥ ♣ ♦), then low → high. Returns a new array. */
export function sortHand(cards: Card[]): Card[] {
  return [...cards].sort((a, b) =>
    a.suit === b.suit ? a.rank - b.rank : SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit]
  );
}
