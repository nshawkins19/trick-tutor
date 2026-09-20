import { describe, it, expect } from 'vitest';
import type { Card } from '../../engine/types';
import { estimateBid, collectBids } from './bidding';

function card(suit: Card['suit'], rank: Card['rank']): Card {
  return { suit, rank, id: `${suit}-${rank}` };
}

describe('Spades bidding', () => {
  it('estimateBid counts aces, kings, and queen of spades', () => {
    const hand = [
      card('hearts', 14), // Ace -> +1
      card('clubs', 13), // King -> +1
      card('spades', 12), // Queen of Spades -> +1
      card('diamonds', 5),
    ];
    expect(estimateBid(hand)).toBe(3);
  });

  it('estimateBid adds bonus for extra spades beyond 3', () => {
    const hand = [
      card('spades', 2),
      card('spades', 3),
      card('spades', 4),
      card('spades', 5),
      card('spades', 6), // 5 spades total, 2 beyond the baseline of 3
      card('hearts', 4),
    ];
    expect(estimateBid(hand)).toBe(2);
  });

  it('estimateBid never exceeds the number of cards in hand', () => {
    const hand = [card('spades', 14), card('spades', 13), card('spades', 12)];
    expect(estimateBid(hand)).toBeLessThanOrEqual(hand.length);
  });

  it('collectBids returns a bid for all 4 players', () => {
    const hands = {
      0: [card('hearts', 14)],
      1: [card('clubs', 2)],
      2: [card('diamonds', 3)],
      3: [card('spades', 4)],
    };
    const bids = collectBids(hands, 0);
    expect(Object.keys(bids)).toHaveLength(4);
    expect(bids[0]).toBe(1); // Ace of hearts
    expect(bids[1]).toBe(0); // low club, no bonus
  });
});
