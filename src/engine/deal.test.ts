import { describe, it, expect } from 'vitest';
import { buildDeck, shuffle } from './deck';
import { dealHands } from './deal';

describe('deal', () => {
  it('dealHands distributes all 52 cards evenly across 4 players', () => {
    const deck = shuffle(buildDeck());
    const hands = dealHands(deck);

    // 1. each player receives exactly 13 cards
    expect(hands[0]).toHaveLength(13);
    expect(hands[1]).toHaveLength(13);
    expect(hands[2]).toHaveLength(13);
    expect(hands[3]).toHaveLength(13);

    // 2. all 52 cards are distributed (total across all hands equals 52)

    expect(hands[0].length + hands[1].length + hands[2].length + hands[3].length).toBe(52);

    // 3. no card appears in multiple hands (all card ids are unique across all hands)
    const allCards = [...hands[0], ...hands[1], ...hands[2], ...hands[3]];
    const uniqueCardIds = new Set(allCards.map((c) => c.id));
    expect(uniqueCardIds.size).toBe(52);

  });
});
