import type { Card, PlayerId } from './types';

export function dealHands(deck: Card[]): Record<PlayerId, Card[]> {
  const hands: Record<PlayerId, Card[]> = { 0: [], 1: [], 2: [], 3: [] };

  // TODO(human): deal `deck` round-robin into `hands` — one card at a time
  // per player, in player order (0, 1, 2, 3, 0, 1, 2, ...), until the deck
  // is exhausted. For a standard 52-card deck this gives each player 13
  // cards, but round-robin also handles a deck that doesn't divide evenly.

  return hands;
}
